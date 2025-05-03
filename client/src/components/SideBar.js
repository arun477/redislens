import React, { useState } from 'react';

const Sidebar = ({ 
  activeView, 
  setActiveView, 
  isConnected, 
  setIsConnected, 
  connectionConfig, 
  updateConnectionConfig,
  showToast,
  setIsLoading,
  isCollapsed
}) => {
  const [formData, setFormData] = useState(connectionConfig);
  const [showConnectionForm, setShowConnectionForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'port' || name === 'db' ? parseInt(value) : value
    });
  };

  const testConnection = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      if (data.status === 'ok') {
        setIsConnected(true);
        updateConnectionConfig(formData);
        showToast('Connection Successful', 'Connected to Redis server.');
        setShowConnectionForm(false);
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

  const getNavItemClass = (view) => {
    let baseClass = "relative flex items-center justify-center transition-all duration-200 rounded-lg";
    
    if (isCollapsed) {
      baseClass += " w-12 h-12 mx-auto mb-4";
    } else {
      baseClass += " p-3 mx-3 mb-2";
    }
    
    if (activeView === view) {
      baseClass += isCollapsed 
        ? " bg-cyan-900/30 text-cyan-400 border border-cyan-700/30" 
        : " bg-cyan-900/30 text-cyan-400 border-l-2 border-cyan-500";
    } else {
      baseClass += " text-gray-500 hover:text-gray-300 hover:bg-gray-800/50";
    }
    
    return baseClass;
  };

  const getNavItemTooltip = (label) => {
    if (!isCollapsed) return null;
    
    return (
      <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {label}
      </div>
    );
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-black/80 backdrop-blur-md h-screen flex flex-col border-r border-gray-800/50 transition-all duration-300 z-20`}>
      <div className={`p-4 border-b border-gray-800/50 flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
        {!isCollapsed && (
          <div className="text-xl font-bold flex items-center gap-2">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C6.28 3 7.12 3 8.8 3h6.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C20 5.28 20 6.12 20 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C17.72 21 16.88 21 15.2 21H8.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C4 18.72 4 17.88 4 16.2V7.8z" 
                  fill="url(#gradient)" />
                <path d="M9 8h6M9 12h6M9 16h4" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gradient" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00FFFF" />
                    <stop offset="1" stopColor="#0080FF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">Redis</span>
          </div>
        )}
        
        {isCollapsed ? (
          <div className="relative w-6 h-6 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C6.28 3 7.12 3 8.8 3h6.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C20 5.28 20 6.12 20 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C17.72 21 16.88 21 15.2 21H8.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C4 18.72 4 17.88 4 16.2V7.8z" 
                fill="url(#gradient)" />
              <path d="M9 8h6M9 12h6M9 16h4" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="gradient" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00FFFF" />
                  <stop offset="1" stopColor="#0080FF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        ) : (
          <button 
            onClick={() => setShowConnectionForm(!showConnectionForm)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/60 text-cyan-400 hover:bg-gray-700/60 transition-colors"
          >
            <i className={`fas fa-${showConnectionForm ? 'times' : 'plug'}`}></i>
          </button>
        )}
      </div>

      {!isCollapsed && showConnectionForm && (
        <div className="p-4 border-b border-gray-800/50 space-y-3 bg-gray-900/30">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-gray-500">Host</label>
            <input
              type="text"
              name="host"
              value={formData.host}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-900/70 text-white border border-gray-700/50 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              placeholder="localhost"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-gray-500">Port</label>
              <input
                type="number"
                name="port"
                value={formData.port}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-900/70 text-white border border-gray-700/50 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-gray-500">DB</label>
              <input
                type="number"
                name="db"
                value={formData.db}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-900/70 text-white border border-gray-700/50 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-gray-500">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-900/70 text-white border border-gray-700/50 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm"
              placeholder="Optional"
            />
          </div>

          <button
            onClick={testConnection}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-cyan-900/20"
          >
            <i className="fas fa-plug"></i> 
            {isConnected ? 'Reconnect' : 'Connect'}
          </button>
        </div>
      )}

      <nav className="flex-1 py-6">
        <div className="group" onClick={() => setActiveView('keys-view')}>
          <div className={getNavItemClass('keys-view')}>
            <div className="relative flex items-center justify-center w-6 h-6">
              <i className="fas fa-database text-lg absolute opacity-50 -ml-0.5 -mt-0.5"></i>
              <i className="fas fa-search text-xs absolute -mr-1 -mb-1.5"></i>
            </div>
            {!isCollapsed && <span className="ml-3 flex-1">Keys Explorer</span>}
            {getNavItemTooltip('Keys Explorer')}
          </div>
        </div>
        
        <div className="group" onClick={() => setActiveView('info-view')}>
          <div className={getNavItemClass('info-view')}>
            <div className="flex items-center justify-center w-6 h-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <path d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5z" fill="currentColor" opacity="0.7" />
                <path d="M14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5z" fill="currentColor" opacity="0.9" />
                <path d="M4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4z" fill="currentColor" opacity="0.9" />
                <path d="M14 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z" fill="currentColor" opacity="0.7" />
                <path d="M13 8L18 16M8 10l6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            {!isCollapsed && <span className="ml-3 flex-1">Server Dashboard</span>}
            {getNavItemTooltip('Server Dashboard')}
          </div>
        </div>
        
        <div className="group" onClick={() => setActiveView('command-view')}>
          <div className={getNavItemClass('command-view')}>
            <div className="flex items-center justify-center w-6 h-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 10L9.5 12.5L7 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11.5 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            {!isCollapsed && <span className="ml-3 flex-1">Command Terminal</span>}
            {getNavItemTooltip('Command Terminal')}
          </div>
        </div>
      </nav>

      <div className={`p-3 border-t border-gray-800/50 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? '' : 'gap-2'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'}`}></div>
          {!isCollapsed && (
            <span className={`text-sm ${isConnected ? 'text-cyan-400' : 'text-amber-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;