import { request } from '../utils/request';

// 聊天消息类型
export interface ChatMessage {
  id: number;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
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