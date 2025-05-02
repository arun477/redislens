import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import KeysView from './components/KeysView';
import InfoView from './components/InfoView';
import CommandView from './components/CommandView';
import ToastMessage from './components/ToastMessage';
import LoadingOverlay from './components/LoadingOverlay';

function App() {
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

  // Method to show toast notifications
  const showToast = (title, message, isError = false) => {
    setToast({ show: true, title, message, isError });
    setTimeout(() => setToast({ show: false, title: '', message: '', isError: false }), 3000);
  };

  // Method to update connection configuration
  const updateConnectionConfig = (config) => {
    setConnectionConfig(config);
  };

  return (
    <div className="flex h-screen bg-gray-100">
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
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
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
}

export default App;