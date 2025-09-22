import { createContainer } from 'unstated-next';
import { useState, useEffect } from 'react';
import AuthService, { User, LoginData, RegisterData } from '../api/auth';

// 应用全局状态
function useAppState() {
  // 用户信息
  const [user, setUser] = useState<{
    id: string | null;
    username: string;
    email: string;
    role: string;
    isLoggedIn: boolean;
  }>({
    id: null,
    username: '',
    email: '',
    role: 'user',
    isLoggedIn: false
  });

  // 认证状态
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 当前选中的智能体
  const [currentAgent, setCurrentAgent] = useState(null);

  // 智能体列表
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'AI助手',
      description: '通用AI助手，可以回答各种问题',
      avatar: '/api/placeholder/120/120',
      status: 'active',
      created: '2024-01-15',
      conversations: 156,
      rating: 4.8,
      tags: ['AI助手', '问答', '专业']
    },
    {
      id: 2,
      name: '代码助手',
      description: '专业的编程助手，帮助解决代码问题',
      avatar: '/api/placeholder/120/120',
      status: 'active',
      created: '2024-01-10',
      conversations: 89,
      rating: 4.6,
      tags: ['编程', '代码', '技术']
    },
    {
      id: 3,
      name: '写作助手',
      description: '专业的写作助手，帮助改善文本质量',
      avatar: '/api/placeholder/120/120',
      status: 'active',
      created: '2024-01-08',
      conversations: 234,
      rating: 4.9,
      tags: ['写作', '文本', '创意']
    }
  ]);

  // 对话历史
  const [conversations, setConversations] = useState({});

  // 应用设置
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'zh-CN',
    notifications: true
  });

  // 登录
  const login = (userData) => {
    setUser({
      ...userData,
      isLoggedIn: true
    });
  };

  // 登出
  const logout = () => {
    setUser({
      id: null,
      username: '',
      email: '',
      role: 'user',
      isLoggedIn: false
    });
    setCurrentAgent(null);
  };

  // 选择智能体
  const selectAgent = (agent) => {
    setCurrentAgent(agent);
  };

  // 添加智能体
  const addAgent = (agentData) => {
    const newAgent = {
      ...agentData,
      id: Date.now(),
      created: new Date().toISOString().split('T')[0],
      conversations: 0,
      rating: 0
    };
    setAgents(prev => [...prev, newAgent]);
    return newAgent;
  };

  // 更新智能体
  const updateAgent = (id, updates) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, ...updates } : agent
    ));
  };

  // 删除智能体
  const deleteAgent = (id) => {
    setAgents(prev => prev.filter(agent => agent.id !== id));
    if (currentAgent && currentAgent.id === id) {
      setCurrentAgent(null);
    }
  };

  // 添加对话消息
  const addMessage = (agentId, message) => {
    setConversations(prev => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), message]
    }));
  };

  // 清空对话
  const clearConversation = (agentId) => {
    setConversations(prev => ({
      ...prev,
      [agentId]: []
    }));
  };

  // 更新设置
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (AuthService.isLoggedIn()) {
          const storedUser = AuthService.getStoredUser();
          if (storedUser) {
            setUser({
              id: storedUser._id,
              username: storedUser.username,
              email: storedUser.email,
              role: 'user',
              isLoggedIn: true
            });
          }
          
          // 验证token是否仍然有效
          try {
            await AuthService.getCurrentUser();
          } catch (error) {
            // token无效，清除状态
            logout();
          }
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  // 用户注册
  const register = async (data: RegisterData) => {
    try {
      setIsAuthLoading(true);
      const response = await AuthService.register(data);
      if (response.success) {
        return { success: true, message: '注册成功，请登录' };
      }
      throw new Error('注册失败');
    } catch (error: any) {
      throw new Error(error.message || '注册失败');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 用户登录
  const loginUser = async (data: LoginData) => {
    try {
      setIsAuthLoading(true);
      const response = await AuthService.login(data);
      
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser({
          id: userData._id,
          username: userData.username,
          email: userData.email,
          role: 'user',
          isLoggedIn: true
        });
        return { success: true, message: '登录成功' };
      }
      throw new Error('登录失败');
    } catch (error: any) {
      throw new Error(error.message || '登录失败');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 用户登出
  const logoutUser = async () => {
    try {
      setIsAuthLoading(true);
      await AuthService.logout();
      setUser({
        id: null,
        username: '',
        email: '',
        role: 'user',
        isLoggedIn: false
      });
      setCurrentAgent(null);
      return { success: true, message: '登出成功' };
    } catch (error: any) {
      // 即使请求失败也要清除本地状态
      setUser({
        id: null,
        username: '',
        email: '',
        role: 'user',
        isLoggedIn: false
      });
      setCurrentAgent(null);
      throw new Error(error.message || '登出失败');
    } finally {
      setIsAuthLoading(false);
    }
  };

  return {
    // 状态
    user,
    currentAgent,
    agents,
    conversations,
    settings,
    isAuthLoading,
    
    // 方法
    login,
    logout,
    selectAgent,
    addAgent,
    updateAgent,
    deleteAgent,
    addMessage,
    clearConversation,
    updateSettings,
    
    // 认证方法
    register,
    loginUser,
    logoutUser
  };
}

// 创建容器
const AppContainer = createContainer(useAppState);

export default AppContainer;