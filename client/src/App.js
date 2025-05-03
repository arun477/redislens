import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KeysView from './components/KeysView';
import InfoView from './components/InfoView';
import CommandView from './components/CommandView';
import ToastMessage from './components/ToastMessage';
import LoadingOverlay from './components/LoadingOverlay';
import Header from './components/Header';
import AppUtilities from './components/AppUtilities';

// Import custom animations and effects
import './animations.css';

const App = () => {
  const [activeView, setActiveView] = useState('keys-view');
  const [isConnected, setIsConnected] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 to-black text-gray-100 overflow-hidden font-sans bg-pattern">
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
      />

      <div className="flex-1 flex flex-col relative overflow-hidden">
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
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900/30 backdrop-blur-sm">
          {activeView === 'keys-view' && (
            <KeysView 
              isConnected={isConnected}
              connectionConfig={connectionConfig}
              showToast={showToast}
              setIsLoading={setIsLoading}
            />
          )}

          {activeView === 'info-view' && (
            <InfoView 
              isConnected={isConnected}
              connectionConfig={connectionConfig}
              showToast={showToast}
              setIsLoading={setIsLoading}
            />
          )}

          {activeView === 'command-view' && (
            <CommandView 
              isConnected={isConnected}
              connectionConfig={connectionConfig}
              showToast={showToast}
              setIsLoading={setIsLoading}
            />
          )}
        </main>
      </div>

      {toast.show && <ToastMessage toast={toast} />}
      {isLoading && <LoadingOverlay />}
      
      <AppUtilities 
        isConnected={isConnected} 
        setActiveView={setActiveView} 
        refreshCurrentView={refreshCurrentView} 
        toggleSidebar={toggleSidebar} 
      />
    </div>
  );
};

export default App;