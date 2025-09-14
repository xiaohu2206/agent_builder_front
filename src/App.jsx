import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppContainer from './stores/AppStore';
import Navigation from './components/common/Navigation';
import AgentDetail from './pages/agent-hall/detail/AgentDetail';
import AgentConfig from './pages/agent-hall/config/AgentConfig';
import AgentQA from './pages/agent-qa/AgentQA';
import Admin from './pages/admin/Admin';
import './App.css';

function App() {
  return (
    <AppContainer.Provider>
      <Router>
        <div className="app">
          <Navigation />
          <main className="app-main">
            <Routes>
              {/* 默认路由重定向到智能体大厅 */}
              <Route path="/" element={<Navigate to="/agent-hall/detail" replace />} />
              
              {/* 智能体大厅路由 */}
              <Route path="/agent-hall/detail" element={<AgentDetail />} />
              <Route path="/agent-hall/config" element={<AgentConfig />} />
              
              {/* 智能体问答路由 */}
              <Route path="/agent-qa" element={<AgentQA />} />
              
              {/* 后台管理路由 */}
              <Route path="/admin" element={<Admin />} />
              
              {/* 404 页面 */}
              <Route path="*" element={<Navigate to="/agent-hall/detail" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppContainer.Provider>
  );
}

export default App;
