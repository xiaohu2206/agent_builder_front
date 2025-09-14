import React, { useState, useRef, useEffect } from 'react';
import './AgentQA.css';

const AgentQA = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'agent',
      content: '您好！我是您的AI助手，有什么可以帮助您的吗？',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // 模拟AI回复
    setTimeout(() => {
      const agentMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: generateMockResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateMockResponse = (userInput) => {
    const responses = [
      '这是一个很好的问题！让我来为您详细解答...',
      '根据您的描述，我建议您可以尝试以下几种方法：',
      '我理解您的需求，这里有一些相关的信息可能对您有帮助：',
      '感谢您的提问！基于我的知识库，我可以为您提供以下建议：',
      '这个问题涉及多个方面，让我逐一为您分析：'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'agent',
        content: '对话已清空，有什么新的问题需要帮助吗？',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="agent-qa">
      <div className="qa-header">
        <div className="agent-info">
          <div className="agent-avatar">
            <img src="/api/placeholder/40/40" alt="AI助手" />
          </div>
          <div className="agent-details">
            <h3>AI智能助手</h3>
            <span className="status online">在线</span>
          </div>
        </div>
        
        <div className="qa-actions">
          <button className="btn-clear" onClick={clearChat}>
            清空对话
          </button>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'agent' ? (
                  <img src="/api/placeholder/32/32" alt="AI" />
                ) : (
                  <div className="user-avatar">我</div>
                )}
              </div>
              
              <div className="message-content">
                <div className="message-bubble">
                  {message.content}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message agent">
              <div className="message-avatar">
                <img src="/api/placeholder/32/32" alt="AI" />
              </div>
              <div className="message-content">
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题..."
            rows={1}
            className="message-input"
          />
          
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        
        <div className="input-tips">
          <span>按 Enter 发送，Shift + Enter 换行</span>
        </div>
      </div>
    </div>
  );
};

export default AgentQA;