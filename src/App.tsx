import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Navigation from './components/common/Navigation';
import ProtectedRoute from './components/common/ProtectedRoute';
import Admin from './pages/admin/Admin';
import AgentConfig from './pages/agent-hall/config/AgentConfig';
import AgentDetail from './pages/agent-hall/detail/AgentDetail';
import AgentQA from './pages/agent-qa/AgentQA';
import Login from './pages/auth/Login';
import Profile from './pages/auth/Profile';
import Register from './pages/auth/Register';
import AppContainer from './stores/AppStore';

function App() {
  console.log("App render")
  return (
    <AppContainer.Provider>
      <Router>
        <div className="app">
          <Routes>
            {/* 认证路由 - 不需要导航栏 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 需要认证的路由 - 包含导航栏 */}
            <Route path="/*" element={
              <ProtectedRoute>
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
                    
                    {/* 用户信息页面 */}
                    <Route path="/profile" element={<Profile />} />
                    
                    {/* 后台管理路由 - 需要管理员权限 */}
                    <Route path="/admin" element={
                      <ProtectedRoute requireAdmin={true}>
                        <Admin />
                      </ProtectedRoute>
                    } />
                    
                    {/* 404 页面 */}
                    <Route path="*" element={<Navigate to="/agent-hall/detail" replace />} />
                  </Routes>
                </main>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AppContainer.Provider>
  );
}

export default App;
