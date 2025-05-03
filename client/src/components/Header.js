import React, { useState } from 'react';

const Header = ({ 
  isConnected, 
  toggleSidebar, 
  isSidebarCollapsed, 
  activeView,
  refreshCurrentView,
  setIsConnected,
  connectionConfig,
  showToast,
  setIsLoading
}) => {
  const [showConnectionInfo, setShowConnectionInfo] = useState(false);

  const getViewTitle = () => {
    switch(activeView) {
      case 'keys-view': return 'Keys Explorer';
      case 'info-view': return 'Server Dashboard';
      case 'command-view': return 'Command Terminal';
      default: return 'Redis Explorer';
    }
  };

  const reconnect = async () => {
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
        showToast('Connection Failed', data.detail || 'Failed to connect to Redis server.', true);
      }
    } catch (error) {
      setIsConnected(false);
      showToast('Connection Error', 'Connection error.', true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white shadow-sm flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-cyan-600 transition-colors mr-4"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform transition-transform duration-300" style={{ transform: isSidebarCollapsed ? 'scaleX(-1)' : 'none' }}>
            <path d="M4 18L4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M20 18L20 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10 12L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10 9L4 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10 15L4 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        
        <h1 className="text-xl font-bold text-gray-800">
          {getViewTitle()}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={refreshCurrentView}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-cyan-600 rounded transition-colors"
          title="Refresh"
        >
          <i className="fas fa-sync-alt"></i>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowConnectionInfo(!showConnectionInfo)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
              isConnected 
                ? 'bg-cyan-50 border-cyan-200 text-cyan-700' 
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-500 animate-pulse' : 'bg-amber-500'}`}></div>
            {isConnected ? 'Connected' : 'Disconnected'}
            <i className="fas fa-chevron-down text-xs"></i>
          </button>
          
          {showConnectionInfo && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20">
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-gray-500">Host:</div>
                  <div className="col-span-2 font-mono text-gray-800">{connectionConfig.host}</div>
                  
                  <div className="text-gray-500">Port:</div>
                  <div className="col-span-2 font-mono text-gray-800">{connectionConfig.port}</div>
                  
                  <div className="text-gray-500">Database:</div>
                  <div className="col-span-2 font-mono text-gray-800">{connectionConfig.db}</div>
                </div>
                
                <div className="pt-2 border-t border-gray-200 flex justify-end">
                  <button 
                    onClick={() => {
                      reconnect();
                      setShowConnectionInfo(false);
                    }}
                    className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <i className="fas fa-plug"></i>
                    Reconnect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;