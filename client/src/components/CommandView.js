import React, { useState } from 'react';

const commandViewStyles = {
  container: "p-6 max-w-4xl mx-auto",
  title: "text-2xl font-semibold text-white mb-6 flex items-center gap-3",
  titleIcon: "text-red-500",
  commandPanel: "bg-black/30 p-5 rounded-lg shadow-xl border border-gray-800/30 backdrop-blur-sm mb-6",
  formGroup: "mb-4",
  label: "block text-sm font-medium text-gray-300 mb-2",
  input: "w-full px-3 py-2 bg-gray-900/70 text-white border border-gray-700/50 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all duration-200 shadow-inner",
  executeButton: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-md flex items-center transition-all duration-300 shadow-lg hover:shadow-red-900/30 gap-2",
  resultPanel: "bg-black/30 p-5 rounded-lg shadow-xl border border-gray-800/30 backdrop-blur-sm",
  resultHeader: "text-lg font-semibold border-b border-gray-800/50 pb-3 mb-4 flex items-center gap-2",
  error: "text-red-400 flex items-center gap-2",
  resultContent: "bg-gray-900/70 p-4 rounded-md overflow-auto max-h-96 font-mono text-sm shadow-inner",
  emptyResult: "text-gray-400 text-center py-8 flex flex-col items-center justify-center gap-3",
  emptyIcon: "text-3xl opacity-30"
};

const CommandView = ({ isConnected, connectionConfig, showToast, setIsLoading }) => {
  const [command, setCommand] = useState('');
  const [args, setArgs] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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

      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...connectionConfig,
          command: cmd,
          args: argArray
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data.result);
      } else {
        setError(data.detail || 'Error executing command');
        showToast('Error', data.detail || 'An error occurred while executing the command.', true);
      }
    } catch (error) {
      setError('Error executing command');
      showToast('Error', 'An error occurred while executing the command.', true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatResult = (value) => {
    if (value === null) {
      return <em className="text-gray-500">null</em>;
    } else if (value === '') {
      return <em className="text-gray-500">(empty string)</em>;
    } else if (Array.isArray(value)) {
      return (
        <div className="pl-4 border-l border-gray-700 space-y-1">
          {value.map((item, index) => (
            <div key={index} className="flex">
              <span className="text-gray-500 mr-2 w-8 text-right">{index})</span>
              <div className="flex-1">{formatResult(item)}</div>
            </div>
          ))}
        </div>
      );
    } else if (typeof value === 'object') {
      return (
        <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-black/60">
            <tr>
              <th className="py-2 px-4 border-b border-gray-700 text-left text-white font-semibold">Key</th>
              <th className="py-2 px-4 border-b border-gray-700 text-left text-white font-semibold">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {Object.entries(value).map(([key, val], index) => (
              <tr key={index} className="hover:bg-gray-800/30">
                <td className="py-2 px-4 border-r border-gray-700 text-white font-mono">{key}</td>
                <td className="py-2 px-4 text-white">{formatResult(val)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      return <span className="text-white">{String(value)}</span>;
    }
  };

  const getPlaceholderCommands = () => {
    return (
      <div className="text-gray-500 text-sm space-y-1 mt-2">
        <div className="text-gray-400 mb-1">Try these commands:</div>
        <div><code>GET</code> [key] - Get the value of a key</div>
        <div><code>SET</code> [key] [value] - Set the value of a key</div>
        <div><code>KEYS</code> * - List all keys</div>
        <div><code>HGETALL</code> [hash-key] - Get all fields and values in a hash</div>
        <div><code>LRANGE</code> [list-key] 0 -1 - Get all elements in a list</div>
      </div>
    );
  };

  return (
    <div className={commandViewStyles.container}>
      <h1 className={commandViewStyles.title}>
        <i className="fas fa-terminal text-red-500"></i>
        Redis Command Console
      </h1>

      <div className={commandViewStyles.commandPanel}>
        <div className={commandViewStyles.formGroup}>
          <label className={commandViewStyles.label}>Command</label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && !e.shiftKey && executeCommand()}
            placeholder="e.g., GET, HGETALL, KEYS"
            className={commandViewStyles.input}
            autoFocus
          />
        </div>

        <div className={commandViewStyles.formGroup}>
          <label className={commandViewStyles.label}>Arguments (space-separated)</label>
          <input
            type="text"
            value={args}
            onChange={(e) => setArgs(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && executeCommand()}
            placeholder="e.g., user:123"
            className={commandViewStyles.input}
          />
        </div>

        <button
          onClick={executeCommand}
          className={commandViewStyles.executeButton}
        >
          <i className="fas fa-play"></i> Execute
        </button>
      </div>

      <div className={commandViewStyles.resultPanel}>
        <h2 className={commandViewStyles.resultHeader}>
          <i className="fas fa-reply text-gray-400"></i> Result
        </h2>

        {error ? (
          <div className={commandViewStyles.error}>
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        ) : result !== null ? (
          <div className={commandViewStyles.resultContent}>
            {formatResult(result)}
          </div>
        ) : (
          <div className={commandViewStyles.emptyResult}>
            <i className="fas fa-keyboard text-gray-500"></i>
            <div>Execute a command to see results</div>
            {getPlaceholderCommands()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandView;