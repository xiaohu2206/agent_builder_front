import { message } from 'antd';
import { useCallback, useRef, useState } from 'react';
import {
  Conversation,
  deleteConversation,
  getConversationDetail,
  getConversations,
  streamChatWithHistory,
  updateConversationTitle,
  type ChatWithHistoryRequest,
  type ConversationMessage,
} from '../../../api/agentQA';

export interface ConversationItem {
  key: string;
  label: string;
  group: string;
}

export const useConversationHistory = (userId: string = 'default-user') => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  // 格式化对话列表为UI组件需要的格式
  const formatConversationsForUI = useCallback((conversationList: Conversation[]): ConversationItem[] => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return conversationList.map(conv => {
      const updatedAt = new Date(conv.updatedAt);
      let group = '更早';
      
      if (updatedAt.toDateString() === today.toDateString()) {
        group = '今天';
      } else if (updatedAt.toDateString() === yesterday.toDateString()) {
        group = '昨天';
      } else if (updatedAt >= weekAgo) {
        group = '最近7天';
      }

      return {
        key: conv._id,
        label: conv.title,
        group,
      };
    });
  }, []);

  // 加载对话列表
  const loadConversations = useCallback(async (page: number = 1, limit: number = 50, onFirstConversationLoaded?: (messages: ConversationMessage[] | null) => void) => {
    try {
      setLoading(true);
      const response = await getConversations(userId, page, limit);
      
      if (response.success) {
        const formattedConversations = formatConversationsForUI(response.data.conversations);
        setConversations(formattedConversations);
        
        // 如果没有当前对话ID，设置第一个对话为当前对话
        if (!currentConversationId && formattedConversations.length > 0) {
          const firstConversationId = formattedConversations[0].key;
          setCurrentConversationId(firstConversationId);
          
          // 自动加载第一个对话的消息记录
          if (onFirstConversationLoaded) {
            try {
              const detailResponse = await getConversationDetail(firstConversationId, userId);
              if (detailResponse.success && detailResponse.data.messages) {
                onFirstConversationLoaded(detailResponse.data.messages);
              } else {
                onFirstConversationLoaded(null);
              }
            } catch (error) {
              console.error('加载第一个对话详情失败:', error);
              onFirstConversationLoaded(null);
            }
          }
        }
      }
    } catch (error) {
      console.error('加载对话列表失败:', error);
      message.error('加载对话列表失败');
    } finally {
      setLoading(false);
    }
  }, [userId, currentConversationId, formatConversationsForUI]);

  // 创建新对话
  const createNewConversation = useCallback(() => {
    const tempId = 'new-conversation-temp';
    const newConversation: ConversationItem = {
      key: tempId,
      label: `新对话 ${conversations.length + 1}`,
      group: '今天',
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(tempId);
    
    return tempId;
  }, [conversations.length]);

  // 发送消息（带历史记录）
  const sendMessageWithHistory = useCallback(async (
    messageContent: string,
    model: string,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    conversationTitle?: string,
    priorHistory?: ConversationMessage[],
  ) => {
    if (isTyping) return;

    try {
      setIsTyping(true);
      
      // 如果没有当前对话ID，创建新对话
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = createNewConversation();
      }

      // 组合完整历史（包含之前的 user/assistant 消息 + 本次用户消息）
      const historyMessages: ConversationMessage[] = [
        ...(priorHistory || []),
        { role: 'user', content: messageContent, timestamp: new Date().toISOString() },
      ];

      const params: ChatWithHistoryRequest = {
        userId,
        model,
        messages: historyMessages,
        // 如果是新对话（临时ID），不传递conversationId
        conversationId: conversationId === 'new-conversation-temp' ? undefined : conversationId,
        title: conversationTitle,
        stream: true,
      };

      await streamChatWithHistory(
        params,
        onChunk,
        (newConversationId) => {
          // 如果返回了新的对话ID，更新当前对话ID
          if (newConversationId && newConversationId !== conversationId) {
            setCurrentConversationId(newConversationId);
            
            // 更新对话列表中的临时对话
            setConversations(prev => 
              prev.map(conv => 
                conv.key === conversationId 
                  ? { ...conv, key: newConversationId }
                  : conv
              )
            );
          }
          
          setIsTyping(false);
          onComplete();
        },
        (error) => {
          setIsTyping(false);
          onError(error);
        }
      );
    } catch (error) {
      setIsTyping(false);
      onError(error as Error);
    }
  }, [userId, currentConversationId, isTyping, createNewConversation]);

  // 切换对话
  const switchConversation = useCallback(async (conversationId: string) => {
    if (isTyping) {
      message.error('消息正在请求中，请等待请求完成后再切换对话');
      return null;
    }

    // 取消当前请求
    abortController.current?.abort();
    
    try {
      setCurrentConversationId(conversationId);
      
      // 如果是新对话，不需要加载历史
      if (conversationId === 'new-conversation-temp') {
        return null;
      }
      
      // 加载对话详情
      const response = await getConversationDetail(conversationId, userId);
      if (response.success && response.data.messages) {
        return response.data.messages;
      }
      
      return null;
    } catch (error) {
      console.error('切换对话失败:', error);
      message.error('切换对话失败');
      return null;
    }
  }, [userId, isTyping]);

  // 删除对话
  const removeConversation = useCallback(async (conversationId: string) => {
    try {
      await deleteConversation(conversationId, userId);
      
      setConversations(prev => prev.filter(conv => conv.key !== conversationId));
      
      // 如果删除的是当前对话，切换到第一个对话
      if (conversationId === currentConversationId) {
        const remainingConversations = conversations.filter(conv => conv.key !== conversationId);
        const newCurrentId = remainingConversations.length > 0 ? remainingConversations[0].key : null;
        setCurrentConversationId(newCurrentId);
      }
      
      message.success('对话已删除');
    } catch (error) {
      console.error('删除对话失败:', error);
      message.error('删除对话失败');
    }
  }, [userId, currentConversationId, conversations]);

  // 重命名对话
  const renameConversation = useCallback(async (conversationId: string, newTitle: string) => {
    try {
      await updateConversationTitle(conversationId, userId, newTitle);
      
      setConversations(prev => 
        prev.map(conv => 
          conv.key === conversationId 
            ? { ...conv, label: newTitle }
            : conv
        )
      );
      
      message.success('对话标题已更新');
    } catch (error) {
      console.error('重命名对话失败:', error);
      message.error('重命名对话失败');
    }
  }, [userId]);

  // 停止当前请求
  const stopCurrentRequest = useCallback(() => {
    abortController.current?.abort();
    setIsTyping(false);
  }, []);

  return {
    // 状态
    conversations,
    currentConversationId,
    loading,
    isTyping,
    
    // 操作函数
    loadConversations,
    createNewConversation,
    sendMessageWithHistory,
    switchConversation,
    removeConversation,
    renameConversation,
    stopCurrentRequest,
    
    // 设置函数
    setCurrentConversationId,
    
    // 引用
    abortController: abortController.current,
  };
};