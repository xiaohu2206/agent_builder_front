import { request } from '../utils/request';

// 用户注册请求数据类型
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// 用户登录请求数据类型
export interface LoginData {
  email: string;
  password: string;
}

// 用户信息类型
export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// 登录响应数据类型
export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: string;
}

// 用户认证API服务
export class AuthService {
  // 用户注册
  static async register(data: RegisterData): Promise<ApiResponse<User>> {
    try {
      const response = await request.post<ApiResponse<User>>('/api/users/', data);
      return response;
    } catch (error: any) {
      throw new Error(error.message || '注册失败');
    }
  }

  // 用户登录
  static async login(data: LoginData): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await request.post<ApiResponse<LoginResponse>>('/api/users/login', data);
      
      // 登录成功后保存token到localStorage
      if (response.success && response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_info', JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.message || '登录失败');
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('未找到认证令牌');
      }

      // 添加Authorization头
      const response = await request.get<ApiResponse<User>>('/api/users/me');
      return response;
    } catch (error: any) {
      // 如果token无效，清除本地存储
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        AuthService.clearAuthData();
      }
      throw new Error(error.message || '获取用户信息失败');
    }
  }

  // 用户登出
  static async logout(): Promise<ApiResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await request.post<ApiResponse>('/api/users/logout');
      }
      
      // 清除本地存储的认证信息
      AuthService.clearAuthData();
      
      return { success: true, message: '登出成功' };
    } catch (error: any) {
      // 即使请求失败也要清除本地数据
      AuthService.clearAuthData();
      throw new Error(error.message || '登出失败');
    }
  }

  // 检查是否已登录
  static isLoggedIn(): boolean {
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('user_info');
    return !!(token && userInfo);
  }

  // 获取本地存储的用户信息
  static getStoredUser(): User | null {
    try {
      const userInfo = localStorage.getItem('user_info');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch {
      return null;
    }
  }

  // 获取本地存储的token
  static getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // 清除认证数据
  static clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  }
}

// 添加请求拦截器，自动添加Authorization头
request.addInterceptor({
  onRequest: async (config: RequestInit) => {
    const token = AuthService.getStoredToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    return config;
  },
  onError: async (error: Error) => {
    // 如果是401错误，清除认证数据
    if (error.message.includes('401')) {
      AuthService.clearAuthData();
      // 可以在这里触发重定向到登录页面
      window.location.href = '/login';
    }
  }
});

export default AuthService;