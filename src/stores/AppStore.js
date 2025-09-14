import { createContainer } from 'unstated-next';
import { useState } from 'react';

// 应用全局状态
function useAppState() {
  // 用户信息
  const [user, setUser] = useState({
    id: null,
    username: '',
    email: '',
    role: 'user',
    isLoggedIn: false
  });

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

  return {
    // 状态
    user,
    currentAgent,
    agents,
    conversations,
    settings,
    
    // 方法
    login,
    logout,
    selectAgent,
    addAgent,
    updateAgent,
    deleteAgent,
    addMessage,
    clearConversation,
    updateSettings
  };
}

// 创建容器
const AppContainer = createContainer(useAppState);

export default AppContainer;