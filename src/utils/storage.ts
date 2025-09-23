// 用户信息类型
export interface User {
  _id: string;
  username: string;
  email: string;
  apiKey?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// 存储键名常量
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
} as const;

// localStorage工具类
export class StorageService {
  /**
   * 保存认证token
   * @param token 认证token
   */
  static setAuthToken(token: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Failed to save auth token:', error);
    }
  }

  /**
   * 获取认证token
   * @returns 认证token或null
   */
  static getAuthToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * 保存用户信息
   * @param user 用户信息对象
   */
  static setUserInfo(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user info:', error);
    }
  }

  /**
   * 获取用户信息
   * @returns 用户信息对象或null
   */
  static getUserInfo(): User | null {
    try {
      const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  /**
   * 获取用户ID
   * @returns 用户ID或null
   */
  static getUserId(): string | null {
    const user = StorageService.getUserInfo();
    return user?._id || null;
  }

  /**
   * 检查是否已登录
   * @returns 是否已登录
   */
  static isLoggedIn(): boolean {
    const token = StorageService.getAuthToken();
    const userInfo = StorageService.getUserInfo();
    return !!(token && userInfo);
  }

  /**
   * 清除所有认证相关数据
   */
  static clearAuthData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * 清除指定的存储项
   * @param key 存储键名
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
    }
  }

  /**
   * 获取指定的存储项
   * @param key 存储键名
   * @returns 存储值或null
   */
  static getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  /**
   * 设置指定的存储项
   * @param key 存储键名
   * @param value 存储值
   */
  static setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
    }
  }

  /**
   * 获取JSON格式的存储项
   * @param key 存储键名
   * @returns 解析后的对象或null
   */
  static getJsonItem<T = unknown>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get JSON item ${key}:`, error);
      return null;
    }
  }

  /**
   * 设置JSON格式的存储项
   * @param key 存储键名
   * @param value 要存储的对象
   */
  static setJsonItem<T = unknown>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set JSON item ${key}:`, error);
    }
  }
}

export default StorageService;