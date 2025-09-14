import React from 'react';
import './AgentDetail.css';

const AgentDetail = () => {
  return (
    <div className="agent-detail">
      <div className="agent-detail-header">
        <h1>智能体详情</h1>
      </div>
      
      <div className="agent-detail-content">
        <div className="agent-info-card">
          <div className="agent-avatar">
            <img src="/api/placeholder/120/120" alt="智能体头像" />
          </div>
          
          <div className="agent-basic-info">
            <h2>智能体名称</h2>
            <p className="agent-description">
              这是一个智能助手，可以帮助用户解决各种问题，提供专业的建议和支持。
            </p>
            
            <div className="agent-tags">
              <span className="tag">AI助手</span>
              <span className="tag">问答</span>
              <span className="tag">专业</span>
            </div>
          </div>
        </div>
        
        <div className="agent-capabilities">
          <h3>功能特点</h3>
          <ul>
            <li>智能问答：快速准确回答用户问题</li>
            <li>多领域支持：涵盖技术、生活、学习等多个领域</li>
            <li>个性化服务：根据用户需求提供定制化建议</li>
            <li>24/7在线：全天候为用户提供服务</li>
          </ul>
        </div>
        
        <div className="agent-actions">
          <button className="btn-primary">开始对话</button>
          <button className="btn-secondary">收藏</button>
          <button className="btn-secondary">分享</button>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;