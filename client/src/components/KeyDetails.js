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
      case 'string': return <i className="fas fa-font text-blue-600"></i>;
      case 'list': return <i className="fas fa-list text-green-600"></i>;
      case 'set': return <i className="fas fa-th-large text-purple-600"></i>;
      case 'zset': return <i className="fas fa-sort-amount-up text-yellow-600"></i>;
      case 'hash': return <i className="fas fa-hashtag text-red-600"></i>;
      default: return <i className="fas fa-question-circle text-gray-400"></i>;
    }
  };
  
  const getTypeColor = (type) => {
    switch(type) {
      case 'string': return 'border-blue-200 bg-blue-50';
      case 'list': return 'border-green-200 bg-green-50';
      case 'set': return 'border-purple-200 bg-purple-50';
      case 'zset': return 'border-yellow-200 bg-yellow-50';
      case 'hash': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200';
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
          <pre className="p-4 bg-gray-50 text-gray-800 rounded-md overflow-auto max-h-full font-mono text-sm border border-gray-200 whitespace-pre-wrap">
            {JSON.stringify(jsonValue, null, 2)}
          </pre>
        );
      }
      
      return (
        <textarea
          readOnly
          className="w-full h-full p-4 bg-white text-gray-800 border border-gray-200 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500"
          value={value}
        />
      );
    } else if (type === 'list') {
      return (
        <div className="overflow-auto max-h-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Index</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {value.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 text-cyan-600 font-mono">{index}</td>
                  <td className="py-2 px-4 font-mono text-sm overflow-hidden text-ellipsis text-gray-800">{item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (type === 'set') {
      return (
        <div className="overflow-auto max-h-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {value.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 font-mono text-sm text-gray-800">{item}</td>
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pairs.map((pair, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 font-mono text-sm text-gray-800">{pair.member}</td>
                  <td className="py-2 px-4 text-cyan-600 font-mono">{pair.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (type === 'hash') {
      return (
        <div className="overflow-auto max-h-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(value).map(([field, val], index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 font-mono text-sm text-gray-800">{field}</td>
                  <td className="py-2 px-4 font-mono text-sm text-gray-800">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <pre className="p-4 bg-gray-50 text-gray-800 rounded-md overflow-auto max-h-full font-mono text-sm border border-gray-200">
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
            <div className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              {getTypeIcon(keyDetails.type)}
              <span>{keyDetails.type}</span>
            </div>
          </div>
          
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="text-xs uppercase text-gray-500 mb-1">Memory Usage</div>
            <div className="text-lg font-semibold text-gray-800">{formatBytes(keyDetails.memory_usage)}</div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
          <div className="text-xs uppercase text-gray-500 mb-1">Time To Live</div>
          <div className="text-lg font-semibold text-gray-800">
            {keyDetails.ttl > 0 
              ? `${keyDetails.ttl} seconds` 
              : keyDetails.ttl === -1 
                ? 'No expiration' 
                : 'Key does not exist'
            }
          </div>
        </div>
        
        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
          <div className="text-xs uppercase text-gray-500 mb-1">Key</div>
          <div className="font-mono text-sm break-all text-gray-800">{keyDetails.key}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {getTypeIcon(keyDetails.type)}
          <span className="text-lg font-semibold truncate max-w-xs text-gray-800">{keyDetails.key}</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(keyDetails.key)}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm flex items-center gap-1.5 transition-colors"
          >
            <i className="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>
      
      <div className="px-4 border-b border-gray-200">
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab('value')}
            className={`px-4 py-2 transition-colors relative ${
              activeTab === 'value' 
                ? 'text-cyan-700' 
                : 'text-gray-600 hover:text-gray-800'
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
                ? 'text-cyan-700' 
                : 'text-gray-600 hover:text-gray-800'
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