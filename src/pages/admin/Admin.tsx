import React, { useState } from 'react';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('agents');
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'AI助手',
      status: 'active',
      created: '2024-01-15',
      conversations: 156,
      rating: 4.8
    },
    {
      id: 2,
      name: '代码助手',
      status: 'inactive',
      created: '2024-01-10',
      conversations: 89,
      rating: 4.6
    },
    {
      id: 3,
      name: '写作助手',
      status: 'active',
      created: '2024-01-08',
      conversations: 234,
      rating: 4.9
    }
  ]);

  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'user001',
      email: 'user001@example.com',
      role: 'user',
      lastLogin: '2024-01-20',
      status: 'active'
    },
    {
      id: 2,
      username: 'admin001',
      email: 'admin@example.com',
      role: 'admin',
      lastLogin: '2024-01-21',
      status: 'active'
    }
  ]);

  const handleAgentStatusToggle = (id) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id 
        ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
        : agent
    ));
  };

  const handleDeleteAgent = (id) => {
    if (window.confirm('确定要删除这个智能体吗？')) {
      setAgents(prev => prev.filter(agent => agent.id !== id));
    }
  };

  const handleUserStatusToggle = (id) => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const renderAgentsTab = () => (
    <div className="tab-content">
      <div className="content-header">
        <h2>智能体管理</h2>
        <button className="btn-primary">创建新智能体</button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>总智能体数</h3>
          <div className="stat-number">{agents.length}</div>
        </div>
        <div className="stat-card">
          <h3>活跃智能体</h3>
          <div className="stat-number">{agents.filter(a => a.status === 'active').length}</div>
        </div>
        <div className="stat-card">
          <h3>总对话数</h3>
          <div className="stat-number">{agents.reduce((sum, a) => sum + a.conversations, 0)}</div>
        </div>
        <div className="stat-card">
          <h3>平均评分</h3>
          <div className="stat-number">{(agents.reduce((sum, a) => sum + a.rating, 0) / agents.length).toFixed(1)}</div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>智能体名称</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>对话数</th>
              <th>评分</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent.id}>
                <td>
                  <div className="agent-info">
                    <div className="agent-avatar-small"></div>
                    <span>{agent.name}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${agent.status}`}>
                    {agent.status === 'active' ? '活跃' : '停用'}
                  </span>
                </td>
                <td>{agent.created}</td>
                <td>{agent.conversations}</td>
                <td>
                  <div className="rating">
                    <span>⭐ {agent.rating}</span>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => handleAgentStatusToggle(agent.id)}
                    >
                      {agent.status === 'active' ? '停用' : '启用'}
                    </button>
                    <button className="btn-small btn-secondary">编辑</button>
                    <button 
                      className="btn-small btn-danger"
                      onClick={() => handleDeleteAgent(agent.id)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="tab-content">
      <div className="content-header">
        <h2>用户管理</h2>
        <button className="btn-primary">添加用户</button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>总用户数</h3>
          <div className="stat-number">{users.length}</div>
        </div>
        <div className="stat-card">
          <h3>活跃用户</h3>
          <div className="stat-number">{users.filter(u => u.status === 'active').length}</div>
        </div>
        <div className="stat-card">
          <h3>管理员</h3>
          <div className="stat-number">{users.filter(u => u.role === 'admin').length}</div>
        </div>
        <div className="stat-card">
          <h3>普通用户</h3>
          <div className="stat-number">{users.filter(u => u.role === 'user').length}</div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>最后登录</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? '管理员' : '用户'}
                  </span>
                </td>
                <td>{user.lastLogin}</td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status === 'active' ? '活跃' : '停用'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => handleUserStatusToggle(user.id)}
                    >
                      {user.status === 'active' ? '停用' : '启用'}
                    </button>
                    <button className="btn-small btn-secondary">编辑</button>
                    <button className="btn-small btn-danger">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="tab-content">
      <div className="content-header">
        <h2>数据分析</h2>
      </div>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>使用趋势</h3>
          <div className="chart-placeholder">
            <p>📈 图表占位符</p>
            <p>这里将显示用户使用趋势图表</p>
          </div>
        </div>
        
        <div className="analytics-card">
          <h3>热门智能体</h3>
          <div className="chart-placeholder">
            <p>📊 图表占位符</p>
            <p>这里将显示热门智能体排行</p>
          </div>
        </div>
        
        <div className="analytics-card">
          <h3>用户活跃度</h3>
          <div className="chart-placeholder">
            <p>👥 图表占位符</p>
            <p>这里将显示用户活跃度分析</p>
          </div>
        </div>
        
        <div className="analytics-card">
          <h3>系统性能</h3>
          <div className="chart-placeholder">
            <p>⚡ 图表占位符</p>
            <p>这里将显示系统性能监控</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>后台管理系统</h1>
        <div className="admin-user">
          <span>管理员</span>
          <button className="btn-logout">退出</button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-sidebar">
          <nav className="admin-nav">
            <button 
              className={`nav-item ${activeTab === 'agents' ? 'active' : ''}`}
              onClick={() => setActiveTab('agents')}
            >
              🤖 智能体管理
            </button>
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 用户管理
            </button>
            <button 
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📊 数据分析
            </button>
          </nav>
        </div>

        <div className="admin-main">
          {activeTab === 'agents' && renderAgentsTab()}
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
      </div>
    </div>
  );
};

export default Admin;