import React, { useState } from 'react';
import Sidebar from './components/SideBar';
import KeysView from './components/KeysView';
import InfoView from './components/InfoView';
import CommandView from './components/CommandView';
import ToastMessage from './components/ToastMessage';
import LoadingOverlay from './components/LoadingOverlay';

// Custom CSS for premium glass effect
const appStyles = {
  container: "min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-gray-100 flex overflow-hidden font-sans",
  content: "flex-1 flex flex-col relative overflow-hidden backdrop-blur-sm border-l border-gray-800/40",
  mainContent: "flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
};

const App = () => {
  const [activeView, setActiveView] = useState('keys-view');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState({
    host: 'localhost',
    port: 6379,
    db: 0,
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', isError: false });

  const showToast = (title, message, isError = false) => {
    setToast({ show: true, title, message, isError });
    setTimeout(() => setToast({ show: false, title: '', message: '', isError: false }), 3000);
  };

  const updateConnectionConfig = (config) => {
    setConnectionConfig(config);
  };

  return (
    <div className={appStyles.container}>
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isConnected={isConnected}
        setIsConnected={setIsConnected}
        connectionConfig={connectionConfig}
        updateConnectionConfig={updateConnectionConfig}
        showToast={showToast}
        setIsLoading={setIsLoading}
      />

      <div className={appStyles.content}>
        <main className={appStyles.mainContent}>
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
    </div>
  );
};

export default App;