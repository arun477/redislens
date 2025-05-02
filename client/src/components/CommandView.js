import React, { useState } from 'react';
import axios from 'axios';

const CommandView = ({ isConnected, connectionConfig, showToast, setIsLoading }) => {
  const [command, setCommand] = useState('');
  const [args, setArgs] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Execute Redis command
  const executeCommand = async () => {
    if (!isConnected) {
      showToast('Not Connected', 'Please connect to Redis server first.', true);
      return;
    }
    
    const cmd = command.trim();
    if (!cmd) {
      showToast('Invalid Command', 'Please enter a command to execute.', true);
      return;
    }
    
    const argArray = args.trim() ? args.trim().split(/\s+/) : [];
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/execute', {
        ...connectionConfig,
        command: cmd,
        args: argArray
      });
      
      setResult(response.data.result);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error executing command');
      showToast('Error', error.response?.data?.detail || 'An error occurred while executing the command.', true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format command result for display
  const formatResult = (value) => {
    if (value === null) {
      return <em>null</em>;
    } else if (value === '') {
      return <em>(empty string)</em>;
    } else if (Array.isArray(value)) {
      return (
        <div className="pl-4 border-l-2 border-gray-300">
          {value.map((item, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-500 mr-2">{index})</span>
              {formatResult(item)}
            </div>
          ))}
        </div>
      );
    } else if (typeof value === 'object') {
      return (
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border text-left">Key</th>
              <th className="py-2 px-4 border text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(value).map(([key, val], index) => (
              <tr key={index} className="border-t">
                <td className="py-2 px-4 border">{key}</td>
                <td className="py-2 px-4 border">{formatResult(val)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      return String(value);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Execute Redis Command</h1>
      
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Command</label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && !e.shiftKey && executeCommand()}
            placeholder="e.g., GET, HGETALL, KEYS"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Arguments (space-separated)</label>
          <input
            type="text"
            value={args}
            onChange={(e) => setArgs(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && executeCommand()}
            placeholder="e.g., user:123"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <button
          onClick={executeCommand}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <i className="fas fa-play mr-2"></i> Execute
        </button>
      </div>
      
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold border-b pb-2 mb-4">Result</h2>
        
        {error ? (
          <div className="text-red-500">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        ) : result !== null ? (
          <div className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
            {formatResult(result)}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            Execute a command to see results
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandView;