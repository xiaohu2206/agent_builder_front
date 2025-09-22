import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AppContainer from '../../stores/AppStore';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser } = AppContainer.useContainer();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    {
      path: '/agent-hall/detail',
      label: '智能体大厅',
      icon: '🤖',
      children: [
        { path: '/agent-hall/detail', label: '智能体详情' },
        { path: '/agent-hall/config', label: '配置页面' }
      ]
    },
    {
      path: '/agent-qa',
      label: '智能体问答',
      icon: '💬'
    },
    {
      path: '/admin',
      label: '后台管理',
      icon: '⚙️',
      requireAdmin: true
    }
  ];

  const isActive = (path) => {
    if (path === '/agent-hall/detail') {
      return location.pathname.startsWith('/agent-hall');
    }
    return location.pathname === path;
  };

  const isSubActive = (path) => {
    return location.pathname === path;
  };

  // 处理登出
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    setShowUserMenu(false);
    
    try {
      await logoutUser();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('登出失败:', error);
      // 即使失败也跳转到登录页面
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 处理用户菜单点击
  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  // 关闭用户菜单
  const closeUserMenu = () => {
    setShowUserMenu(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-header">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">AI Agent Builder</span>
        </Link>
      </div>

      <div className="nav-content">
        <ul className="nav-menu">
          {navItems.map((item) => {
            // 如果需要管理员权限但用户不是管理员，则不显示
            if (item.requireAdmin && user.role !== 'admin') {
              return null;
            }

            return (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
                
                {/* 子菜单 */}
                {item.children && isActive(item.path) && (
                  <ul className="nav-submenu">
                    {item.children.map((child) => (
                      <li key={child.path} className="nav-subitem">
                        <Link
                          to={child.path}
                          className={`nav-sublink ${isSubActive(child.path) ? 'active' : ''}`}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="nav-footer">
        {user.isLoggedIn ? (
          <div className="user-section">
            <div 
              className="user-info"
              onClick={handleUserMenuClick}
            >
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-name">{user.username}</div>
                <div className="user-role">{user.role === 'admin' ? '管理员' : '用户'}</div>
              </div>
              <div className="user-menu-arrow">
                {showUserMenu ? '▲' : '▼'}
              </div>
            </div>
            
            {showUserMenu && (
              <div className="user-menu">
                <Link 
                  to="/profile" 
                  className="user-menu-item"
                  onClick={closeUserMenu}
                >
                  <span className="menu-icon">👤</span>
                  个人信息
                </Link>
                <button 
                  className="user-menu-item logout-item"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <span className="menu-icon">🚪</span>
                  {isLoggingOut ? '登出中...' : '登出'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-btn">
              登录
            </Link>
            <Link to="/register" className="register-btn">
              注册
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;