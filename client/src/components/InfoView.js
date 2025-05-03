import React, { useState, useEffect } from 'react';

const infoViewStyles = {
  container: "p-6 max-w-6xl mx-auto",
  header: "flex justify-between items-center mb-6",
  title: "text-2xl font-semibold text-white flex items-center gap-3",
  refreshButton: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-md flex items-center transition-all duration-300 shadow-lg hover:shadow-red-900/30 gap-2",
  cardGrid: "grid grid-cols-1 lg:grid-cols-2 gap-6",
  card: "bg-black/30 p-5 rounded-lg shadow-xl border border-gray-800/30 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:border-gray-700/50",
  cardHeader: "text-lg font-semibold text-white border-b border-gray-800/50 pb-3 mb-4 flex items-center gap-2",
  cardContent: "space-y-3",
  infoRow: "flex items-start",
  infoLabel: "w-2/5 text-gray-400 text-sm truncate",
  infoValue: "w-3/5 font-medium text-white",
  noConnection: "text-center py-20 text-gray-400 flex flex-col items-center justify-center gap-4",
  noConnectionIcon: "text-5xl opacity-30"
};

const getCardIcon = (sectionName) => {
  switch(sectionName) {
    case 'Server': return <i className="fas fa-server text-blue-400"></i>;
    case 'Memory': return <i className="fas fa-memory text-green-400"></i>;
    case 'Stats': return <i className="fas fa-chart-line text-purple-400"></i>;
    case 'CPU': return <i className="fas fa-microchip text-yellow-400"></i>;
    default: return <i className="fas fa-info-circle text-gray-400"></i>;
  }
};

const formatValue = (key, value) => {
  // Format specific values for better readability
  if (key === 'uptime_in_seconds') {
    const days = Math.floor(value / 86400);
    const hours = Math.floor((value % 86400) / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;
    
    let uptime = '';
    if (days > 0) uptime += `${days}d `;
    if (hours > 0) uptime += `${hours}h `;
    if (minutes > 0) uptime += `${minutes}m `;
    uptime += `${seconds}s`;
    
    return uptime;
  }
  
  if (key === 'mem_fragmentation_ratio' && value) {
    return parseFloat(value).toFixed(2);
  }
  
  return value;
};

const InfoView = ({ isConnected, connectionConfig, showToast, setIsLoading }) => {
  const [info, setInfo] = useState({});

  const sections = {
    'Server': ['redis_version', 'redis_mode', 'uptime_in_seconds', 'os'],
    'Memory': ['used_memory_human', 'used_memory_peak_human', 'mem_fragmentation_ratio', 'maxmemory_human'],
    'Stats': ['total_connections_received', 'total_commands_processed', 'instantaneous_ops_per_sec', 'rejected_connections'],
    'CPU': ['used_cpu_sys', 'used_cpu_user', 'used_cpu_sys_children', 'used_cpu_user_children']
  };

  const fetchInfo = async () => {
    if (!isConnected) {
      showToast('Not Connected', 'Please connect to Redis server first.', true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionConfig)
      });
      
      const data = await response.json();
      setInfo(data.info || {});
    } catch (error) {
      showToast('Error', 'Failed to fetch server info.', true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchInfo();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className={infoViewStyles.noConnection}>
        <i className="fas fa-server text-gray-500 text-5xl opacity-30"></i>
        <p className="text-lg">Please connect to a Redis server to view information</p>
      </div>
    );
  }

  return (
    <div className={infoViewStyles.container}>
      <div className={infoViewStyles.header}>
        <h1 className={infoViewStyles.title}>
          <i className="fas fa-info-circle text-red-500"></i>
          Redis Server Information
        </h1>
        <button
          onClick={fetchInfo}
          className={infoViewStyles.refreshButton}
        >
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      <div className={infoViewStyles.cardGrid}>
        {Object.entries(sections).map(([sectionName, keys]) => (
          <div key={sectionName} className={infoViewStyles.card}>
            <h2 className={infoViewStyles.cardHeader}>
              {getCardIcon(sectionName)} {sectionName}
            </h2>

            <div className={infoViewStyles.cardContent}>
              {keys.map(key => (
                <div key={key} className={infoViewStyles.infoRow}>
                  <div className={infoViewStyles.infoLabel} title={key}>{key}</div>
                  <div className={infoViewStyles.infoValue}>{formatValue(key, info[key]) || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoView;