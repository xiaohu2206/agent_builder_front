import { request } from '../utils/request';

// 聊天消息类型
export interface ChatMessage {
  id: number;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

// 对话历史相关类型定义
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  model: string;
  messages?: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ConversationListResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ConversationDetailResponse {
  success: boolean;
  data: Conversation;
}

export interface ChatWithHistoryRequest {
  userId: string;
  model: string;
  messages?: ConversationMessage[];
  conversationId?: string;
  title?: string;
  stream?: boolean;
}

export interface ChatWithHistoryResponse {
  success: boolean;
  data: {
    conversationId: string;
    response: {
      content: string;
      model: string;
    };
    conversation: {
      id: string;
      title: string;
      updatedAt: string;
    };
  };
}

// 聊天请求参数
export interface ChatRequest {
  model: string;
  message: string;
  stream: boolean;
}

// 流式响应数据结构
export interface StreamChunk {
  choices: Array<{
    delta: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason?: string;
  }>;
  created: number;
  id: string;
  model: string;
  service_tier: string;
  object: string;
  usage: any;
}

// 流式聊天接口
export const streamChat = async (
  params: ChatRequest,
  onChunk: (content: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  let isCompleted = false;

  return request.streamRequest(
    '/api/chat/simple',
    {
      method: 'POST',
      body: JSON.stringify(params),
    },
    (chunk: string) => {
      try {
        // 跳过空数据
        if (!chunk.trim()) return;

        // 解析流式响应数据
        const data: StreamChunk = JSON.parse(chunk);
        console.log('Received stream data:', data);
        
        // 提取内容
        if (data.choices && data.choices.length > 0) {
          const choice = data.choices[0];
          
          // 处理内容
          if (choice.delta && choice.delta.content) {
            onChunk(choice.delta.content);
          }
          
          // 检查是否完成
          if (choice.finish_reason === 'stop' && !isCompleted) {
            isCompleted = true;
            onComplete();
          }
        }
      } catch (error) {
        console.warn('Failed to parse chunk:', chunk, error);
        // 如果解析失败，尝试直接处理为文本内容
        if (chunk.trim() && !chunk.includes('{') && !chunk.includes('}')) {
          onChunk(chunk);
        }
      }
    },
    () => {
      // 确保完成回调只被调用一次
      if (!isCompleted) {
        isCompleted = true;
        onComplete();
      }
    },
    onError
  );
};

// 普通聊天接口（非流式）
export const chat = async (params: Omit<ChatRequest, 'stream'>): Promise<any> => {
  return request.post('/api/chat/simple', {
    ...params,
    stream: false,
  });
};

// ===== 对话历史相关API =====


// 流式带历史记录的聊天接口
export const streamChatWithHistory = async (
  params: ChatWithHistoryRequest,
  onChunk: (content: string) => void,
  onComplete: (conversationId?: string) => void,
  onError: (error: Error) => void
): Promise<void> => {
  let conversationId: string | undefined;
  let isCompleted = false;

  return request.streamRequest(
    '/api/chat/chat',
    {
      method: 'POST',
      body: JSON.stringify({ ...params, stream: true }),
    },
    (chunk: string) => {
      try {
        if (!chunk.trim()) return;

        const data = JSON.parse(chunk);
        
        // 处理流式内容 - 修复条件判断
        if (data.content) {
          onChunk(data.content);
        } else if (data.delta && data.delta.content) {
          onChunk(data.delta.content);
        } else if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
          // 兼容OpenAI格式
          onChunk(data.choices[0].delta.content);
        }
        
        // 处理完成信息
        if (data.conversationId && data.finished) {
          conversationId = data.conversationId;
          if (!isCompleted) {
            isCompleted = true;
            onComplete(conversationId);
          }
        }
      } catch (error) {
        console.warn('Failed to parse history chat chunk:', chunk, error);
        // 尝试直接处理为文本内容
        if (chunk.trim() && !chunk.includes('{') && !chunk.includes('}')) {
          onChunk(chunk);
        }
      }
    },
    () => {
      if (!isCompleted) {
        isCompleted = true;
        onComplete(conversationId);
      }
    },
    onError
  );
};

// 获取用户对话列表
export const getConversations = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<ConversationListResponse> => {
  return request.get(`/api/chat/conversations/${userId}`, { page, limit });
};

// 获取特定对话详情
export const getConversationDetail = async (
  conversationId: string,
  userId?: string
): Promise<ConversationDetailResponse> => {
  const params = userId ? { userId } : {};
  return request.get(`/api/chat/conversation/${conversationId}`, params);
};

// 删除对话
export const deleteConversation = async (
  conversationId: string,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  return request.delete(`/api/chat/conversation/${conversationId}`, { userId });
};

// 更新对话标题
export const updateConversationTitle = async (
  conversationId: string,
  userId: string,
  title: string
): Promise<{
  success: boolean;
  data: {
    id: string;
    title: string;
    updatedAt: string;
  };
}> => {
  return request.put(`/api/chat/conversation/${conversationId}/title`, {
    userId,
    title,
  });
};