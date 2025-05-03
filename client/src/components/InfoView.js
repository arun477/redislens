import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const InfoView = ({ isConnected, connectionConfig, showToast, setIsLoading }) => {
  const [info, setInfo] = useState({});
  const [statsHistory, setStatsHistory] = useState({
    operations: [],
    memory: [],
    clients: []
  });
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const chartColors = [
    '#00FFFF', // Cyan
    '#FF5A5F', // Red
    '#88B04B', // Green
    '#FFDC5E', // Yellow
    '#6A5ACD', // Purple
    '#F49F0A', // Orange
  ];
  
  const refreshIntervals = [
    { label: 'Off', value: 0 },
    { label: '5s', value: 5000 },
    { label: '10s', value: 10000 },
    { label: '30s', value: 30000 },
    { label: '1m', value: 60000 }
  ];

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
      const infoData = data.info || {};
      setInfo(infoData);
      
      // Update stats history
      const timestamp = new Date().toLocaleTimeString();
      
      setStatsHistory(prev => {
        // Keep only last 20 data points
        const operations = [...prev.operations, {
          timestamp,
          ops: parseInt(infoData.instantaneous_ops_per_sec || 0),
          commands: parseInt(infoData.total_commands_processed || 0)
        }].slice(-20);
        
        const memory = [...prev.memory, {
          timestamp,
          used: convertToMB(infoData.used_memory || 0),
          rss: convertToMB(infoData.used_memory_rss || 0),
        }].slice(-20);
        
        const clients = [...prev.clients, {
          timestamp,
          connected: parseInt(infoData.connected_clients || 0)
        }].slice(-20);
        
        return { operations, memory, clients };
      });
    } catch (error) {
      showToast('Error', 'Failed to fetch server info.', true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const convertToMB = (bytesStr) => {
    const bytes = parseInt(bytesStr);
    return Math.round((bytes / 1024 / 1024) * 100) / 100; // Return MB with 2 decimal places
  };
  
  const formatUptime = (seconds) => {
    if (!seconds) return 'Unknown';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let uptime = '';
    if (days > 0) uptime += `${days}d `;
    if (hours > 0 || days > 0) uptime += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) uptime += `${minutes}m `;
    uptime += `${secs}s`;
    
    return uptime;
  };
  
  // Toggle auto-refresh
  const toggleAutoRefresh = (intervalMs) => {
    // Clear existing interval if any
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    
    if (intervalMs > 0) {
      // Set new interval
      const interval = setInterval(fetchInfo, intervalMs);
      setRefreshInterval(interval);
      setAutoRefresh(true);
    } else {
      setAutoRefresh(false);
    }
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-2 border border-gray-800 rounded text-sm">
          <p className="text-gray-400">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Handle refresh event from Header
  useEffect(() => {
    const handleRefresh = () => {
      fetchInfo();
    };
    
    window.addEventListener('refreshInfo', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshInfo', handleRefresh);
    };
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchInfo();
    }
    
    // Cleanup interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full bg-black/20 backdrop-blur-sm">
        <div className="text-center p-8 max-w-md">
          <i className="fas fa-server text-gray-500 text-5xl mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Not Connected</h2>
          <p className="text-gray-500">
            Please connect to a Redis server to view server information and statistics.
          </p>
        </div>
      </div>
    );
  }
  
  // Prepare data for memory distribution pie chart
  const memoryData = [
    { name: 'Used', value: convertToMB(info.used_memory || 0) },
    { name: 'RSS', value: convertToMB(info.used_memory_rss || 0) - convertToMB(info.used_memory || 0) }
  ];
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <i className="fas fa-chart-line text-cyan-500"></i>
          Redis Server Dashboard
        </h1>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/30 rounded-md p-1 border border-gray-800/50">
            {refreshIntervals.map(interval => (
              <button
                key={interval.value}
                onClick={() => toggleAutoRefresh(interval.value)}
                className={`px-3 py-1 rounded text-sm ${
                  (interval.value === 0 && !autoRefresh) || (autoRefresh && refreshInterval && interval.value === refreshInterval._idleTimeout)
                    ? 'bg-cyan-900/50 text-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {interval.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={fetchInfo}
            className="px-3 py-2 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 rounded flex items-center gap-2 transition-colors"
          >
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>
      
      {/* Server Info Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 backdrop-blur-sm border border-gray-800/40 rounded-lg p-4 shadow-lg">
          <div className="text-xs uppercase text-gray-500 mb-1">Redis Version</div>
          <div className="text-xl font-semibold flex items-center gap-2">
            <i className="fas fa-tag text-cyan-500"></i>
            {info.redis_version || 'Unknown'}
          </div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm border border-gray-800/40 rounded-lg p-4 shadow-lg">
          <div className="text-xs uppercase text-gray-500 mb-1">Uptime</div>
          <div className="text-xl font-semibold flex items-center gap-2">
            <i className="fas fa-clock text-cyan-500"></i>
            {formatUptime(info.uptime_in_seconds)}
          </div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm border border-gray-800/40 rounded-lg p-4 shadow-lg">
          <div className="text-xs uppercase text-gray-500 mb-1">Connected Clients</div>
          <div className="text-xl font-semibold flex items-center gap-2">
            <i className="fas fa-users text-cyan-500"></i>
            {info.connected_clients || '0'}
          </div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm border border-gray-800/40 rounded-lg p-4 shadow-lg">
          <div className="text-xs uppercase text-gray-500 mb-1">Operations/sec</div>
          <div className="text-xl font-semibold flex items-center gap-2">
            <i className="fas fa-tachometer-alt text-cyan-500"></i>
            {info.instantaneous_ops_per_sec || '0'}
          </div>
        </div>
      </div>
      
      {/* Operations Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-black/30 backdrop-blur-sm border border-gray-800/40 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-800/50 pb-2">
            Operations per Second
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsHistory.operations} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="timestamp" tick={{ fill: '#718096' }} />
                <YAxis tick={{ fill: '#718096' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="ops" name="Ops/sec" stroke="#00FFFF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm border border-gray-800/40 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-800/50 pb-2">
            Memory Usage (MB)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsHistory.memory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="timestamp" tick={{ fill: '#718096' }} />
                <YAxis tick={{ fill: '#718096' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="used" name="Used Memory" stroke="#00FFFF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="rss" name="RSS Memory" stroke="#FF5A5F" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Memory Stats and Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-black/30 backdrop-blur-sm border border-gray-800/40 rounded-lg p-4 shadow-lg lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-800/50 pb-2">
            Memory Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-black/40 rounded-lg border border-gray-800/50">
              <div className="text-xs uppercase text-gray-500 mb-1">Used Memory</div>
              <div className="text-lg font-semibold">{info.used_memory_human || '0B'}</div>
            </div>
            
            <div className="p-3 bg-black/40 rounded-lg border border-gray-800/50">
              <div className="text-xs uppercase text-gray-500 mb-1">Peak Memory</div>
              <div className="text-lg font-semibold">{info.used_memory_peak_human || '0B'}</div>
            </div>
            
            <div className="p-3 bg-black/40 rounded-lg border border-gray-800/50">
              <div className="text-xs uppercase text-gray-500 mb-1">RSS Memory</div>
              <div className="text-lg font-semibold">{info.used_memory_rss_human || '0B'}</div>
            </div>
            
            <div className="p-3 bg-black/40 rounded-lg border border-gray-800/50">
              <div className="text-xs uppercase text-gray-500 mb-1">Memory Fragmentation</div>
              <div className="text-lg font-semibold">{info.mem_fragmentation_ratio ? parseFloat(info.mem_fragmentation_ratio).toFixed(2) : 'N/A'}</div>
            </div>
            
            <div className="p-3 bg-black/40 rounded-lg border border-gray-800/50">
              <div className="text-xs uppercase text-gray-500 mb-1">Max Memory</div>
              <div className="text-lg font-semibold">{info.maxmemory_human || 'Unlimited'}</div>
            </div>
            
            <div className="p-3 bg-black/40 rounded-lg border border-gray-800/50">
              <div className="text-xs uppercase text-gray-500 mb-1">Max Memory Policy</div>
              <div className="text-lg font-semibold">{info.maxmemory_policy || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm border border-gray-800/40 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-800/50 pb-2">
            Memory Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {memoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Stats Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-black/30 backdrop-blur-sm border border-gray-800/40 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-800/50 pb-2">
            CPU Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">System CPU</span>
              <span>{info.used_cpu_sys || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">User CPU</span>
              <span>{info.used_cpu_user || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">System Children CPU</span>
              <span>{info.used_cpu_sys_children || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">User Children CPU</span>
              <span>{info.used_cpu_user_children || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm border border-gray-800/40 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-800/50 pb-2">
            Connection Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Connected Clients</span>
              <span>{info.connected_clients || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Connections</span>
              <span>{info.total_connections_received || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rejected Connections</span>
              <span>{info.rejected_connections || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Blocked Clients</span>
              <span>{info.blocked_clients || '0'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm border border-gray-800/40 rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-800/50 pb-2">
            Persistence
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">RDB Changes Since Last Save</span>
              <span>{info.rdb_changes_since_last_save || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Save Time</span>
              <span>{info.rdb_last_save_time ? new Date(info.rdb_last_save_time * 1000).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AOF Enabled</span>
              <span>{info.aof_enabled === '1' ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">RDB Save in Progress</span>
              <span>{info.rdb_bgsave_in_progress === '1' ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoView;