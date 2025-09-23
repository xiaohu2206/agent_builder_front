import { useXAgent, useXChat } from '@ant-design/x';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ConversationMessage } from '../../../api/agentQA';
import { StorageService } from '../../../utils/storage';
import { useConversationHistory } from './useConversationHistory';

// 定义消息类型，兼容Ant Design X
export type BubbleDataType = {
  role: 'user' | 'assistant';
  content: string;
};

export type Message = {
  id: number;
  type: 'agent' | 'user';
  content: string;
  timestamp: Date;
};

export const useAgentQAWithHistory = () => {
  const abortController = useRef<AbortController | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [requestOptions] = useState({
    baseURL: "http://localhost:3000/api/chat/chat",
    model: 'doubao-1-5-pro-32k-250115',
  });
  // 从StorageService获取userId
  const userId = StorageService.getUserId() || 'default-user';

  // 使用对话历史管理Hook
  const {
    conversations,
    currentConversationId,
    loading: historyLoading,
    isTyping: historyIsTyping,
    loadConversations,
    createNewConversation,
    sendMessageWithHistory,
    switchConversation,
    removeConversation,
    renameConversation,
    stopCurrentRequest,
  } = useConversationHistory(userId);

  // 使用 Ant Design X 的 useXAgent
  const [agent] = useXAgent<BubbleDataType>(requestOptions);

  // 使用 Ant Design X 的 useXChat
  const { messages, setMessages } = useXChat({
    agent,
    requestFallback: (_, { error }) => {
      if (error.name === 'AbortError') {
        return {
          content: '请求已取消',
          role: 'assistant' as const,
        };
      }
      return {
        content: '请求失败，请稍后重试！',
        role: 'assistant' as const,
      };
    },
    transformMessage: (info) => {
      const { originMessage, chunk } = info || {};
      let currentContent = '';
      
      try {
        if (chunk?.data && !chunk?.data.includes('DONE')) {
          const message = JSON.parse(chunk?.data);
          currentContent = message?.choices?.[0]?.delta?.content || '';
        }
      } catch (error) {
        console.error('解析消息块失败:', error);
      }

      const content = `${originMessage?.content || ''}${currentContent}`;
      
      return {
        content: content,
        role: 'assistant' as const,
      };
    },
    resolveAbortController: (controller) => {
      abortController.current = controller;
    },
  });

  const loading = agent.isRequesting() || historyIsTyping;

  // 转换消息格式以兼容原有组件
  const convertedMessages: Message[] = messages.map((msg, index) => ({
    id: index + 1,
    type: msg.message.role === 'user' ? 'user' : 'agent',
    content: msg.message.content,
    timestamp: new Date(),
  }));

  // 添加初始欢迎消息
  const [hasWelcomeMessage, setHasWelcomeMessage] = useState(false);
  const finalMessages = hasWelcomeMessage ? convertedMessages : [
    {
      id: 0,
      type: 'agent' as const,
      content: '您好！我是您的AI助手，有什么可以帮助您的吗？',
      timestamp: new Date()
    },
    ...convertedMessages
  ];

  // 从历史消息转换为Ant Design X格式
  const convertHistoryToXMessages = useCallback((historyMessages: ConversationMessage[]) => {
    return historyMessages.map((msg, index) => ({
      id: `history-${index}`,
      message: {
        role: msg.role,
        content: msg.content,
      },
      status: 'success' as const,
    }));
  }, []);

  // 发送消息（集成历史记录）
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || loading) return;

    if (!hasWelcomeMessage) {
      setHasWelcomeMessage(true);
    }

    // 在添加用户消息之前，先从当前消息中提取“既往历史”（包含 user/assistant）
    const priorHistory: ConversationMessage[] = messages.map((m) => ({
      role: m.message.role,
      content: m.message.content,
      timestamp: new Date().toISOString(),
    }));

    // 先添加用户消息到UI
    const userMessage = {
      id: `user-${Date.now()}`,
      message: { role: 'user' as const, content: inputValue },
      status: 'success' as const,
    };
    
    setMessages(prev => [...prev, userMessage]);

    // 使用历史记录发送消息（传入 priorHistory，Hook 内部会拼上本次的 user 消息）
    sendMessageWithHistory(
      inputValue,
      requestOptions.model,
      (content: string) => {
        // 流式更新助手消息
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.message.role === 'assistant') {
            // 更新现有的助手消息 - 累积内容而不是替换
            const currentContent = lastMessage.message.content || '';
            return prev.map((msg, index) => 
              index === prev.length - 1 
                ? { ...msg, message: { ...msg.message, content: currentContent + content } }
                : msg
            );
          } else {
            // 添加新的助手消息
            return [...prev, {
              id: `assistant-${Date.now()}`,
              message: { role: 'assistant' as const, content },
              status: 'loading' as const,
            }];
          }
        });
      },
      () => {
        // 完成时更新状态
        setMessages(prev => 
          prev.map((msg, index) => 
            index === prev.length - 1 && msg.message.role === 'assistant'
              ? { ...msg, status: 'success' as const }
              : msg
          )
        );
      },
      (error: Error) => {
        console.error('发送消息失败:', error);
        // 添加错误消息
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          message: { role: 'assistant' as const, content: '抱歉，发送消息时出现错误，请稍后重试。' },
          status: 'error' as const,
        }]);
      },
      conversations.length === 0 ? '新对话' : undefined,
      priorHistory,
    );

    setInputValue('');
  }, [inputValue, loading, hasWelcomeMessage, setMessages, sendMessageWithHistory, requestOptions.model, conversations.length, messages]);

  // 切换对话
  const handleSwitchConversation = useCallback(async (conversationId: string) => {
    const historyMessages = await switchConversation(conversationId);
    
    if (historyMessages && historyMessages.length > 0) {
      // 转换历史消息并设置到UI
      const xMessages = convertHistoryToXMessages(historyMessages);
      setMessages(xMessages);
      setHasWelcomeMessage(true);
    } else {
      // 清空消息
      setMessages([]);
      setHasWelcomeMessage(false);
    }
  }, [switchConversation, convertHistoryToXMessages, setMessages]);

  // 清空聊天
  const clearChat = useCallback(() => {
    setMessages([]);
    setHasWelcomeMessage(false);
    abortController.current?.abort();
  }, [setMessages]);

  // 创建新对话
  const handleCreateNewConversation = useCallback(() => {
    if (loading) {
      return;
    }
    
    const newConversationId = createNewConversation();
    clearChat();
    return newConversationId;
  }, [loading, createNewConversation, clearChat]);

  // 删除对话
  const handleDeleteConversation = useCallback(async (conversationId: string) => {
    await removeConversation(conversationId);
    // 如果删除的是当前对话，清空消息
    if (conversationId === currentConversationId) {
      clearChat();
    }
  }, [removeConversation, currentConversationId, clearChat]);

  // 格式化时间
  const formatTime = useCallback((timestamp: Date): string => {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // 初始化时加载对话列表
  useEffect(() => {
    loadConversations(1, 50, (historyMessages) => {
      if (historyMessages && historyMessages.length > 0) {
        // 转换历史消息并设置到UI
        const xMessages = convertHistoryToXMessages(historyMessages);
        setMessages(xMessages);
        setHasWelcomeMessage(true);
      }
    });
  }, [loadConversations, convertHistoryToXMessages, setMessages]);

  return {
    // 状态
    messages: finalMessages,
    inputValue,
    isTyping: loading,
    
    // 状态更新函数
    setInputValue,
    
    // 业务逻辑函数
    handleSendMessage,
    clearChat,
    formatTime,
    handleKeyDown,
    
    // Ant Design X 相关
    agent,
    xMessages: messages,
    abortController: abortController.current,
    
    // 对话历史相关
    conversations,
    currentConversationId,
    historyLoading,
    handleSwitchConversation,
    handleCreateNewConversation,
    handleDeleteConversation,
    renameConversation,
    stopCurrentRequest,
  };
};