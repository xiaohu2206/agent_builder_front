import React, { useState } from 'react';
import './AgentConfig.css';

const AgentConfig = () => {
  const [config, setConfig] = useState({
    name: '',
    description: '',
    avatar: '',
    personality: 'friendly',
    language: 'zh-CN',
    responseStyle: 'detailed',
    capabilities: {
      textGeneration: true,
      questionAnswering: true,
      codeGeneration: false,
      imageAnalysis: false
    },
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 2000
  });

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCapabilityChange = (capability, enabled) => {
    setConfig(prev => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capability]: enabled
      }
    }));
  };

  const handleSave = () => {
    console.log('保存配置:', config);
    alert('配置已保存！');
  };

  const handlePreview = () => {
    console.log('预览智能体:', config);
    alert('预览功能开发中...');
  };

  return (
    <div className="agent-config">
      <div className="config-header">
        <h1>智能体配置</h1>
        <p>配置您的专属智能体，定制个性化的AI助手</p>
      </div>

      <div className="config-content">
        <div className="config-section">
          <h2>基本信息</h2>
          <div className="form-group">
            <label>智能体名称</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="请输入智能体名称"
            />
          </div>
          
          <div className="form-group">
            <label>描述</label>
            <textarea
              value={config.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="请描述您的智能体功能和特点"
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label>头像URL</label>
            <input
              type="url"
              value={config.avatar}
              onChange={(e) => handleInputChange('avatar', e.target.value)}
              placeholder="请输入头像图片URL"
            />
          </div>
        </div>

        <div className="config-section">
          <h2>性格设置</h2>
          <div className="form-group">
            <label>性格类型</label>
            <select
              value={config.personality}
              onChange={(e) => handleInputChange('personality', e.target.value)}
            >
              <option value="friendly">友好型</option>
              <option value="professional">专业型</option>
              <option value="humorous">幽默型</option>
              <option value="serious">严肃型</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>语言</label>
            <select
              value={config.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
            >
              <option value="zh-CN">中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>回复风格</label>
            <select
              value={config.responseStyle}
              onChange={(e) => handleInputChange('responseStyle', e.target.value)}
            >
              <option value="concise">简洁</option>
              <option value="detailed">详细</option>
              <option value="creative">创意</option>
            </select>
          </div>
        </div>

        <div className="config-section">
          <h2>功能能力</h2>
          <div className="capabilities-grid">
            <div className="capability-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.capabilities.textGeneration}
                  onChange={(e) => handleCapabilityChange('textGeneration', e.target.checked)}
                />
                文本生成
              </label>
            </div>
            
            <div className="capability-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.capabilities.questionAnswering}
                  onChange={(e) => handleCapabilityChange('questionAnswering', e.target.checked)}
                />
                问答对话
              </label>
            </div>
            
            <div className="capability-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.capabilities.codeGeneration}
                  onChange={(e) => handleCapabilityChange('codeGeneration', e.target.checked)}
                />
                代码生成
              </label>
            </div>
            
            <div className="capability-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.capabilities.imageAnalysis}
                  onChange={(e) => handleCapabilityChange('imageAnalysis', e.target.checked)}
                />
                图像分析
              </label>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h2>高级设置</h2>
          <div className="form-group">
            <label>系统提示词</label>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
              placeholder="请输入系统提示词，定义智能体的行为模式"
              rows={6}
            />
          </div>
          
          <div className="form-group">
            <label>创造性 (Temperature): {config.temperature}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature}
              onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
            />
            <div className="range-labels">
              <span>保守</span>
              <span>创新</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>最大回复长度</label>
            <input
              type="number"
              value={config.maxTokens}
              onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
              min="100"
              max="4000"
              step="100"
            />
          </div>
        </div>
      </div>

      <div className="config-actions">
        <button className="btn-secondary" onClick={handlePreview}>
          预览
        </button>
        <button className="btn-primary" onClick={handleSave}>
          保存配置
        </button>
      </div>
    </div>
  );
};

export default AgentConfig;