import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppContainer from '../../stores/AppStore';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const { user } = AppContainer.useContainer();

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
          <div className="user-info">
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.username}</div>
              <div className="user-role">{user.role === 'admin' ? '管理员' : '用户'}</div>
            </div>
          </div>
        ) : (
          <button className="login-btn">
            登录
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;