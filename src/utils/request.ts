// 基础请求配置
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// 默认配置
const defaultConfig: RequestConfig = {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 请求拦截器类型
export interface RequestInterceptor {
  onRequest?: (config: RequestInit) => RequestInit | Promise<RequestInit>;
  onResponse?: (response: Response) => Response | Promise<Response>;
  onError?: (error: Error) => void | Promise<void>;
}

// 请求类
class Request {
  private config: RequestConfig;
  private interceptors: RequestInterceptor[] = [];

  constructor(config: RequestConfig = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // 添加拦截器
  addInterceptor(interceptor: RequestInterceptor) {
    this.interceptors.push(interceptor);
  }

  // 应用请求拦截器
  private async applyRequestInterceptors(config: RequestInit): Promise<RequestInit> {
    let finalConfig = config;
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        finalConfig = await interceptor.onRequest(finalConfig);
      }
    }
    return finalConfig;
  }

  // 应用响应拦截器
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let finalResponse = response;
    for (const interceptor of this.interceptors) {
      if (interceptor.onResponse) {
        finalResponse = await interceptor.onResponse(finalResponse);
      }
    }
    return finalResponse;
  }

  // 应用错误拦截器
  private async applyErrorInterceptors(error: Error): Promise<void> {
    for (const interceptor of this.interceptors) {
      if (interceptor.onError) {
        await interceptor.onError(error);
      }
    }
  }

  // 普通请求方法
  async request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const fullUrl = `${this.config.baseURL}${url}`;
      
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
      };

      const finalConfig = await this.applyRequestInterceptors(config);
      
      const response = await fetch(fullUrl, finalConfig);
      const finalResponse = await this.applyResponseInterceptors(response);

      if (!finalResponse.ok) {
        throw new Error(`HTTP error! status: ${finalResponse.status}`);
      }

      return await finalResponse.json();
    } catch (error) {
      await this.applyErrorInterceptors(error as Error);
      throw error;
    }
  }

  // 流式请求方法
  async streamRequest(
    url: string, 
    options: RequestInit = {},
    onChunk?: (chunk: string) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      const fullUrl = `${this.config.baseURL}${url}`;
      
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
      };

      const finalConfig = await this.applyRequestInterceptors(config);
      
      const response = await fetch(fullUrl, finalConfig);
      const finalResponse = await this.applyResponseInterceptors(response);

      if (!finalResponse.ok) {
        throw new Error(`HTTP error! status: ${finalResponse.status}`);
      }

      const reader = finalResponse.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // 处理缓冲区中剩余的数据
          if (buffer.trim()) {
            this.processStreamLines(buffer, onChunk);
          }
          onComplete?.();
          break;
        }

        // 解码数据块
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // 按行处理数据
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后一个不完整的行

        // 处理完整的行
        for (const line of lines) {
          this.processStreamLine(line, onChunk);
        }
      }
    } catch (error) {
      await this.applyErrorInterceptors(error as Error);
      onError?.(error as Error);
      throw error;
    }
  }

  // 处理单行流式数据
  private processStreamLine(line: string, onChunk?: (chunk: string) => void): void {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // 处理 SSE 格式的数据
    if (trimmedLine.startsWith('data: ')) {
      const data = trimmedLine.substring(6); // 移除 'data: ' 前缀
      if (data === '[DONE]') {
        return; // 忽略结束标记
      }
      onChunk?.(data);
    } else if (trimmedLine !== '[DONE]') {
      // 处理非 SSE 格式的数据
      onChunk?.(trimmedLine);
    }
  }

  // 处理多行流式数据
  private processStreamLines(buffer: string, onChunk?: (chunk: string) => void): void {
    const lines = buffer.split('\n');
    for (const line of lines) {
      this.processStreamLine(line, onChunk);
    }
  }

  // GET 请求
  get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${url}${queryString}`, { method: 'GET' });
  }

  // POST 请求
  post<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT 请求
  put<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE 请求
  delete<T = any>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

// 创建默认实例
export const request = new Request();

// 导出Request类供自定义使用
export { Request };