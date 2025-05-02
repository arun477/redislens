import React, { useState } from 'react';
import axios from 'axios';

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
      const response = await axios.post('/api/ping', formData);
      
      if (response.data.status === 'ok') {
        setIsConnected(true);
        updateConnectionConfig(formData);
        showToast('Connection Successful', 'Connected to Redis server successfully.');
      } else {
        setIsConnected(false);
        showToast('Connection Failed', response.data.detail || 'Failed to connect to Redis server.', true);
      }
    } catch (error) {
      setIsConnected(false);
      showToast('Connection Error', error.response?.data?.detail || 'An error occurred while connecting to Redis server.', true);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <i className="fas fa-database text-red-500"></i>
          <h1 className="text-xl font-bold">Redis Explorer</h1>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-700">
        <div className="mb-4">
          <label className="block text-sm mb-1">
            <i className="fas fa-server mr-1"></i> Host
          </label>
          <input
            type="text"
            name="host"
            value={formData.host}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-black rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm mb-1">
            <i className="fas fa-plug mr-1"></i> Port
          </label>
          <input
            type="number"
            name="port"
            value={formData.port}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-black rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm mb-1">
            <i className="fas fa-layer-group mr-1"></i> DB
          </label>
          <input
            type="number"
            name="db"
            value={formData.db}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-black rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm mb-1">
            <i className="fas fa-key mr-1"></i> Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-black rounded"
          />
        </div>
        
        <button
          onClick={testConnection}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center"
        >
          <i className="fas fa-plug mr-2"></i> Connect
        </button>
      </div>
      
      <div className="flex-1">
        <div
          className={`p-4 cursor-pointer hover:bg-gray-700 flex items-center space-x-2 ${
            activeView === 'keys-view' ? 'bg-gray-700 border-l-4 border-red-500' : ''
          }`}
          onClick={() => setActiveView('keys-view')}
        >
          <i className="fas fa-key"></i>
          <span>Keys</span>
        </div>
        
        <div
          className={`p-4 cursor-pointer hover:bg-gray-700 flex items-center space-x-2 ${
            activeView === 'info-view' ? 'bg-gray-700 border-l-4 border-red-500' : ''
          }`}
          onClick={() => setActiveView('info-view')}
        >
          <i className="fas fa-info-circle"></i>
          <span>Server Info</span>
        </div>
        
        <div
          className={`p-4 cursor-pointer hover:bg-gray-700 flex items-center space-x-2 ${
            activeView === 'command-view' ? 'bg-gray-700 border-l-4 border-red-500' : ''
          }`}
          onClick={() => setActiveView('command-view')}
        >
          <i className="fas fa-terminal"></i>
          <span>Execute Command</span>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-700 flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
    </div>
  );
};

export default Sidebar;