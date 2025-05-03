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
  isCollapsed,
  theme
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

  // Navigation items definition
  const navItems = [
    {
      id: 'keys-view',
      label: 'Keys Explorer',
      icon: 'database'
    },
    {
      id: 'info-view',
      label: 'Server Dashboard',
      icon: 'chart-line'
    },
    {
      id: 'command-view',
      label: 'Command Terminal',
      icon: 'terminal'
    }
  ];

  // Dark mode styles
  const darkStyles = {
    sidebar: "bg-gray-900",
    header: "bg-gray-900",
    logo: "text-white",
    accent: "text-orange-300",
    navItem: "text-gray-400 hover:text-white",
    activeNavItem: "bg-gray-800 text-white border-l-2 border-cyan-500",
    divider: "border-gray-800",
    input: "bg-gray-800 border-gray-700 text-gray-200",
    button: "bg-cyan-600 hover:bg-cyan-700 text-white",
    status: isConnected ? "text-cyan-400" : "text-yellow-400",
    statusIndicator: isConnected ? "bg-cyan-500" : "bg-yellow-500"
  };

  // Light mode styles
  const lightStyles = {
    sidebar: "bg-white",
    header: "bg-white",
    logo: "text-gray-800",
    accent: "text-orange-500",
    navItem: "text-gray-500 hover:text-gray-900",
    activeNavItem: "bg-cyan-50 text-cyan-700 border-l-2 border-cyan-500",
    divider: "border-gray-100",
    input: "bg-white border-gray-300 text-gray-800",
    button: "bg-cyan-600 hover:bg-cyan-700 text-white",
    status: isConnected ? "text-cyan-600" : "text-yellow-600",
    statusIndicator: isConnected ? "bg-cyan-500" : "bg-yellow-500"
  };

  // Use appropriate style based on theme
  const styles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={`${styles.sidebar} h-screen flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} 
      shadow-md transition-all duration-200 z-20`}>
      
      {/* Logo Section */}
      <div className={`${styles.header} py-5 flex items-center justify-center border-b ${styles.divider}`}>
        {isCollapsed ? (
          <div className={`w-10 h-10 flex items-center justify-center rounded-lg  ${
            theme === 'dark' ? 'from-cyan-800 to-cyan-600' : 'from-cyan-600 to-cyan-400'
          } shadow-lg`}>
            <span className="text-white text-xl" role="img" aria-label="Lobster">🦞</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className={`w-10 h-10 flex items-center justify-center rounded-lg  ${
              theme === 'dark' ? 'from-cyan-800 to-cyan-600' : 'from-cyan-600 to-cyan-400'
            } shadow-lg mr-0`}>
              <span className="text-white text-xl" role="img" aria-label="Lobster">🦞</span>
            </div>
            <div>
              <span className={`text-lg font-medium ${styles.logo}`}>Redis</span>
              <span className={`text-lg font-bold ${styles.accent}`} style={{color:'#C42B1C'}}> Lens</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Connection Button - Only show in expanded mode */}
      {!isCollapsed && (
        <div className="px-4 py-3">
          <button 
            onClick={() => setShowConnectionForm(!showConnectionForm)}
                          className={`w-full py-2 px-3 rounded flex items-center justify-center gap-2 
              ${isConnected ? 'bg-opacity-10 border border-opacity-20' : ''} 
              ${isConnected ? 
                (theme === 'dark' ? 'bg-cyan-900 border-cyan-700 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-700') : 
                styles.button} 
              transition-colors`}
          >
            <i className={`fas ${isConnected ? 'fa-link' : 'fa-plug'}`}></i>
            <span>{isConnected ? 'Connected' : 'Connect'}</span>
            {isConnected && <i className="fas fa-chevron-down text-xs ml-auto"></i>}
          </button>
        </div>
      )}
      
      {/* Connection Form */}
      {!isCollapsed && showConnectionForm && (
        <div className={`px-4 py-3 border-b ${styles.divider}`}>
          <div className="space-y-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${styles.navItem}`}>Host</label>
              <input
                type="text"
                name="host"
                value={formData.host}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded text-sm ${styles.input} border focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500`}
                placeholder="localhost"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-medium mb-1 ${styles.navItem}`}>Port</label>
                <input
                  type="number"
                  name="port"
                  value={formData.port}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded text-sm ${styles.input} border focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500`}
                />
              </div>
              
              <div>
                <label className={`block text-xs font-medium mb-1 ${styles.navItem}`}>DB</label>
                <input
                  type="number"
                  name="db"
                  value={formData.db}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded text-sm ${styles.input} border focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${styles.navItem}`}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded text-sm ${styles.input} border focus:ring-1 focus:ring-red-500 focus:border-red-500`}
                placeholder="Optional"
              />
            </div>

            <button
              onClick={testConnection}
              className={`w-full py-2 px-4 rounded ${styles.button} transition-colors`}
            >
              {isConnected ? 'Reconnect' : 'Connect'}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <div className={`${!isCollapsed ? 'px-3 mb-2 text-xs font-medium uppercase' : 'sr-only'} ${styles.navItem}`}>
          Navigation
        </div>
        
        {navItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`
              ${isCollapsed ? 'mx-2 justify-center' : 'mx-3 px-3'} 
              cursor-pointer flex items-center py-2.5 my-1 rounded
              transition-colors duration-150
              ${activeView === item.id ? styles.activeNavItem : styles.navItem}
            `}
            title={isCollapsed ? item.label : null}
          >
            <i className={`fas fa-${item.icon} ${isCollapsed ? 'text-lg' : 'text-sm w-5'}`}></i>
            
            {!isCollapsed && (
              <span className="ml-3 text-sm">{item.label}</span>
            )}
          </div>
        ))}
      </nav>

      {/* Status Indicator - Minimal version */}
      {isCollapsed ? (
        <div className="py-5 flex justify-center">
          <div className={`w-2 h-2 rounded-full ${styles.statusIndicator}`}></div>
        </div>
      ) : (
        <div className={`px-4 py-3 border-t ${styles.divider} mt-auto`}>
          <div className={`flex items-center ${styles.status} text-sm`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${styles.statusIndicator}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            
            <span className="ml-auto text-xs opacity-50">v1.0.0</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;