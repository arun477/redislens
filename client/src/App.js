import React, { useState, useEffect } from 'react';
import Sidebar from './components/SideBar';
import KeysView from './components/KeysView';
import InfoView from './components/InfoView';
import CommandView from './components/CommandView';
import ToastMessage from './components/ToastMessage';
import LoadingOverlay from './components/LoadingOverlay';
import Header from './components/Header';

const App = () => {
  const [activeView, setActiveView] = useState('keys-view');
  const [isConnected, setIsConnected] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('light'); // 'dark' or 'light'
  const [connectionConfig, setConnectionConfig] = useState({
    host: 'localhost',
    port: 6379,
    db: 0,
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', isError: false });
  const [connectionAttempted, setConnectionAttempted] = useState(false);

  const showToast = (title, message, isError = false) => {
    setToast({ show: true, title, message, isError });
    setTimeout(() => setToast({ show: false, title: '', message: '', isError: false }), 3000);
  };

  const updateConnectionConfig = (config) => {
    setConnectionConfig(config);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Auto-connect on initial load
  useEffect(() => {
    if (!connectionAttempted) {
      setConnectionAttempted(true);
      attemptConnection();
    }
  }, []);

  const attemptConnection = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionConfig)
      });
      
      const data = await response.json();

      if (data.status === 'ok') {
        setIsConnected(true);
        showToast('Connection Successful', 'Connected to Redis server.');
      } else {
        setIsConnected(false);
        // Silent fail on auto-connect
      }
    } catch (error) {
      setIsConnected(false);
      // Silent fail on auto-connect
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCurrentView = () => {
    // This will be passed to the active view component to trigger refresh
    if (activeView === 'keys-view') {
      // The event will be handled by the KeysView component
      window.dispatchEvent(new CustomEvent('refreshKeys'));
    } else if (activeView === 'info-view') {
      window.dispatchEvent(new CustomEvent('refreshInfo'));
    }
  };

  // Generate dynamic classes based on theme
  const appClasses = {
    container: theme === 'dark' 
      ? "flex h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100"
      : "flex h-screen bg-gradient-to-br from-gray-50 to-white text-gray-800",
    mainContent: theme === 'dark'
      ? "flex-1 flex flex-col bg-opacity-30 bg-black backdrop-blur-sm"
      : "flex-1 flex flex-col bg-opacity-30 bg-white backdrop-blur-sm",
    patternBg: theme === 'dark'
      ? "bg-[radial-gradient(ellipse_at_center,rgba(66,153,225,0.1)_0%,transparent_70%)]"
      : "bg-[radial-gradient(ellipse_at_center,rgba(66,153,225,0.1)_0%,transparent_70%)]"
  };

  return (
    <div className={`${appClasses.container} ${appClasses.patternBg} overflow-hidden font-sans relative`}>
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isConnected={isConnected}
        setIsConnected={setIsConnected}
        connectionConfig={connectionConfig}
        updateConnectionConfig={updateConnectionConfig}
        showToast={showToast}
        setIsLoading={setIsLoading}
        isCollapsed={isSidebarCollapsed}
        theme={theme}
      />

      <div className={`${appClasses.mainContent} relative overflow-hidden`}>
        <Header 
          isConnected={isConnected} 
          toggleSidebar={toggleSidebar} 
          isSidebarCollapsed={isSidebarCollapsed}
          activeView={activeView}
          refreshCurrentView={refreshCurrentView}
          setIsConnected={setIsConnected}
          connectionConfig={connectionConfig}
          showToast={showToast}
          setIsLoading={setIsLoading}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        
        <main className="flex-1 overflow-hidden">
          {activeView === 'keys-view' && (
            <KeysView 
              isConnected={isConnected}
              connectionConfig={connectionConfig}
              showToast={showToast}
              setIsLoading={setIsLoading}
              theme={theme}
            />
          )}

          {activeView === 'info-view' && (
            <InfoView 
              isConnected={isConnected}
              connectionConfig={connectionConfig}
              showToast={showToast}
              setIsLoading={setIsLoading}
              theme={theme}
            />
          )}

          {activeView === 'command-view' && (
            <CommandView 
              isConnected={isConnected}
              connectionConfig={connectionConfig}
              showToast={showToast}
              setIsLoading={setIsLoading}
              theme={theme}
            />
          )}
        </main>
      </div>

      {toast.show && <ToastMessage toast={toast} theme={theme} />}
      {isLoading && <LoadingOverlay theme={theme} />}
    </div>
  );
};

// Add this CSS for animations
// This is required because we need to define these keyframes
const animationStyle = document.createElement('style');
animationStyle.textContent = `
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;

document.head.appendChild(animationStyle);

export default App;