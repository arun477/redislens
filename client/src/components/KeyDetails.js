import React, { useState, useEffect, useRef } from 'react';

const KeyDetails = ({ keyDetails, onDelete, connectionConfig, showToast, setIsLoading, theme }) => {
  const [activeTab, setActiveTab] = useState('value'); // 'value', 'metadata', 'actions'
  const [ttlValue, setTtlValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [copyAnimations, setCopyAnimations] = useState({});
  const valueRef = useRef(null);
  
  // Set TTL value when keyDetails changes
  useEffect(() => {
    if (keyDetails && keyDetails.ttl !== undefined) {
      setTtlValue(keyDetails.ttl === -1 ? '' : keyDetails.ttl.toString());
    }
  }, [keyDetails]);
  
  // Auto-clear copy animations after a delay
  useEffect(() => {
    const timers = Object.keys(copyAnimations).map(key => {
      return setTimeout(() => {
        setCopyAnimations(prev => {
          const newAnimations = {...prev};
          delete newAnimations[key];
          return newAnimations;
        });
      }, 1500); // Animation lasts 1.5 seconds
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [copyAnimations]);
  
  // Theme-dependent styles
  const isDark = theme === 'dark';
  
  const styles = {
    // Main container styles
    container: isDark ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800',
    panel: isDark ? 'bg-gray-800' : 'bg-white',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    divider: isDark ? 'border-gray-700' : 'border-gray-200',
    
    // Text and accent colors
    text: {
      primary: isDark ? 'text-white' : 'text-gray-900',
      secondary: isDark ? 'text-gray-400' : 'text-gray-500',
      accent: isDark ? 'text-blue-400' : 'text-blue-600',
    },
    
    // Background colors
    bg: {
      hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
      selected: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
      accent: isDark ? 'bg-blue-600' : 'bg-blue-600',
      input: isDark ? 'bg-gray-800' : 'bg-white',
      code: isDark ? 'bg-gray-950' : 'bg-gray-50',
    },
    
    // Button styles
    button: {
      primary: `${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`,
      secondary: `${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`,
      danger: `${isDark ? 'bg-red-600/30 hover:bg-red-600/50 text-red-300' : 'bg-red-50 hover:bg-red-100 text-red-600'}`,
      copy: {
        default: `${isDark ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' : 'bg-gray-100 hover:bg-gray-200 text-blue-600'}`,
        success: `${isDark ? 'bg-green-700 text-green-200' : 'bg-green-100 text-green-600'}`
      }
    },
    
    // Input styles
    input: `${isDark ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-800'} focus:border-blue-500 focus:ring-blue-500`,
    
    // Tab styles
    tab: {
      active: isDark ? 'text-blue-400 border-blue-400' : 'text-blue-600 border-blue-600',
      inactive: isDark ? 'text-gray-400 hover:text-gray-300 border-transparent' : 'text-gray-500 hover:text-gray-700 border-transparent',
    },
    
    // Type-specific colors
    typeColors: {
      string: isDark ? 'border-blue-900 bg-blue-900/20 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-700',
      list: isDark ? 'border-green-900 bg-green-900/20 text-green-400' : 'border-green-200 bg-green-50 text-green-700',
      set: isDark ? 'border-purple-900 bg-purple-900/20 text-purple-400' : 'border-purple-200 bg-purple-50 text-purple-700',
      zset: isDark ? 'border-yellow-900 bg-yellow-900/20 text-yellow-400' : 'border-yellow-200 bg-yellow-50 text-yellow-700',
      hash: isDark ? 'border-red-900 bg-red-900/20 text-red-400' : 'border-red-200 bg-red-50 text-red-700',
    }
  };
  
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatTTL = (seconds) => {
    if (seconds === -1) return 'No expiration';
    if (seconds < 0) return 'Key does not exist';
    
    if (seconds < 60) return `${seconds} seconds`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      'string': <i className="fas fa-font"></i>,
      'list': <i className="fas fa-list"></i>,
      'set': <i className="fas fa-th-large"></i>,
      'zset': <i className="fas fa-sort-amount-up"></i>,
      'hash': <i className="fas fa-hashtag"></i>
    };
    
    return iconMap[type] || <i className="fas fa-question-circle"></i>;
  };
  
  const getTypeDescription = (type) => {
    const descriptions = {
      'string': 'String values can be text, numbers, or binary data up to 512MB.',
      'list': 'An ordered collection of strings, similar to an array.',
      'set': 'An unordered collection of unique strings.',
      'zset': 'A sorted set with each member having a score for ordering.',
      'hash': 'A map of field-value pairs, like a JSON object or dictionary.'
    };
    
    return descriptions[type] || 'Unknown data type';
  };
  
  const getTypeColor = (type) => {
    return styles.typeColors[type] || 'border-gray-200 bg-gray-50';
  };
  
  // Copy to clipboard function with animation
  const copyToClipboard = (text, id = 'general') => {
    navigator.clipboard.writeText(text).then(() => {
      // Set animation state for this specific element
      setCopyAnimations(prev => ({
        ...prev,
        [id]: true
      }));
      
      showToast('Copied', 'Copied to clipboard.');
    }, (err) => {
      showToast('Error', 'Could not copy to clipboard.', true);
    });
  };

  // Get copy button class based on animation state
  const getCopyButtonClass = (id = 'general') => {
    return `p-1.5 rounded-md transition-all ${
      copyAnimations[id] 
        ? styles.button.copy.success
        : styles.button.copy.default
    }`;
  };

  // Get copy icon based on animation state
  const getCopyIcon = (id = 'general') => {
    return copyAnimations[id] 
      ? <i className="fas fa-check text-xs"></i> 
      : <i className="fas fa-copy text-xs"></i>;
  };

  // Update TTL function
  const updateTTL = async () => {
    if (!keyDetails || !keyDetails.key) return;
    
    const ttl = ttlValue === '' ? -1 : parseInt(ttlValue);
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...connectionConfig,
          command: ttl === -1 ? 'PERSIST' : 'EXPIRE',
          args: ttl === -1 ? [keyDetails.key] : [keyDetails.key, ttl.toString()]
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.result) {
        showToast('Success', ttl === -1 
          ? 'Expiration removed.' 
          : `Expiration set to ${formatTTL(ttl)}.`
        );
        
        // Update local keyDetails object
        keyDetails.ttl = ttl;
      } else {
        showToast('Error', 'Failed to update expiration.', true);
      }
    } catch (error) {
      showToast('Error', 'An error occurred while updating expiration.', true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete key with confirmation
  const handleDelete = () => {
    if (keyDetails && keyDetails.key) {
      onDelete(keyDetails.key);
    }
  };
  
  // Save edited value
  const saveEditedValue = async () => {
    if (!keyDetails || !keyDetails.key) return;
    
    try {
      setIsLoading(true);
      
      // Different commands based on data type
      let command = 'SET';
      let args = [keyDetails.key, editValue];
      
      // Save the current TTL if it exists
      if (keyDetails.ttl > 0) {
        command = 'SET';
        args.push('EX', keyDetails.ttl.toString());
      }
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...connectionConfig,
          command,
          args
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast('Success', 'Value updated successfully.');
        // Update local keyDetails object
        keyDetails.value = editValue;
        setIsEditing(false);
      } else {
        showToast('Error', 'Failed to update value.', true);
      }
    } catch (error) {
      showToast('Error', 'An error occurred while updating value.', true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if a string value looks like JSON
  const isJsonString = (str) => {
    if (typeof str !== 'string') return false;
    try {
      const json = JSON.parse(str);
      return typeof json === 'object' && json !== null;
    } catch (e) {
      return false;
    }
  };
  
  // Format the value for display
  const formatValue = (value) => {
    if (value === null) return 'null';
    if (typeof value === 'string' && isJsonString(value)) {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch (e) {
        return value;
      }
    }
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  };

  const renderValue = () => {
    if (!keyDetails) return null;
    const { type, value } = keyDetails;

    if (type === 'string') {
      // Check if editing
      if (isEditing) {
        return (
          <div className="h-full flex flex-col">
            <textarea
              ref={valueRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={`flex-1 w-full p-4 font-mono text-sm resize-none ${styles.input} border rounded-md focus:outline-none`}
              spellCheck="false"
            />
            <div className="flex justify-end mt-3 space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className={`px-3 py-1.5 rounded ${styles.button.secondary}`}
              >
                Cancel
              </button>
              <button
                onClick={saveEditedValue}
                className={`px-3 py-1.5 rounded ${styles.button.primary}`}
              >
                Save Changes
              </button>
            </div>
          </div>
        );
      }
      
      // Determine if the value might be JSON
      const isJson = isJsonString(value);
      const valueId = 'string-value';
      
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 relative">
            {isJson ? (
              <pre className={`p-4 ${styles.bg.code} ${styles.text.primary} rounded-md overflow-auto h-full font-mono text-sm border ${styles.border} whitespace-pre-wrap`}>
                {formatValue(value)}
              </pre>
            ) : (
              <div className={`p-4 border ${styles.border} rounded-md overflow-auto h-full ${styles.bg.input}`}>
                <div className="font-mono text-sm whitespace-pre-wrap break-all">
                  {value}
                </div>
              </div>
            )}
            
            {/* Floating action buttons */}
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={() => {
                  setEditValue(value);
                  setIsEditing(true);
                  setTimeout(() => valueRef.current?.focus(), 0);
                }}
                className={`p-1.5 rounded-md ${isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
                } transition-colors`}
                title="Edit value"
              >
                <i className="fas fa-edit text-xs"></i>
              </button>
              <button
                onClick={() => copyToClipboard(value, valueId)}
                className={getCopyButtonClass(valueId)}
                title="Copy to clipboard"
              >
                {getCopyIcon(valueId)}
              </button>
            </div>
          </div>
        </div>
      );
    } else if (type === 'list') {
      return (
        <div className="overflow-auto h-full">
          <table className={`min-w-full divide-y ${styles.divider}`}>
            <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-50'}>
              <tr>
                <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${styles.text.secondary} w-24`}>Index</th>
                <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${styles.text.secondary}`}>Value</th>
                <th className={`py-3 px-4 text-right text-xs font-medium uppercase tracking-wider ${styles.text.secondary} w-24`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${styles.divider} ${styles.bg.input}`}>
              {value.map((item, index) => {
                const itemId = `list-item-${index}`;
                return (
                  <tr key={index} className={styles.bg.hover}>
                    <td className={`py-3 px-4 ${styles.text.accent} font-mono text-sm`}>{index}</td>
                    <td className={`py-3 px-4 font-mono text-sm overflow-hidden break-all ${styles.text.primary}`}>
                      {item}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <button
                        onClick={() => copyToClipboard(item, itemId)}
                        className={getCopyButtonClass(itemId)}
                        title="Copy to clipboard"
                      >
                        {getCopyIcon(itemId)}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    } else if (type === 'set') {
      return (
        <div className="overflow-auto h-full">
          <table className={`min-w-full divide-y ${styles.divider}`}>
            <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-50'}>
              <tr>
                <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${styles.text.secondary}`}>Member</th>
                <th className={`py-3 px-4 text-right text-xs font-medium uppercase tracking-wider ${styles.text.secondary} w-24`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${styles.divider} ${styles.bg.input}`}>
              {value.map((item, index) => {
                const itemId = `set-item-${index}`;
                return (
                  <tr key={index} className={styles.bg.hover}>
                    <td className={`py-3 px-4 font-mono text-sm break-all ${styles.text.primary}`}>{item}</td>
                    <td className="py-2 px-4 text-right">
                      <button
                        onClick={() => copyToClipboard(item, itemId)}
                        className={getCopyButtonClass(itemId)}
                        title="Copy to clipboard"
                      >
                        {getCopyIcon(itemId)}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    } else if (type === 'zset') {
      const pairs = [];
      for (let i = 0; i < value.length; i += 2) {
        pairs.push({ member: value[i], score: value[i+1] });
      }
      return (
        <div className="overflow-auto h-full">
          <table className={`min-w-full divide-y ${styles.divider}`}>
            <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-50'}>
              <tr>
                <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${styles.text.secondary}`}>Member</th>
                <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${styles.text.secondary} w-32`}>Score</th>
                <th className={`py-3 px-4 text-right text-xs font-medium uppercase tracking-wider ${styles.text.secondary} w-24`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${styles.divider} ${styles.bg.input}`}>
              {pairs.map((pair, index) => {
                const itemId = `zset-item-${index}`;
                return (
                  <tr key={index} className={styles.bg.hover}>
                    <td className={`py-3 px-4 font-mono text-sm break-all ${styles.text.primary}`}>{pair.member}</td>
                    <td className={`py-3 px-4 ${styles.text.accent} font-mono`}>{pair.score}</td>
                    <td className="py-2 px-4 text-right">
                      <button
                        onClick={() => copyToClipboard(pair.member, itemId)}
                        className={getCopyButtonClass(itemId)}
                        title="Copy to clipboard"
                      >
                        {getCopyIcon(itemId)}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    } else if (type === 'hash') {
      return (
        <div className="overflow-auto h-full">
          <table className={`min-w-full divide-y ${styles.divider}`}>
            <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-50'}>
              <tr>
                <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${styles.text.secondary}`}>Field</th>
                <th className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${styles.text.secondary}`}>Value</th>
                <th className={`py-3 px-4 text-right text-xs font-medium uppercase tracking-wider ${styles.text.secondary} w-24`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${styles.divider} ${styles.bg.input}`}>
              {Object.entries(value).map(([field, val], index) => {
                const itemId = `hash-item-${index}`;
                return (
                  <tr key={index} className={styles.bg.hover}>
                    <td className={`py-3 px-4 font-mono text-sm break-all ${styles.text.primary}`}>{field}</td>
                    <td className={`py-3 px-4 font-mono text-sm break-all ${styles.text.primary}`}>{val}</td>
                    <td className="py-2 px-4 text-right">
                      <button
                        onClick={() => copyToClipboard(val, itemId)}
                        className={getCopyButtonClass(itemId)}
                        title="Copy to clipboard"
                      >
                        {getCopyIcon(itemId)}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    } else {
      const valueId = 'generic-value';
      return (
        <div className="relative h-full">
          <pre className={`p-4 ${styles.bg.code} ${styles.text.primary} rounded-md overflow-auto h-full font-mono text-sm border ${styles.border} whitespace-pre-wrap`}>
            {JSON.stringify(value, null, 2)}
          </pre>
          
          <div className="absolute top-2 right-2">
            <button
              onClick={() => copyToClipboard(JSON.stringify(value, null, 2), valueId)}
              className={getCopyButtonClass(valueId)}
              title="Copy to clipboard"
            >
              {getCopyIcon(valueId)}
            </button>
          </div>
        </div>
      );
    }
  };

  const renderMetadata = () => {
    if (!keyDetails) return null;
    
    const { key, type, ttl, memory_usage } = keyDetails;
    const keyNameId = 'key-name';
    
    return (
      <div className="p-4 space-y-6">
        {/* Type Card */}
        <div className={`p-4 rounded-lg border ${getTypeColor(type)}`}>
          <div className="flex items-start">
            <div className="flex-1">
              <div className="text-sm uppercase font-medium mb-1">Type</div>
              <div className="text-lg font-semibold flex items-center gap-2">
                {getTypeIcon(type)}
                <span>{type}</span>
              </div>
              <div className="mt-2 text-sm opacity-80">
                {getTypeDescription(type)}
              </div>
            </div>
            {type === 'string' && (
              <div className="ml-4 py-1 px-2 rounded text-xs uppercase font-semibold tracking-wider border bg-opacity-50 whitespace-nowrap">
                {isJsonString(keyDetails.value) ? 'JSON Format' : 'Plain Text'}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Memory Usage Card */}
          <div className={`p-4 rounded-lg border ${styles.border} ${styles.panel}`}>
            <div className="text-sm uppercase font-medium mb-1 ${styles.text.secondary}">Memory Usage</div>
            <div className="text-lg font-semibold ${styles.text.primary}">
              {formatBytes(memory_usage)}
            </div>
          </div>
          
          {/* TTL Card with Edit */}
          <div className={`p-4 rounded-lg border ${styles.border} ${styles.panel}`}>
            <div className="text-sm uppercase font-medium mb-1 ${styles.text.secondary}">Time To Live</div>
            {ttl !== undefined && (
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  value={ttlValue}
                  onChange={(e) => setTtlValue(e.target.value)}
                  placeholder="No expiration"
                  className={`w-24 px-2 py-1 rounded-md text-sm ${styles.input} border`}
                  min="-1"
                />
                <div className="flex-1 text-sm ${styles.text.secondary}">
                  {ttlValue ? `${ttlValue} seconds (${formatTTL(parseInt(ttlValue))})` : 'No expiration (persistent)'}
                </div>
                <button
                  onClick={updateTTL}
                  className={`px-2 py-1 rounded text-xs ${styles.button.primary}`}
                >
                  Set
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Key Details */}
        <div className={`p-4 rounded-lg border ${styles.border} ${styles.panel}`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm uppercase font-medium mb-1 ${styles.text.secondary}">Key Name</div>
              <div className="font-mono text-sm break-all ${styles.text.primary}">{key}</div>
            </div>
            <button
              onClick={() => copyToClipboard(key, keyNameId)}
              className={getCopyButtonClass(keyNameId)}
              title="Copy key to clipboard"
            >
              {getCopyIcon(keyNameId)}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderActions = () => {
    if (!keyDetails) return null;
    const { key, type, value } = keyDetails;
    
    // IDs for copy animations
    const exportJsonId = 'export-json';
    const redisCommandId = 'redis-command';
    
    return (
      <div className="p-4 space-y-6">
        <div className={`p-4 rounded-lg border ${styles.border} ${styles.panel}`}>
          <h3 className="text-lg font-semibold mb-4 ${styles.text.primary}">Key Actions</h3>
          <div className="space-y-4">
            {/* Delete Key */}
            <div>
              <h4 className="text-sm font-medium mb-2 ${styles.text.secondary}">Delete Key</h4>
              <p className="text-sm mb-3 ${styles.text.secondary}">
                Remove this key from the database. This action cannot be undone.
              </p>
              <button
                onClick={handleDelete}
                className={`px-3 py-2 rounded ${styles.button.danger} text-sm flex items-center gap-2`}
              >
                <i className="fas fa-trash"></i>
                Delete Key
              </button>
            </div>
            
            <div className={`border-t ${styles.divider} my-4`}></div>
            
            {/* Export Options */}
            <div>
              <h4 className="text-sm font-medium mb-2 ${styles.text.secondary}">Export Options</h4>
              
              {/* Export as JSON */}
              <div className="mb-3">
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      const exportData = {
                        key,
                        type,
                        value
                      };
                      
                      const jsonString = JSON.stringify(exportData, null, 2);
                      const blob = new Blob([jsonString], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${key}.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      
                      // Also set the copy animation for visual feedback
                      copyToClipboard(jsonString, exportJsonId);
                    }}
                    className={`px-3 py-2 rounded ${styles.button.secondary} text-sm flex items-center gap-2`}
                  >
                    <i className="fas fa-file-export"></i>
                    Export as JSON
                  </button>
                  
                  <button
                    onClick={() => {
                      const exportData = {
                        key,
                        type,
                        value
                      };
                      const jsonString = JSON.stringify(exportData, null, 2);
                      copyToClipboard(jsonString, exportJsonId);
                    }}
                    className={`ml-2 ${getCopyButtonClass(exportJsonId)} w-8 h-8 flex items-center justify-center`}
                    title="Copy JSON to clipboard"
                  >
                    {getCopyIcon(exportJsonId)}
                  </button>
                </div>
                
                <p className="text-xs mt-1 ${styles.text.secondary}">
                  Downloads a JSON file containing this key's data.
                </p>
              </div>
              
              {/* Copy Redis CLI Command */}
              <div>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      let command = '';
                      
                      if (type === 'string') {
                        command = `SET "${key}" "${value}"`;
                        if (keyDetails.ttl > 0) {
                          command += ` EX ${keyDetails.ttl}`;
                        }
                      } else if (type === 'list') {
                        command = `RPUSH "${key}"`;
                        value.forEach(item => {
                          command += ` "${item}"`;
                        });
                      } else if (type === 'set') {
                        command = `SADD "${key}"`;
                        value.forEach(item => {
                          command += ` "${item}"`;
                        });
                      } else if (type === 'zset') {
                        command = `ZADD "${key}"`;
                        for (let i = 0; i < value.length; i += 2) {
                          command += ` ${value[i+1]} "${value[i]}"`;
                        }
                      } else if (type === 'hash') {
                        command = `HSET "${key}"`;
                        Object.entries(value).forEach(([field, val]) => {
                          command += ` "${field}" "${val}"`;
                        });
                      }
                      
                      copyToClipboard(command, redisCommandId);
                    }}
                    className={`px-3 py-2 rounded ${styles.button.secondary} text-sm flex items-center gap-2`}
                  >
                    <i className="fas fa-terminal"></i>
                    Copy Redis Command
                  </button>
                  
                  {copyAnimations[redisCommandId] && (
                    <span className={`ml-3 ${styles.text.secondary} text-sm flex items-center`}>
                      <i className="fas fa-check-circle mr-1 text-green-500"></i> 
                      Command copied!
                    </span>
                  )}
                </div>
                
                <p className="text-xs mt-1 ${styles.text.secondary}">
                  Copies the Redis CLI command needed to recreate this key.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!keyDetails) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <i className={`fas fa-spinner fa-spin ${styles.text.secondary} text-4xl mb-4`}></i>
          <p className={styles.text.secondary}>Loading key details...</p>
        </div>
      </div>
    );
  }

  // ID for header key name copy button
  const headerKeyId = 'header-key';

  return (
    <div className={`h-full flex flex-col ${styles.container}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${styles.border} ${styles.panel} sticky top-0 z-10`}>
        <div className="flex items-center max-w-[70%]">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${getTypeColor(keyDetails.type)} mr-3`}>
            {getTypeIcon(keyDetails.type)}
          </div>
          <div className="truncate">
            <h2 className={`text-lg font-semibold ${styles.text.primary} truncate`} title={keyDetails.key}>
              {keyDetails.key}
            </h2>
            <div className={`text-xs ${styles.text.secondary} flex items-center gap-2`}>
              <span className="capitalize">{keyDetails.type}</span>
              {keyDetails.ttl > 0 && (
                <span className="flex items-center">
                  <i className="fas fa-clock text-xs mr-1"></i>
                  {formatTTL(keyDetails.ttl)}
                </span>
              )}
              <span>{formatBytes(keyDetails.memory_usage)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard(keyDetails.key, headerKeyId)}
            className={`${getCopyButtonClass(headerKeyId)} px-2 py-1.5 rounded text-sm flex items-center gap-1.5 transition-all`}
            title="Copy key name"
          >
            {copyAnimations[headerKeyId] ? (
              <>
                <i className="fas fa-check text-xs"></i>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <i className="fas fa-copy text-xs"></i>
                <span>Copy</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDelete}
            className={`px-2 py-1.5 rounded ${styles.button.danger} text-sm flex items-center gap-1.5`}
            title="Delete key"
          >
            <i className="fas fa-trash text-xs"></i>
            Delete
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-4 border-b ${styles.border}">
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab('value')}
            className={`px-4 py-2 transition-colors relative ${
              activeTab === 'value' 
                ? styles.tab.active
                : styles.tab.inactive
            }`}
          >
            Value
            {activeTab === 'value' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-current"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-4 py-2 transition-colors relative ${
              activeTab === 'metadata' 
                ? styles.tab.active
                : styles.tab.inactive
            }`}
          >
            Metadata
            {activeTab === 'metadata' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-current"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2 transition-colors relative ${
              activeTab === 'actions' 
                ? styles.tab.active
                : styles.tab.inactive
            }`}
          >
            Actions
            {activeTab === 'actions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-current"></span>
            )}
          </button>
        </nav>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'value' && renderValue()}
        {activeTab === 'metadata' && renderMetadata()}
        {activeTab === 'actions' && renderActions()}
      </div>
    </div>
  );
};

export default KeyDetails;