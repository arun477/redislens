import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';

const InfoView = ({ isConnected, connectionConfig, showToast, setIsLoading, theme }) => {
  const [info, setInfo] = useState({});
  const [opsHistory, setOpsHistory] = useState([]);
  const [memoryHistory, setMemoryHistory] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [refreshSpeed, setRefreshSpeed] = useState(3000); // 3 seconds
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Theme-dependent colors
  const isDark = theme === 'dark';
  const colors = {
    primary: isDark ? '#38B2AC' : '#0694A2', // teal-500 / cyan-600
    secondary: isDark ? '#3B82F6' : '#2563EB', // blue-500 / blue-600
    accent: isDark ? '#EC4899' : '#DB2777', // pink-500 / pink-600
    success: isDark ? '#10B981' : '#059669', // emerald-500 / emerald-600
    warning: isDark ? '#F59E0B' : '#D97706', // amber-500 / amber-600
    danger: isDark ? '#EF4444' : '#DC2626', // red-500 / red-600
    bgMain: isDark ? 'rgba(17, 24, 39, 0.7)' : 'rgba(255, 255, 255, 0.9)', // gray-900 / white
    bgHighlight: isDark ? 'rgba(31, 41, 55, 0.7)' : 'rgba(243, 244, 246, 0.9)', // gray-800 / gray-100
    borderColor: isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)', // gray-600 / gray-300
    textPrimary: isDark ? 'rgba(243, 244, 246, 1)' : 'rgba(31, 41, 55, 1)', // gray-100 / gray-800
    textSecondary: isDark ? 'rgba(156, 163, 175, 1)' : 'rgba(107, 114, 128, 1)', // gray-400 / gray-500
    chartFill: isDark ? 'rgba(56, 178, 172, 0.2)' : 'rgba(6, 148, 162, 0.1)', // teal-500 / cyan-600
    chartStroke: isDark ? '#38B2AC' : '#0694A2',
    chartGrid: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.3)'
  };

  // Define core metrics groups with explanations
  const metricGroups = [
    {
      id: 'general',
      title: 'General',
      icon: 'info-circle',
      color: colors.secondary,
      description: 'Core information about your Redis server instance including version, uptime, and connection statistics.',
      metrics: [
        {
          key: 'redis_version',
          label: 'Redis Version',
          description: 'Current version of the Redis server. Newer versions may include performance improvements and additional features.',
          details: 'Redis regularly releases updates that can include bug fixes, performance optimizations, and new commands or features. Check redis.io for changelog details about your specific version.',
          icon: 'tag',
          category: 'Server Information'
        },
        {
          key: 'uptime_in_seconds',
          label: 'Uptime',
          description: 'How long the Redis server has been running without interruption.',
          details: 'Redis is designed for high availability. Frequent restarts may indicate stability issues. For production environments, aim for high uptime values with planned maintenance windows.',
          icon: 'clock',
          format: (value) => formatUptime(value),
          category: 'Server Information'
        },
        {
          key: 'connected_clients',
          label: 'Connected Clients',
          description: 'Number of client connections currently open to the Redis server.',
          details: 'Each client connection consumes server resources. A high number might indicate a healthy, busy system, but an unexpectedly high value could suggest connection leaks in your application. The default maximum is 10,000 connections.',
          icon: 'users',
          category: 'Connection Statistics',
          warning: (value) => parseInt(value) > 5000 ? 'High number of connections' : null
        },
        {
          key: 'instantaneous_ops_per_sec',
          label: 'Operations/sec',
          description: 'Number of commands processed per second.',
          details: 'This represents the current throughput of your Redis server. This value fluctuates based on workload. Consistent high values may indicate heavy usage, while sudden spikes could point to traffic surges or potential abuse.',
          icon: 'tachometer-alt',
          category: 'Performance Metrics',
          warning: (value) => parseInt(value) > 10000 ? 'High operations rate' : null
        }
      ]
    },
    {
      id: 'memory',
      title: 'Memory Usage',
      icon: 'memory',
      color: colors.primary,
      description: 'Memory allocation and utilization statistics. Redis is an in-memory database, so these metrics are critical for performance and stability.',
      metrics: [
        {
          key: 'used_memory_human',
          label: 'Used Memory',
          description: 'Total memory currently allocated by Redis, including data and overhead.',
          details: 'This is the main indicator of your Redis instance size. Monitor this closely as you add data. If it approaches your system\'s available memory, you may need to implement key expiration policies, consider Redis Cluster for sharding, or upgrade your server.',
          icon: 'microchip',
          category: 'Memory Allocation'
        },
        {
          key: 'used_memory_peak_human',
          label: 'Peak Memory',
          description: 'Highest memory consumption since server start.',
          details: 'This shows the maximum memory Redis has used since startup. A significant difference between current and peak usage might indicate temporary spikes in data volume or memory leaks that were later resolved.',
          icon: 'mountain',
          category: 'Memory Allocation'
        },
        {
          key: 'maxmemory_human',
          label: 'Max Memory',
          description: 'Maximum memory limit configured for Redis (if set).',
          details: 'When Redis reaches this limit, it will start evicting keys according to the maxmemory-policy configuration. If not set (shows "no limit"), Redis can grow until it consumes all available system memory, which may lead to swap usage or OOM errors.',
          icon: 'tachometer-alt',
          default: 'No limit',
          category: 'Memory Configuration',
          warning: (value) => value === 'No limit' ? 'No memory limit set' : null
        },
        {
          key: 'mem_fragmentation_ratio',
          label: 'Memory Fragmentation',
          description: 'Ratio of memory allocated by operating system to memory requested by Redis.',
          details: 'Values above 1.0 indicate fragmentation (Redis has requested less memory than the OS has allocated to it). Values around 1.0-1.5 are normal. Higher values (>1.5) suggest memory fragmentation issues. Values below 1.0 may indicate Redis is using swap memory, which severely impacts performance.',
          icon: 'puzzle-piece',
          format: (value) => value ? parseFloat(value).toFixed(2) : 'N/A',
          category: 'Memory Efficiency',
          warning: (value) => value && (parseFloat(value) > 1.5 || parseFloat(value) < 1.0) ? 'Suboptimal fragmentation ratio' : null
        }
      ]
    },
    {
      id: 'stats',
      title: 'Performance Stats',
      icon: 'chart-line',
      color: colors.accent,
      description: 'Key performance indicators including connection history, command processing, and key expiration metrics.',
      metrics: [
        {
          key: 'total_connections_received',
          label: 'Total Connections',
          description: 'Total number of connections accepted by server since startup.',
          details: 'This counter shows the total connection attempts to your Redis server. A high value relative to uptime may indicate connection churn (clients connecting and disconnecting frequently) which can impact performance. Consider using connection pooling in your applications.',
          icon: 'plug',
          category: 'Connection History'
        },
        {
          key: 'total_commands_processed',
          label: 'Commands Processed',
          description: 'Total number of commands processed since server start.',
          details: 'Represents the cumulative workload processed by Redis. Divide by uptime to get average commands per second since start, which you can compare with instantaneous_ops_per_sec to understand if current load is typical or anomalous.',
          icon: 'terminal',
          category: 'Command Processing'
        },
        {
          key: 'expired_keys',
          label: 'Expired Keys',
          description: 'Total number of key expiration events.',
          details: "Shows how many keys have been removed due to TTL expiration. If this number is large relative to your total keys, your expiration strategy is working. If it's unexpectedly low despite setting TTLs, check your expiration policy and key time settings.",
          icon: 'clock',
          default: '0',
          category: 'Key Management'
        },
        {
          key: 'evicted_keys',
          label: 'Evicted Keys',
          description: 'Number of keys removed due to reaching maxmemory limit.',
          details: 'Keys evicted due to memory pressure according to your maxmemory-policy. A high or rapidly increasing value indicates your Redis instance is under memory pressure. Consider increasing maxmemory, adding more servers, or reviewing your data storage patterns.',
          icon: 'trash',
          default: '0',
          category: 'Key Management',
          warning: (value) => parseInt(value) > 0 ? 'Keys being evicted due to memory limits' : null
        }
      ]
    }
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
      
      // Update operations history for chart
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      // Update operations chart data
      setOpsHistory(prev => {
        const newHistory = [...prev, {
          timestamp,
          ops: parseInt(infoData.instantaneous_ops_per_sec || 0)
        }];
        
        // Keep only the last 20 data points
        return newHistory.slice(-20);
      });
      
      // Update memory chart data
      setMemoryHistory(prev => {
        const newHistory = [...prev, {
          timestamp,
          used: parseFloat(convertToMB(infoData.used_memory || 0)),
          rss: parseFloat(convertToMB(infoData.used_memory_rss || 0)),
        }];
        
        // Keep only the last 20 data points
        return newHistory.slice(-20);
      });
    } catch (error) {
      showToast('Error', 'Failed to fetch server info.', true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const convertToMB = (bytesStr) => {
    const bytes = parseInt(bytesStr);
    return (bytes / 1024 / 1024).toFixed(2); // Return MB with 2 decimal places
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
  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      // Turn off auto-refresh
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
      setAutoRefresh(false);
    } else {
      // Turn on auto-refresh
      const interval = setInterval(fetchInfo, refreshSpeed);
      setRefreshInterval(interval);
      setAutoRefresh(true);
    }
  };

  // Update refresh interval when speed changes
  useEffect(() => {
    if (autoRefresh) {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      const interval = setInterval(fetchInfo, refreshSpeed);
      setRefreshInterval(interval);
    }
  }, [refreshSpeed]);
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded shadow-lg`}>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className={`text-sm font-mono ${entry.color}`}>
              {entry.name}: {entry.value.toFixed(2)} {entry.unit}
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

  // Initial load and cleanup
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

  // Render value with formatting if applicable
  const renderValue = (metric, value) => {
    if (value === undefined || value === null) {
      return metric.default || 'N/A';
    }
    
    if (metric.format) {
      return metric.format(value);
    }
    
    return value;
  };

  // Check if a metric has a warning
  const getMetricWarning = (metric, value) => {
    if (metric.warning && value !== undefined && value !== null) {
      return metric.warning(value);
    }
    return null;
  };

  // Style classes based on theme
  const styles = {
    container: isDark
      ? 'bg-gray-900 bg-opacity-50 text-gray-200'
      : 'bg-white bg-opacity-80 text-gray-800',
    card: isDark
      ? 'bg-gray-800 bg-opacity-70 border border-gray-700 shadow-lg'
      : 'bg-white border border-gray-200 shadow-lg',
    cardHeader: isDark
      ? 'border-gray-700'
      : 'border-gray-200',
    button: isDark
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white',
    secondaryButton: isDark
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    metricItem: isDark
      ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
      : 'bg-white border border-gray-200 hover:bg-gray-50',
    metricItemActive: isDark
      ? 'bg-blue-900/20 border border-blue-600'
      : 'bg-blue-50 border border-blue-500',
    metricLabel: isDark
      ? 'text-gray-400'
      : 'text-gray-500',
    metricValue: isDark
      ? 'text-gray-200'
      : 'text-gray-800',
    infoPanel: isDark
      ? 'bg-gray-800 border-l border-gray-700'
      : 'bg-white border-l border-gray-200'
  };

  // Get formatted data for memory distribution chart
  const getMemoryDistributionData = () => {
    if (!info || !info.used_memory) return [];
    
    const usedMemory = parseInt(info.used_memory);
    const rssMemory = parseInt(info.used_memory_rss || 0);
    
    return [
      { name: 'Redis Data', value: usedMemory, color: colors.primary },
      { name: 'Overhead', value: Math.max(0, rssMemory - usedMemory), color: colors.warning }
    ];
  };

  // Show detailed info for a specific metric
  const showMetricDetails = (metric) => {
    setSelectedMetric(metric);
    setShowInfoPanel(true);
  };

  // Render info panel with detailed metric information
  const renderInfoPanel = () => {
    if (!selectedMetric) return null;
    
    const value = info[selectedMetric.key];
    const formattedValue = renderValue(selectedMetric, value);
    const warning = getMetricWarning(selectedMetric, value);
    
    return (
      <div className={`${styles.infoPanel} w-96 h-full overflow-auto p-6 transition-all duration-300`}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'} mr-3`}>
              <i className={`fas fa-${selectedMetric.icon} ${isDark ? 'text-blue-400' : 'text-blue-600'}`}></i>
            </div>
            <h3 className="text-xl font-semibold">{selectedMetric.label}</h3>
          </div>
          <button 
            onClick={() => setShowInfoPanel(false)}
            className={`p-2 rounded hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
          <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current Value</div>
          <div className="text-2xl font-semibold">{formattedValue}</div>
          {warning && (
            <div className={`mt-2 flex items-center text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {warning}
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-2">Description</h4>
            <p className="mb-4">{selectedMetric.description}</p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{selectedMetric.details}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-2">Category</h4>
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {selectedMetric.category}
            </div>
          </div>
          
          {selectedMetric.key === 'instantaneous_ops_per_sec' && opsHistory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-2">Historical Trend</h4>
              <div className="h-48 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={opsHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{ fill: isDark ? '#9CA3AF' : '#4B5563' }} 
                      axisLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
                    />
                    <YAxis 
                      tick={{ fill: isDark ? '#9CA3AF' : '#4B5563' }} 
                      axisLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="ops" 
                      stroke={colors.chartStroke} 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, stroke: colors.primary, fill: isDark ? '#1F2937' : '#FFFFFF' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {selectedMetric.key === 'used_memory_human' && memoryHistory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-2">Historical Trend</h4>
              <div className="h-48 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={memoryHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                    <XAxis 
                      dataKey="timestamp" 
                      tick={{ fill: isDark ? '#9CA3AF' : '#4B5563' }} 
                      axisLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
                    />
                    <YAxis 
                      tick={{ fill: isDark ? '#9CA3AF' : '#4B5563' }} 
                      axisLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="used" 
                      name="Used Memory"
                      stroke={colors.chartStroke} 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6, stroke: colors.primary, fill: isDark ? '#1F2937' : '#FFFFFF' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {selectedMetric.key === 'mem_fragmentation_ratio' && (
            <div>
              <h4 className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-2">Best Practices</h4>
              <ul className={`list-disc pl-5 space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li><span className="font-medium">1.0 - 1.5:</span> Normal range, good memory efficiency</li>
                <li><span className="font-medium">&gt; 1.5:</span> High fragmentation, consider running MEMORY PURGE or restarting Redis</li>
                <li><span className="font-medium">&lt; 1.0:</span> Redis is using swap memory, which severely impacts performance</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className={`flex items-center justify-center h-full ${isDark ? 'bg-gray-900 bg-opacity-30' : 'bg-gray-50 bg-opacity-30'}`}>
        <div className={`text-center p-8 max-w-md ${styles.card} rounded-xl backdrop-blur-sm transition-all duration-300 transform hover:scale-105`}>
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 shadow-lg shadow-blue-500/30">
            <i className="fas fa-server text-white text-4xl"></i>
          </div>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Not Connected</h2>
          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Please connect to a Redis server to view server information and statistics.
          </p>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg shadow-lg transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl">
            <i className="fas fa-plug mr-2"></i>Connect
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full">
      <div className={`${styles.container} ${showInfoPanel ? 'w-3/4' : 'w-full'} overflow-auto transition-all duration-300`}>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-3`}>
                <i className={`fas fa-server ${isDark ? 'text-blue-400' : 'text-blue-600'}`}></i>
                Redis Server Dashboard
              </h1>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {info.redis_version ? `Redis ${info.redis_version}` : 'Server information and metrics'}
                {info.os ? ` on ${info.os}` : ''}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                <select
                  value={refreshSpeed}
                  onChange={(e) => setRefreshSpeed(parseInt(e.target.value))}
                  className={`px-3 py-2 ${isDark ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-800 border-gray-200'} rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  disabled={!autoRefresh}
                >
                  <option value={1000}>1s</option>
                  <option value={3000}>3s</option>
                  <option value={5000}>5s</option>
                  <option value={10000}>10s</option>
                </select>
                <button
                  onClick={toggleAutoRefresh}
                  className={`px-3 py-2 flex items-center gap-2 ${
                    autoRefresh 
                      ? isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700' 
                      : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                  } focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-r-lg transition-colors`}
                >
                  <i className={`fas fa-${autoRefresh ? 'pause' : 'play'} text-sm`}></i>
                  <span className="hidden md:inline">{autoRefresh ? 'Pause' : 'Auto'}</span>
                </button>
              </div>
              
              <button
                onClick={fetchInfo}
                className={`px-3 py-2 rounded-lg ${styles.button} shadow-md flex items-center gap-2 transition-all duration-300 transform hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              >
                <i className="fas fa-sync-alt"></i>
                <span className="hidden md:inline">Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Dashboard Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Version Card */}
            <div 
              className={`${styles.card} rounded-xl p-4 cursor-pointer transition-all hover:shadow-md`} 
              onClick={() => showMetricDetails(metricGroups[0].metrics[0])}
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} mr-3`}>
                  <i className={`fas fa-tag text-xl ${isDark ? 'text-blue-400' : 'text-blue-600'}`}></i>
                </div>
                <div>
                  <div className={`text-sm ${styles.metricLabel}`}>Redis Version</div>
                  <div className={`text-xl font-semibold ${styles.metricValue}`}>{info.redis_version || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            {/* Uptime Card */}
            <div 
              className={`${styles.card} rounded-xl p-4 cursor-pointer transition-all hover:shadow-md`} 
              onClick={() => showMetricDetails(metricGroups[0].metrics[1])}
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'} mr-3`}>
                  <i className={`fas fa-clock text-xl ${isDark ? 'text-green-400' : 'text-green-600'}`}></i>
                </div>
                <div>
                  <div className={`text-sm ${styles.metricLabel}`}>Uptime</div>
                  <div className={`text-xl font-semibold ${styles.metricValue}`}>{formatUptime(info.uptime_in_seconds)}</div>
                </div>
              </div>
            </div>
            
            {/* Connections Card */}
            <div 
              className={`${styles.card} rounded-xl p-4 cursor-pointer transition-all hover:shadow-md`} 
              onClick={() => showMetricDetails(metricGroups[0].metrics[2])}
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'} mr-3`}>
                  <i className={`fas fa-users text-xl ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}></i>
                </div>
                <div>
                  <div className={`text-sm ${styles.metricLabel}`}>Connected Clients</div>
                  <div className={`text-xl font-semibold ${styles.metricValue}`}>{info.connected_clients || '0'}</div>
                </div>
              </div>
            </div>
            
            {/* Memory Card */}
            <div 
              className={`${styles.card} rounded-xl p-4 cursor-pointer transition-all hover:shadow-md`} 
              onClick={() => showMetricDetails(metricGroups[1].metrics[0])}
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-red-900/20' : 'bg-red-50'} mr-3`}>
                  <i className={`fas fa-memory text-xl ${isDark ? 'text-red-400' : 'text-red-600'}`}></i>
                </div>
                <div>
                  <div className={`text-sm ${styles.metricLabel}`}>Memory Usage</div>
                  <div className={`text-xl font-semibold ${styles.metricValue}`}>{info.used_memory_human || '0B'}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Operations Chart */}
            <div className={`${styles.card} rounded-xl overflow-hidden backdrop-blur-sm lg:col-span-2`}>
              <div className={`p-4 border-b ${styles.cardHeader} flex justify-between items-center`}>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <i className={`fas fa-tachometer-alt ${isDark ? 'text-blue-400' : 'text-blue-600'}`}></i>
                  Operations per Second
                </h2>
                <div className={`text-sm px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-cyan-300' : 'bg-gray-100 text-cyan-700'}`}>
                  {info.instantaneous_ops_per_sec || '0'} ops/sec
                </div>
              </div>
              <div className="p-4 h-64">
                {opsHistory.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={opsHistory} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="opsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors.chartStroke} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={colors.chartStroke} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid} />
                      <XAxis 
                        dataKey="timestamp" 
                        tick={{ fill: isDark ? '#9CA3AF' : '#4B5563' }} 
                        axisLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
                      />
                      <YAxis 
                        tick={{ fill: isDark ? '#9CA3AF' : '#4B5563' }} 
                        axisLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="ops" 
                        name="Operations" 
                        stroke={colors.chartStroke} 
                        strokeWidth={2} 
                        fillOpacity={1}
                        fill="url(#opsGradient)"
                        unit=" ops/sec"
                        activeDot={{ r: 6, stroke: colors.primary, strokeWidth: 2, fill: isDark ? '#1F2937' : '#FFFFFF' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <i className={`fas fa-chart-line ${isDark ? 'text-gray-700' : 'text-gray-300'} text-4xl mb-3`}></i>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Collecting performance data...</p>
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Enable auto-refresh to see the chart</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Memory Distribution Chart */}
            <div className={`${styles.card} rounded-xl overflow-hidden backdrop-blur-sm`}>
              <div className={`p-4 border-b ${styles.cardHeader} flex justify-between items-center`}>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <i className={`fas fa-memory ${isDark ? 'text-blue-400' : 'text-blue-600'}`}></i>
                  Memory Distribution
                </h2>
              </div>
              <div className="p-4 h-64 flex flex-col">
                {info.used_memory ? (
                  <>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getMemoryDistributionData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {getMemoryDistributionData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `${(value)}`}
                            labelFormatter={() => ''} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-center gap-4">
                        {getMemoryDistributionData().map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className={`text-sm ${styles.metricLabel}`}>
                              {entry.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <i className={`fas fa-chart-pie ${isDark ? 'text-gray-700' : 'text-gray-300'} text-4xl mb-3`}></i>
                      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Memory data unavailable</p>
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Refresh to load data</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Metrics Groups */}
          <div className="space-y-6">
            {metricGroups.map(group => (
              <div key={group.id} className={`${styles.card} rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300`}>
                <div className={`p-4 border-b ${styles.cardHeader}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${
                        group.id === 'general' 
                          ? 'from-blue-600 to-blue-500' 
                          : group.id === 'memory' 
                            ? 'from-cyan-600 to-cyan-500' 
                            : 'from-purple-600 to-pink-500'
                      } shadow-lg`}>
                        <i className={`fas fa-${group.icon} text-white`}></i>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{group.title}</h2>
                        <p className={`text-sm ${styles.metricLabel}`}>{group.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {group.metrics.map(metric => {
                      const value = info[metric.key];
                      const formattedValue = renderValue(metric, value);
                      const warning = getMetricWarning(metric, value);
                      
                      return (
                        <div 
                          key={metric.key}
                          className={`${selectedMetric && selectedMetric.key === metric.key ? styles.metricItemActive : styles.metricItem} p-4 rounded-xl transition-all duration-200 cursor-pointer`}
                          onClick={() => showMetricDetails(metric)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className={`${styles.metricLabel} text-xs uppercase tracking-wider`}>
                              {metric.label}
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isDark 
                                ? 'bg-gray-700'
                                : 'bg-gray-100'
                            }`}>
                              <i className={`fas fa-${metric.icon} ${
                                isDark 
                                  ? 'text-' + (
                                      group.id === 'general' ? 'blue' : 
                                      group.id === 'memory' ? 'cyan' : 'purple'
                                    ) + '-400'
                                  : 'text-' + (
                                      group.id === 'general' ? 'blue' : 
                                      group.id === 'memory' ? 'cyan' : 'purple'
                                    ) + '-600'
                              }`}></i>
                            </div>
                          </div>
                          <div className={`${styles.metricValue} text-xl font-semibold mt-1`}>
                            {formattedValue}
                          </div>
                          {warning && (
                            <div className={`mt-2 px-2 py-0.5 rounded text-xs inline-flex items-center ${
                              isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-50 text-yellow-700'
                            }`}>
                              <i className="fas fa-exclamation-triangle mr-1.5"></i>
                              {warning}
                            </div>
                          )}
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2 line-clamp-2`} title={metric.description}>
                            {metric.description}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Info Panel / Slide-in Right Panel */}
      {showInfoPanel && renderInfoPanel()}
    </div>
  );
};

export default InfoView;