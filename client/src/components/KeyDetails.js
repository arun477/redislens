import React, { useState } from 'react';

const KeyDetails = ({ keyDetails, onDelete }) => {
  const [activeTab, setActiveTab] = useState('value'); // 'value', 'metadata'
  
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'string': return <i className="fas fa-font text-blue-400"></i>;
      case 'list': return <i className="fas fa-list text-green-400"></i>;
      case 'set': return <i className="fas fa-th-large text-purple-400"></i>;
      case 'zset': return <i className="fas fa-sort-amount-up text-yellow-400"></i>;
      case 'hash': return <i className="fas fa-hashtag text-red-400"></i>;
      default: return <i className="fas fa-question-circle text-gray-400"></i>;
    }
  };
  
  const getTypeColor = (type) => {
    switch(type) {
      case 'string': return 'border-blue-500/30 bg-blue-900/10';
      case 'list': return 'border-green-500/30 bg-green-900/10';
      case 'set': return 'border-purple-500/30 bg-purple-900/10';
      case 'zset': return 'border-yellow-500/30 bg-yellow-900/10';
      case 'hash': return 'border-red-500/30 bg-red-900/10';
      default: return 'border-gray-700/50';
    }
  };

  const renderValue = () => {
    const { type, value } = keyDetails;

    if (type === 'string') {
      // Determine if the value might be JSON
      let isJson = false;
      let jsonValue = null;
      
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          jsonValue = JSON.parse(value);
          isJson = true;
        } catch (e) {
          // Not JSON, continue with normal display
        }
      }
      
      if (isJson) {
        return (
          <pre className="p-4 bg-black/30 text-white rounded-md overflow-auto max-h-full font-mono text-sm border border-gray-800/50 whitespace-pre-wrap">
            {JSON.stringify(jsonValue, null, 2)}
          </pre>
        );
      }
      
      return (
        <textarea
          readOnly
          className="w-full h-full p-4 bg-black/30 text-white border border-gray-800/50 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500"
          value={value}
        />
      );
    } else if (type === 'list') {
      return (
        <div className="overflow-auto max-h-full">
          <table className="min-w-full divide-y divide-gray-800/30">
            <thead className="bg-black/40">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-20">Index</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-black/20 divide-y divide-gray-800/30">
              {value.map((item, index) => (
                <tr key={index} className="hover:bg-gray-800/20">
                  <td className="py-2 px-4 text-cyan-400 font-mono">{index}</td>
                  <td className="py-2 px-4 font-mono text-sm overflow-hidden text-ellipsis">{item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (type === 'set') {
      return (
        <div className="overflow-auto max-h-full">
          <table className="min-w-full divide-y divide-gray-800/30">
            <thead className="bg-black/40">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Member</th>
              </tr>
            </thead>
            <tbody className="bg-black/20 divide-y divide-gray-800/30">
              {value.map((item, index) => (
                <tr key={index} className="hover:bg-gray-800/20">
                  <td className="py-2 px-4 font-mono text-sm">{item}</td>
                </tr>
              ))}
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
        <div className="overflow-auto max-h-full">
          <table className="min-w-full divide-y divide-gray-800/30">
            <thead className="bg-black/40">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Member</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-32">Score</th>
              </tr>
            </thead>
            <tbody className="bg-black/20 divide-y divide-gray-800/30">
              {pairs.map((pair, index) => (
                <tr key={index} className="hover:bg-gray-800/20">
                  <td className="py-2 px-4 font-mono text-sm">{pair.member}</td>
                  <td className="py-2 px-4 text-cyan-400 font-mono">{pair.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (type === 'hash') {
      return (
        <div className="overflow-auto max-h-full">
          <table className="min-w-full divide-y divide-gray-800/30">
            <thead className="bg-black/40">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Field</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-black/20 divide-y divide-gray-800/30">
              {Object.entries(value).map(([field, val], index) => (
                <tr key={index} className="hover:bg-gray-800/20">
                  <td className="py-2 px-4 font-mono text-sm">{field}</td>
                  <td className="py-2 px-4 font-mono text-sm">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <pre className="p-4 bg-black/30 text-white rounded-md overflow-auto max-h-full font-mono text-sm border border-gray-800/50">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
  };

  const renderMetadata = () => {
    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border ${getTypeColor(keyDetails.type)}`}>
            <div className="text-xs uppercase text-gray-500 mb-1">Type</div>
            <div className="text-lg font-semibold flex items-center gap-2">
              {getTypeIcon(keyDetails.type)}
              <span>{keyDetails.type}</span>
            </div>
          </div>
          
          <div className="p-4 rounded-lg border border-gray-700/50 bg-gray-900/20">
            <div className="text-xs uppercase text-gray-500 mb-1">Memory Usage</div>
            <div className="text-lg font-semibold">{formatBytes(keyDetails.memory_usage)}</div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border border-gray-700/50 bg-gray-900/20">
          <div className="text-xs uppercase text-gray-500 mb-1">Time To Live</div>
          <div className="text-lg font-semibold">
            {keyDetails.ttl > 0 
              ? `${keyDetails.ttl} seconds` 
              : keyDetails.ttl === -1 
                ? 'No expiration' 
                : 'Key does not exist'
            }
          </div>
        </div>
        
        <div className="p-4 rounded-lg border border-gray-700/50 bg-gray-900/20">
          <div className="text-xs uppercase text-gray-500 mb-1">Key</div>
          <div className="font-mono text-sm break-all">{keyDetails.key}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-black/30 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {getTypeIcon(keyDetails.type)}
          <span className="text-lg font-semibold truncate max-w-xs">{keyDetails.key}</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(keyDetails.key)}
            className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded text-sm flex items-center gap-1.5 transition-colors"
          >
            <i className="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>
      
      <div className="px-4 border-b border-gray-800/50">
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab('value')}
            className={`px-4 py-2 transition-colors relative ${
              activeTab === 'value' 
                ? 'text-cyan-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Value
            {activeTab === 'value' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-4 py-2 transition-colors relative ${
              activeTab === 'metadata' 
                ? 'text-cyan-400' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Metadata
            {activeTab === 'metadata' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"></span>
            )}
          </button>
        </nav>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'value' ? renderValue() : renderMetadata()}
      </div>
    </div>
  );
};

export default KeyDetails;