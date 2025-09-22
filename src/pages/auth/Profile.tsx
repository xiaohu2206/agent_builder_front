import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContainer from '../../stores/AppStore';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, logoutUser, isAuthLoading } = AppContainer.useContainer();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 处理登出
  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmed = window.confirm('确定要登出吗？');
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      await logoutUser();
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('登出失败:', error);
      // 即使登出失败也跳转到登录页面
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '未知';
    }
  };

  // 获取用户头像（使用用户名首字母）
  const getUserAvatar = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  if (isAuthLoading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user.isLoggedIn) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="error-message">
            <h2>未登录</h2>
            <p>请先登录后再访问此页面</p>
            <button 
              onClick={() => navigate('/login')}
              className="login-button"
            >
              前往登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {getUserAvatar(user.username)}
          </div>
          <div className="user-info">
            <h1>{user.username}</h1>
            <p className="user-email">{user.email}</p>
            <span className="user-role">{user.role === 'admin' ? '管理员' : '普通用户'}</span>
          </div>
        </div>

        <div className="profile-content">
          <div className="info-section">
            <h3>基本信息</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>用户名</label>
                <span>{user.username}</span>
              </div>
              <div className="info-item">
                <label>邮箱地址</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>用户角色</label>
                <span>{user.role === 'admin' ? '管理员' : '普通用户'}</span>
              </div>
              <div className="info-item">
                <label>用户ID</label>
                <span className="user-id">{user.id}</span>
              </div>
            </div>
          </div>

          <div className="actions-section">
            <h3>账户操作</h3>
            <div className="action-buttons">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="logout-button"
              >
                {isLoggingOut ? '登出中...' : '登出账户'}
              </button>
              <button
                onClick={() => navigate('/')}
                className="home-button"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;