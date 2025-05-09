import React, { useState, useRef, useEffect } from 'react';

const CommandView = ({ isConnected, connectionConfig, showToast, setIsLoading, theme }) => {
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'system', content: 'Redis Command Terminal - Type commands to interact with Redis server' },
    { type: 'system', content: 'Type HELP for available commands or CLEAR to clear terminal' }
  ]);
  
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  const isDark = theme === 'dark';

  // Theme-dependent styles
  const styles = {
    container: isDark ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800',
    header: {
      bg: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      title: isDark ? 'text-white' : 'text-gray-800',
      icon: isDark ? 'text-cyan-500' : 'text-cyan-600',
    },
    button: {
      default: isDark 
        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200',
    },
    terminal: {
      bg: isDark ? 'bg-gray-900 text-white' : 'bg-gray-900 text-white',
      promptBg: isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-800 border-gray-700',
      input: isDark ? 'bg-transparent text-white' : 'bg-transparent text-white',
      prompt: isDark ? 'text-cyan-400' : 'text-cyan-400',
    },
    output: {
      command: isDark ? 'text-cyan-400' : 'text-cyan-400',
      result: isDark ? 'text-green-400' : 'text-green-400',
      error: isDark ? 'text-red-400' : 'text-red-400',
      info: isDark ? 'text-yellow-400' : 'text-yellow-400',
      system: isDark ? 'text-gray-400 italic' : 'text-gray-400 italic',
    }
  };

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalOutput]);
  
  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle refresh event from Header
  useEffect(() => {
    const handleRefresh = (event) => {
      // Get connection status from event if available
      const detail = event.detail || {};
      
      if (detail.hasOwnProperty('isConnected')) {
        if (!detail.isConnected) {
          setTerminalOutput(prev => [...prev, { 
            type: 'error', 
            content: 'Connection to Redis server was lost. Please reconnect.' 
          }]);
        } else {
          setTerminalOutput(prev => [...prev, { 
            type: 'system', 
            content: 'Terminal refreshed. Connection is active.' 
          }]);
        }
      }
    };
    
    window.addEventListener('refreshCommand', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshCommand', handleRefresh);
    };
  }, []);

  const executeCommand = async (command = '') => {
    const cmdStr = command || inputValue.trim();
    if (!cmdStr) return;
    
    // Add command to terminal output
    setTerminalOutput(prev => [...prev, { type: 'command', content: cmdStr }]);
    
    // Add command to history if it's not a duplicate of the last command
    if (!commandHistory.length || commandHistory[0] !== cmdStr) {
      setCommandHistory(prev => [cmdStr, ...prev.slice(0, 49)]); // Keep last 50 commands
    }
    
    // Reset history navigation index
    setHistoryIndex(-1);
    
    // Clear input
    setInputValue('');
    
    // Handle special commands
    if (cmdStr.toLowerCase() === 'clear') {
      setTerminalOutput([
        { type: 'system', content: 'Terminal cleared' }
      ]);
      return;
    }
    
    if (cmdStr.toLowerCase() === 'help') {
      showHelpCommand();
      return;
    }
    
    if (!isConnected) {
      setTerminalOutput(prev => [...prev, { 
        type: 'error', 
        content: 'Error: Not connected to Redis server. Please connect first.' 
      }]);
      return;
    }
    
    // Parse command
    const cmdParts = parseCommand(cmdStr);
    if (!cmdParts.command) {
      setTerminalOutput(prev => [...prev, { 
        type: 'error', 
        content: 'Error: Invalid command format' 
      }]);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...connectionConfig,
          command: cmdParts.command,
          args: cmdParts.args
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Format the output based on the result type
        setTerminalOutput(prev => [...prev, { 
          type: 'result', 
          content: formatResult(data.result)
        }]);
      } else {
        setTerminalOutput(prev => [...prev, { 
          type: 'error', 
          content: `Error: ${data.detail || 'Unknown error'}` 
        }]);
      }
    } catch (error) {
      setTerminalOutput(prev => [...prev, { 
        type: 'error', 
        content: `Error: ${error.message || 'Unknown error'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const parseCommand = (cmdStr) => {
    const parts = cmdStr.trim().split(/\s+/);
    if (parts.length === 0) return { command: '', args: [] };
    
    return {
      command: parts[0],
      args: parts.slice(1)
    };
  };
  
  const formatResult = (result) => {
    if (result === null) {
      return '(nil)';
    } else if (result === '') {
      return '(empty string)';
    } else if (Array.isArray(result)) {
      return result.map((item, index) => (
        `${index + 1}) ${formatResult(item)}`
      )).join('\n');
    } else if (typeof result === 'object') {
      return Object.entries(result)
        .map(([key, val]) => `${key}: ${formatResult(val)}`)
        .join('\n');
    } else {
      return String(result);
    }
  };
  
  const showHelpCommand = () => {
    const helpContent = [
      'Available Redis Commands (examples):',
      '',
      'Key Operations:',
      '  GET <key>              - Get the value of a key',
      '  SET <key> <value>      - Set the string value of a key',
      '  DEL <key> [key ...]    - Delete one or more keys',
      '  EXISTS <key> [key ...] - Check if keys exist',
      '  EXPIRE <key> <seconds> - Set a key\'s expiration time in seconds',
      '  TTL <key>              - Get the time to live for a key in seconds',
      '  TYPE <key>             - Determine the type stored at key',
      '',
      'String Operations:',
      '  APPEND <key> <value>   - Append a value to a key',
      '  INCR <key>             - Increment the integer value of a key by one',
      '  DECR <key>             - Decrement the integer value of a key by one',
      '',
      'List Operations:',
      '  LPUSH <key> <value>    - Prepend one or more values to a list',
      '  RPUSH <key> <value>    - Append one or more values to a list',
      '  LRANGE <key> <start> <stop> - Get range of elements from a list',
      '',
      'Hash Operations:',
      '  HSET <key> <field> <value> - Set the string value of a hash field',
      '  HGET <key> <field>     - Get the value of a hash field',
      '  HGETALL <key>          - Get all fields and values in a hash',
      '',
      'Set Operations:',
      '  SADD <key> <member>    - Add one or more members to a set',
      '  SMEMBERS <key>         - Get all members in a set',
      '',
      'Sorted Set Operations:',
      '  ZADD <key> <score> <member> - Add one or more members to a sorted set',
      '  ZRANGE <key> <start> <stop> - Get range of members in a sorted set',
      '',
      'Server Operations:',
      '  PING                   - Test connection',
      '  INFO                   - Get information and statistics',
      '  DBSIZE                 - Return the number of keys in the selected database',
      '',
      'Terminal Commands:',
      '  CLEAR                  - Clear terminal output',
      '  HELP                   - Show this help message'
    ];
    
    setTerminalOutput(prev => [...prev, { 
      type: 'info', 
      content: helpContent.join('\n')
    }]);
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    // Handle up/down arrow for command history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand();
    }
  };
  
  const getOutputClass = (type) => {
    return styles.output[type] || 'text-white';
  };

  return (
    <div className={`h-full flex flex-col ${styles.container}`}>
      <div className={`p-4 border-b ${styles.header.bg} flex justify-between items-center`}>
        <h1 className={`text-xl font-semibold ${styles.header.title} flex items-center gap-3`}>
          <i className={`fas fa-terminal ${styles.header.icon}`}></i>
          Redis Command Terminal
        </h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTerminalOutput([
                { type: 'system', content: 'Terminal cleared' }
              ]);
            }}
            className={`px-3 py-1.5 ${styles.button.default} rounded text-sm flex items-center gap-1.5 transition-colors`}
          >
            <i className="fas fa-eraser"></i>
            Clear
          </button>
          
          <button
            onClick={showHelpCommand}
            className={`px-3 py-1.5 ${styles.button.default} rounded text-sm flex items-center gap-1.5 transition-colors`}
          >
            <i className="fas fa-question-circle"></i>
            Help
          </button>
        </div>
      </div>
      
      {/* Terminal with metallic black theme for contrast - this stays dark in both themes for readability */}
      <div 
        ref={terminalRef}
        className={`flex-1 overflow-auto p-4 font-mono text-sm ${styles.terminal.bg}`}
      >
        {terminalOutput.map((output, index) => (
          <div key={index} className={`mb-2 whitespace-pre-wrap ${getOutputClass(output.type)}`}>
            {output.type === 'command' && <span className={`${styles.terminal.prompt} mr-2`}>redis&gt;</span>}
            {output.content}
          </div>
        ))}
      </div>
      
      <div className={`p-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-700'} ${styles.terminal.promptBg}`}>
        <div className="flex items-center text-cyan-400 font-mono text-sm">
          <span className="mr-2">{isConnected ? 'redis>' : 'not-connected>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={`flex-1 ${styles.terminal.input} border-none outline-none focus:ring-0`}
            placeholder="Type command here..."
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default CommandView;