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
  setIsLoading,
  theme,
  toggleTheme
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
  
  const getViewIcon = () => {
    switch(activeView) {
      case 'keys-view': return 'database';
      case 'info-view': return 'chart-line';
      case 'command-view': return 'terminal';
      default: return 'cube';
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
  
  // This is the key update - we're checking connection before refreshing
  const handleRefresh = async () => {
    // First check if we're still connected
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
        // If still connected, proceed with refresh
        setIsConnected(true);
        refreshCurrentView();
      } else {
        // If not connected, notify user and don't try to refresh
        setIsConnected(false);
        showToast('Connection Lost', 'Connection to Redis server was lost. Please reconnect.', true);
      }
    } catch (error) {
      setIsConnected(false);
      showToast('Connection Error', 'Connection to Redis server was lost. Please reconnect.', true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const headerClasses = {
    container: theme === 'dark'
      ? "h-16 border-b border-gray-700 bg-gray-900 bg-opacity-70 backdrop-blur-lg"
      : "h-16 border-b border-gray-200 bg-white bg-opacity-70 backdrop-blur-lg",
    title: theme === 'dark'
      ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300"
      : "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500",
    iconContainer: theme === 'dark'
      ? "w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800"
      : "w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100",
    icon: theme === 'dark'
      ? "text-blue-400"
      : "text-blue-600",
    button: theme === 'dark'
      ? "bg-gray-800 hover:bg-gray-700 text-blue-400 border border-gray-700"
      : "bg-gray-100 hover:bg-gray-200 text-blue-600 border border-gray-200",
    iconButton: theme === 'dark'
      ? "bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-gray-700"
      : "bg-gray-100 hover:bg-gray-200 text-cyan-600 border border-gray-200",
    statusBadge: isConnected 
      ? (theme === 'dark' ? "bg-blue-900/30 border-blue-700/50 text-blue-300" : "bg-blue-50 border-blue-200 text-blue-700")
      : (theme === 'dark' ? "bg-amber-900/30 border-amber-700/50 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-700"),
    statusDot: isConnected
      ? (theme === 'dark' ? "bg-blue-400" : "bg-blue-500")
      : (theme === 'dark' ? "bg-amber-400" : "bg-amber-500"),
    connectionPopup: theme === 'dark'
      ? "bg-gray-900/95 backdrop-blur-md border border-gray-700 shadow-xl"
      : "bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl"
  };

  return (
    <header className={`${headerClasses.container} flex items-center justify-between px-4 z-10`}>
      {/* Left side with title */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className={`${headerClasses.iconButton} p-2 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className={`fas fa-${isSidebarCollapsed ? 'indent' : 'outdent'}`}></i>
        </button>
        
        <div className="flex items-center space-x-3">
          <div className={headerClasses.iconContainer}>
            <i className={`fas fa-${getViewIcon()} ${headerClasses.icon}`}></i>
          </div>
          <h1 className={`text-xl font-bold ${headerClasses.title}`}>
            {getViewTitle()}
          </h1>
        </div>
      </div>
      
      {/* Right side with actions */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={handleRefresh}
          className={`${headerClasses.iconButton} p-2 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          title="Refresh"
        >
          <i className="fas fa-sync-alt"></i>
        </button>
        
        <button 
          onClick={toggleTheme}
          className={`${headerClasses.iconButton} p-2 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowConnectionInfo(!showConnectionInfo)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${headerClasses.statusBadge}`}
          >
            <div className={`w-2 h-2 rounded-full ${headerClasses.statusDot} ${isConnected ? 'animate-pulse' : ''}`}></div>
            {isConnected ? 'Connected' : 'Disconnected'}
            <i className="fas fa-chevron-down text-xs"></i>
          </button>
          
          {showConnectionInfo && (
            <div className={`absolute right-0 mt-2 w-72 ${headerClasses.connectionPopup} rounded-xl p-4 z-20 transform transition-all duration-300 animate-slideIn`}>
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-opacity-20 border-blue-300">
                <h3 className={headerClasses.title}>Connection Details</h3>
                <button 
                  onClick={() => setShowConnectionInfo(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <div className={theme === 'dark' ? "text-gray-400" : "text-gray-500"}>Host:</div>
                  <div className={`col-span-2 font-mono ${theme === 'dark' ? "text-cyan-300" : "text-cyan-600"}`}>
                    {connectionConfig.host}
                  </div>
                  
                  <div className={theme === 'dark' ? "text-gray-400" : "text-gray-500"}>Port:</div>
                  <div className={`col-span-2 font-mono ${theme === 'dark' ? "text-cyan-300" : "text-cyan-600"}`}>
                    {connectionConfig.port}
                  </div>
                  
                  <div className={theme === 'dark' ? "text-gray-400" : "text-gray-500"}>Database:</div>
                  <div className={`col-span-2 font-mono ${theme === 'dark' ? "text-cyan-300" : "text-cyan-600"}`}>
                    {connectionConfig.db}
                  </div>
                </div>
                
                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => {
                      reconnect();
                      setShowConnectionInfo(false);
                    }}
                    className={`px-3 py-1.5 ${theme === 'dark' 
                      ? 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-300' 
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                    } rounded-lg text-xs flex items-center gap-1.5 transition-all duration-300 transform hover:scale-105`}
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

// Add this CSS for animations
const animationStyle = document.createElement('style');
animationStyle.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slideIn {
    animation: slideIn 0.2s ease-out forwards;
  }
`;
document.head.appendChild(animationStyle);

export default Header;