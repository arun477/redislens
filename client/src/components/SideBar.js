import React, { useState } from 'react';

const sidebarStyles = {
  container: "w-72 bg-gradient-to-b from-black to-gray-900 text-white h-screen flex flex-col shadow-xl border-r border-gray-800/30 backdrop-blur-lg z-10",
  header: "p-4 border-b border-gray-800/50 bg-black/30 backdrop-blur-md",
  logo: "text-xl font-bold flex items-center space-x-3",
  logoIcon: "text-red-500 text-2xl",
  formContainer: "p-4 border-b border-gray-800/50 space-y-4",
  formGroup: "space-y-1",
  formLabel: "text-xs uppercase tracking-wider text-gray-400 flex items-center",
  formInput: "w-full px-3 py-2 bg-gray-900/70 text-white border border-gray-700/50 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all duration-200 backdrop-blur-sm",
  connectButton: "w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-2 px-4 rounded-md flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-red-900/30",
  navMenu: "flex-1 py-2",
  navItem: "p-3 cursor-pointer hover:bg-gray-800/50 flex items-center space-x-3 mx-2 my-1 rounded-md transition-all duration-200",
  navItemActive: "bg-gradient-to-r from-red-600/20 to-transparent border-l-2 border-red-500 shadow-sm",
  navIcon: "text-gray-400 w-5",
  statusBar: "p-3 border-t border-gray-800/50 flex items-center space-x-2 bg-black/30 backdrop-blur-sm",
  statusIndicator: "w-2 h-2 rounded-full animate-pulse",
  statusConnected: "bg-green-500 shadow-sm shadow-green-500/50",
  statusDisconnected: "bg-red-500 shadow-sm shadow-red-500/50"
};

const Sidebar = ({ 
  activeView, 
  setActiveView, 
  isConnected, 
  setIsConnected, 
  connectionConfig, 
  updateConnectionConfig,
  showToast,
  setIsLoading
}) => {
  const [formData, setFormData] = useState(connectionConfig);

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
      
      // Use fetch instead of axios
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
    <div className={sidebarStyles.container}>
      <div className={sidebarStyles.header}>
        <div className={sidebarStyles.logo}>
          <i className="fas fa-database text-red-500"></i>
          <span>Redis Explorer</span>
        </div>
      </div>

      <div className={sidebarStyles.formContainer}>
        <div className={sidebarStyles.formGroup}>
          <label className={sidebarStyles.formLabel}>
            <i className="fas fa-server mr-2 opacity-70"></i> Host
          </label>
          <input
            type="text"
            name="host"
            value={formData.host}
            onChange={handleInputChange}
            className={sidebarStyles.formInput}
            placeholder="localhost"
          />
        </div>

        <div className={sidebarStyles.formGroup}>
          <label className={sidebarStyles.formLabel}>
            <i className="fas fa-plug mr-2 opacity-70"></i> Port
          </label>
          <input
            type="number"
            name="port"
            value={formData.port}
            onChange={handleInputChange}
            className={sidebarStyles.formInput}
          />
        </div>

        <div className={sidebarStyles.formGroup}>
          <label className={sidebarStyles.formLabel}>
            <i className="fas fa-layer-group mr-2 opacity-70"></i> Database
          </label>
          <input
            type="number"
            name="db"
            value={formData.db}
            onChange={handleInputChange}
            className={sidebarStyles.formInput}
          />
        </div>

        <div className={sidebarStyles.formGroup}>
          <label className={sidebarStyles.formLabel}>
            <i className="fas fa-key mr-2 opacity-70"></i> Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={sidebarStyles.formInput}
            placeholder="Optional"
          />
        </div>

        <button
          onClick={testConnection}
          className={sidebarStyles.connectButton}
        >
          <i className="fas fa-plug mr-2"></i> 
          {isConnected ? 'Reconnect' : 'Connect'}
        </button>
      </div>

      <nav className={sidebarStyles.navMenu}>
        <div
          className={`${sidebarStyles.navItem} ${activeView === 'keys-view' ? sidebarStyles.navItemActive : ''}`}
          onClick={() => setActiveView('keys-view')}
        >
          <i className="fas fa-key w-5 text-gray-400"></i>
          <span>Keys Browser</span>
        </div>

        <div
          className={`${sidebarStyles.navItem} ${activeView === 'info-view' ? sidebarStyles.navItemActive : ''}`}
          onClick={() => setActiveView('info-view')}
        >
          <i className="fas fa-info-circle w-5 text-gray-400"></i>
          <span>Server Info</span>
        </div>

        <div
          className={`${sidebarStyles.navItem} ${activeView === 'command-view' ? sidebarStyles.navItemActive : ''}`}
          onClick={() => setActiveView('command-view')}
        >
          <i className="fas fa-terminal w-5 text-gray-400"></i>
          <span>Command Console</span>
        </div>
      </nav>

      <div className={sidebarStyles.statusBar}>
        <div className={`${sidebarStyles.statusIndicator} ${isConnected ? sidebarStyles.statusConnected : sidebarStyles.statusDisconnected}`}></div>
        <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
    </div>
  );
};

export default Sidebar;