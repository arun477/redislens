import React, { useState, useEffect, useRef } from "react";
import KeyDetails from "./KeyDetails";

const KeysView = ({ isConnected, connectionConfig, showToast, setIsLoading }) => {
  const [keys, setKeys] = useState([]);
  const [pattern, setPattern] = useState("*");
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [keyDetails, setKeyDetails] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'type'
  const [sortDir, setSortDir] = useState('asc'); // 'asc', 'desc'
  const [searchDebounce, setSearchDebounce] = useState(null);
  const searchInputRef = useRef(null);

  const fetchKeys = async (pattern = "*") => {
    if (!isConnected) {
      showToast("Not Connected", "Please connect to Redis server first.", true);
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...connectionConfig,
          pattern,
        })
      });
      
      const data = await response.json();
      
      setKeys(data.keys || []);
      const newSelectedKeys = new Set(
        [...selectedKeys].filter((key) => data.keys.includes(key))
      );
      setSelectedKeys(newSelectedKeys);

      if (selectedKey && !data.keys.includes(selectedKey)) {
        setSelectedKey(null);
        setKeyDetails(null);
      }
    } catch (error) {
      showToast(
        "Error",
        "Failed to fetch keys.",
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search with debounce
  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setPattern(searchValue);
    
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    setSearchDebounce(
      setTimeout(() => {
        fetchKeys(searchValue || "*");
      }, 300)
    );
  };

  const handleKeySelect = (key) => {
    setSelectedKey(key);
    fetchKeyDetails(key);
  };

  const fetchKeyDetails = async (key) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/key/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionConfig)
      });
      
      const data = await response.json();
      setKeyDetails(data);
    } catch (error) {
      showToast(
        "Error",
        `Failed to fetch details for key: ${key}`,
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteKey = async (key) => {
    const userConfirmed = window.confirm(
      `Are you sure you want to delete the key: ${key}?`
    );
    if (!userConfirmed) return;

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/key/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(connectionConfig)
      });
      
      const data = await response.json();

      if (data.status === "ok") {
        showToast("Success", `Key '${key}' was deleted successfully.`);
        fetchKeys(pattern);
        if (selectedKey === key) {
          setSelectedKey(null);
          setKeyDetails(null);
        }
      } else {
        showToast(
          "Error",
          data.detail || "Failed to delete key.",
          true
        );
      }
    } catch (error) {
      showToast(
        "Error",
        "An error occurred while deleting the key.",
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSelectedKeys = async () => {
    const keysToDelete = [...selectedKeys];
    if (keysToDelete.length === 0) {
      showToast(
        "No Keys Selected",
        "Please select at least one key to delete.",
        true
      );
      return;
    }

    const userConfirmed = window.confirm(
      `Are you sure you want to delete ${keysToDelete.length} selected keys?`
    );
    if (!userConfirmed) return;

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/keys/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...connectionConfig,
          keys: keysToDelete,
        })
      });
      
      const data = await response.json();

      if (data.deleted_count > 0) {
        showToast(
          "Success",
          `Deleted ${data.deleted_count} of ${data.total_count} keys.`
        );
        fetchKeys(pattern);
        setSelectedKeys(new Set());
        setSelectAll(false);
        if (selectedKey && keysToDelete.includes(selectedKey)) {
          setSelectedKey(null);
          setKeyDetails(null);
        }
      } else {
        const errorMsg =
          Array.isArray(data.errors) && data.errors.length > 0
            ? data.errors.join(", ")
            : "Unknown error";
        showToast("Error", "Failed to delete keys: " + errorMsg, true);
      }
    } catch (error) {
      showToast(
        "Error",
        "An error occurred while deleting keys.",
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (key) => {
    const newSelectedKeys = new Set(selectedKeys);
    if (newSelectedKeys.has(key)) {
      newSelectedKeys.delete(key);
    } else {
      newSelectedKeys.add(key);
    }
    setSelectedKeys(newSelectedKeys);
    setSelectAll(newSelectedKeys.size === keys.length && keys.length > 0);
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(keys));
    }
    setSelectAll(!selectAll);
  };

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const getSortedKeys = () => {
    // If we don't have key details yet, return keys as-is
    if (keys.length === 0) return [];
    
    // Create a copy for sorting
    const keysCopy = [...keys];
    
    // Sort based on the current sort settings
    return keysCopy.sort((a, b) => {
      if (sortBy === 'name') {
        return sortDir === 'asc' 
          ? a.localeCompare(b) 
          : b.localeCompare(a);
      }
      
      // For sorting by other properties, we need key details
      return 0;
    });
  };

  // Handle refresh event from Header
  useEffect(() => {
    const handleRefresh = () => {
      fetchKeys(pattern);
    };
    
    window.addEventListener('refreshKeys', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshKeys', handleRefresh);
    };
  }, [pattern]);

  // Initial load
  useEffect(() => {
    if (isConnected) {
      fetchKeys();
    }
  }, [isConnected]);

  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const getTypeIcon = (type) => {
    if (!type) return <i className="fas fa-question text-gray-400"></i>;
    
    switch(type.toLowerCase()) {
      case 'string': return <i className="fas fa-font text-blue-600"></i>;
      case 'list': return <i className="fas fa-list text-green-600"></i>;
      case 'set': return <i className="fas fa-th-large text-purple-600"></i>;
      case 'zset': return <i className="fas fa-sort-amount-up text-yellow-600"></i>;
      case 'hash': return <i className="fas fa-hashtag text-red-600"></i>;
      default: return <i className="fas fa-question text-gray-400"></i>;
    }
  };

  const keyType = (key) => {
    return keyDetails && keyDetails.key === key ? keyDetails.type : null;
  };

  const renderListView = () => {
    const sortedKeys = getSortedKeys();
    
    return (
      <div className="h-full overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="w-10 py-3 px-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                  className="rounded-sm bg-white border-gray-300 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-gray-100"
                />
              </th>
              <th 
                className="py-3 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Key
                  {sortBy === 'name' && (
                    <i className={`fas fa-sort-${sortDir === 'asc' ? 'up' : 'down'} text-cyan-500`}></i>
                  )}
                </div>
              </th>
              <th className="w-24 py-3 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="w-20 py-3 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedKeys.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500 italic">
                  {pattern !== '*' 
                    ? `No keys found matching pattern: ${pattern}` 
                    : 'No keys found in the current database'}
                </td>
              </tr>
            ) : (
              sortedKeys.map((key) => (
                <tr 
                  key={key} 
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedKey === key ? 'bg-cyan-50 border-l-2 border-cyan-500' : ''
                  }`}
                >
                  <td className="py-2 px-3">
                    <input
                      type="checkbox"
                      checked={selectedKeys.has(key)}
                      onChange={() => handleCheckboxChange(key)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-sm bg-white border-gray-300 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-gray-100"
                    />
                  </td>
                  <td 
                    className="py-2 px-3 font-mono text-sm cursor-pointer truncate max-w-xs text-gray-800"
                    onClick={() => handleKeySelect(key)}
                  >
                    {key}
                  </td>
                  <td className="py-2 px-3 text-sm">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(keyType(key))}
                      <span className="text-gray-600 text-xs uppercase">
                        {keyType(key) || '...'}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleKeySelect(key)}
                        className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-cyan-600 transition-colors"
                        title="View key details"
                      >
                        <i className="fas fa-eye text-xs"></i>
                      </button>
                      <button
                        onClick={() => deleteKey(key)}
                        className="p-1.5 rounded-md bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
                        title="Delete key"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderGridView = () => {
    const sortedKeys = getSortedKeys();
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-3">
        {sortedKeys.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-500 italic">
            {pattern !== '*' 
              ? `No keys found matching pattern: ${pattern}` 
              : 'No keys found in the current database'}
          </div>
        ) : (
          sortedKeys.map((key) => (
            <div 
              key={key}
              className={`relative group p-3 rounded-lg border transition-all ${
                selectedKey === key 
                  ? 'bg-cyan-50 border-cyan-500' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={() => handleKeySelect(key)}
                  className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-cyan-600 transition-colors"
                  title="View key details"
                >
                  <i className="fas fa-eye text-xs"></i>
                </button>
                <button
                  onClick={() => deleteKey(key)}
                  className="p-1.5 rounded-md bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
                  title="Delete key"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
              
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedKeys.has(key)}
                  onChange={() => handleCheckboxChange(key)}
                  className="rounded-sm bg-white border-gray-300 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-gray-100"
                />
              </div>
              
              <div 
                className="pt-6 pb-2 cursor-pointer"
                onClick={() => handleKeySelect(key)}
              >
                <div className="text-center my-2">
                  {getTypeIcon(keyType(key))}
                  <div className="text-xs uppercase text-gray-500 mt-1">
                    {keyType(key) || '...'}
                  </div>
                </div>
                
                <div className="font-mono text-sm truncate mt-2 pt-2 border-t border-gray-200 text-center text-gray-800">
                  {key}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full">
      <div className="w-1/2 flex flex-col border-r border-gray-200">
        <div className="bg-white sticky top-0 z-10 p-3 border-b border-gray-200 flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <i className="fas fa-search"></i>
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={pattern}
                onChange={handleSearchChange}
                placeholder="Search keys (e.g., user:*)"
                className="w-full pl-10 pr-3 py-2 bg-white text-gray-800 border border-gray-300 rounded-md focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              {pattern !== '*' && (
                <button 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-800"
                  onClick={() => {
                    setPattern('*');
                    fetchKeys('*');
                  }}
                  title="Clear search"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            
            <button
              onClick={() => fetchKeys(pattern)}
              className="px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded flex items-center transition-colors"
              title="Search keys"
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${
                    viewMode === 'list' 
                      ? 'bg-white text-cyan-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="List view"
                >
                  <i className="fas fa-list"></i>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${
                    viewMode === 'grid' 
                      ? 'bg-white text-cyan-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Grid view"
                >
                  <i className="fas fa-th-large"></i>
                </button>
              </div>
              <div className="text-sm text-gray-500">{keys.length} keys</div>
            </div>
            
            {selectedKeys.size > 0 && (
              <button
                onClick={deleteSelectedKeys}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded text-sm flex items-center gap-1.5 transition-colors"
              >
                <i className="fas fa-trash"></i>
                Delete Selected ({selectedKeys.size})
              </button>
            )}
          </div>
        </div>
        
        {viewMode === 'list' ? renderListView() : renderGridView()}
      </div>

      <div className="w-1/2">
        {selectedKey && keyDetails ? (
          <KeyDetails keyDetails={keyDetails} onDelete={deleteKey} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50">
            <i className="fas fa-database text-5xl mb-4 opacity-30"></i>
            <div>Select a key to view details</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeysView;