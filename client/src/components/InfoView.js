import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InfoView = ({ isConnected, connectionConfig, showToast, setIsLoading }) => {
  const [info, setInfo] = useState({});

  const sections = {
    'Server': ['redis_version', 'uptime_in_seconds', 'os'],
    'Memory': ['used_memory_human', 'used_memory_peak_human', 'mem_fragmentation_ratio'],
    'Stats': ['total_connections_received', 'total_commands_processed', 'instantaneous_ops_per_sec'],
    'CPU': ['used_cpu_sys', 'used_cpu_user', 'used_cpu_sys_children']
  };

  const fetchInfo = async () => {
    if (!isConnected) {
      showToast('Not Connected', 'Please connect to Redis server first.', true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('/api/info', connectionConfig);
      setInfo(response.data.info || {});
    } catch (error) {
      showToast('Error', error.response?.data?.detail || 'Failed to fetch server info.', true);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isConnected) {
      fetchInfo();
    }
  }, [isConnected]);

  return (
    <div className="p-4 bg-gray-800 text-white max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Redis Server Information</h1>
        <button
          onClick={fetchInfo}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition duration-150 ease-in-out"
        >
          <i className="fas fa-sync-alt mr-2"></i> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(sections).map(([sectionName, keys]) => (
          <div key={sectionName} className="bg-gray-900 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold border-b border-gray-600 pb-2 mb-4">{sectionName}</h2>

            {keys.map(key => (
              <div key={key} className="mb-3 flex">
                <div className="w-2/5 text-gray-400">{key}</div>
                <div className="w-3/5 font-medium">{info[key] || 'N/A'}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {!isConnected && (
        <div className="text-center py-8 text-gray-400">
          Please connect to a Redis server to view information.
        </div>
      )}
    </div>
  );
};

export default InfoView;