import { useXAgent, useXChat } from '@ant-design/x';
import { useCallback, useRef, useState } from 'react';

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

export const useAgentQA = () => {
  const abortController = useRef<AbortController | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [requestOptions] = useState({
    baseURL: "http://localhost:3000/api/chat/simple",
    model: 'doubao-1-5-pro-32k-250115',
  });

  // 使用 Ant Design X 的 useXAgent
  const [agent] = useXAgent<BubbleDataType>(requestOptions);

  // 使用 Ant Design X 的 useXChat
  const { onRequest, messages, setMessages } = useXChat({
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

  const loading = agent.isRequesting();

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

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || loading) return;

    if (!hasWelcomeMessage) {
      setHasWelcomeMessage(true);
    }

    onRequest({
      stream: true,
      message: { role: 'user', content: inputValue },
    });

    setInputValue('');
  }, [inputValue, loading, onRequest, hasWelcomeMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setHasWelcomeMessage(false);
    abortController.current?.abort();
  }, [setMessages]);

  const formatTime = useCallback((timestamp: Date): string => {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

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
    onRequest,
    abortController: abortController.current,
  };
};