import React, { useState, useEffect, useRef } from "react";
import KeyDetails from "./KeyDetails";

const KeysView = ({ isConnected, connectionConfig, showToast, setIsLoading, theme }) => {
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [keysPerPage, setKeysPerPage] = useState(50);
  const [totalKeys, setTotalKeys] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Theme-dependent styles
  const isDark = theme === 'dark';
  
  const styles = {
    // Main container styles
    container: isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800',
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
    },
    
    // Component-specific styles
    search: {
      input: `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} focus:border-blue-500 focus:ring-blue-500`,
      icon: isDark ? 'text-gray-500' : 'text-gray-400',
    },
    
    button: {
      primary: `${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`,
      secondary: `${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`,
      danger: `${isDark ? 'bg-red-600/30 hover:bg-red-600/50 text-red-300' : 'bg-red-50 hover:bg-red-100 text-red-600'}`,
    },
    
    // List and grid items
    item: {
      base: `border ${isDark ? 'border-gray-700' : 'border-gray-200'}`,
      hover: isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50',
      selected: isDark ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-300',
    },
    
    // Table styles
    table: {
      header: `${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'} ${isDark ? 'border-gray-700' : 'border-gray-200'}`,
      row: `${isDark ? 'border-gray-700' : 'border-gray-200'} ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`,
    },
    
    // Pagination
    pagination: {
      item: `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${isDark ? 'text-gray-400' : 'text-gray-700'} ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`,
      active: `${isDark ? 'bg-blue-900/30 border-blue-700 text-blue-400' : 'bg-blue-50 border-blue-300 text-blue-600'}`,
      disabled: `${isDark ? 'bg-gray-800 border-gray-700 text-gray-600' : 'bg-gray-100 border-gray-200 text-gray-400'} cursor-not-allowed`,
    }
  };

  const fetchKeys = async (pattern = "*", page = 1, perPage = keysPerPage) => {
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
          page,
          per_page: perPage
        })
      });
      
      const data = await response.json();
      
      // Set the keys from the server response
      setKeys(data.keys || []);
      setTotalKeys(data.total || 0);
      setTotalPages(data.total_pages || 0);
      setCurrentPage(data.page || 1);
      
      // Update selected keys to remove any that are no longer present
      const newSelectedKeys = new Set(
        [...selectedKeys].filter((key) => (data.keys || []).includes(key))
      );
      setSelectedKeys(newSelectedKeys);

      if (selectedKey && !(data.keys || []).includes(selectedKey)) {
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

  // Function to load a specific page of keys
  const loadPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    
    setCurrentPage(pageNumber);
    fetchKeys(pattern, pageNumber, keysPerPage);
    scrollToTop();
  };
  
  // Scroll to top of list
  const scrollToTop = () => {
    if (document.querySelector('.keys-list-container')) {
      document.querySelector('.keys-list-container').scrollTop = 0;
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
        setCurrentPage(1); // Reset to page 1 when search changes
        fetchKeys(searchValue || "*", 1, keysPerPage);
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
        fetchKeys(pattern, currentPage, keysPerPage);
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
        fetchKeys(pattern, currentPage, keysPerPage);
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
    const handleRefresh = (event) => {
      // Get connection status from event if available
      const detail = event.detail || {};
      
      if (detail.hasOwnProperty('isConnected')) {
        if (detail.isConnected) {
          fetchKeys(pattern, currentPage, keysPerPage);
        }
      } else if (isConnected) {
        // Fallback to the prop if event doesn't have the detail
        fetchKeys(pattern, currentPage, keysPerPage);
      }
    };
    
    window.addEventListener('refreshKeys', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshKeys', handleRefresh);
    };
  }, [pattern, currentPage, keysPerPage, isConnected]);

  // When keys per page changes, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
    fetchKeys(pattern, 1, keysPerPage);
  }, [keysPerPage]);

  // Initial load
  useEffect(() => {
    if (isConnected && isInitialLoad) {
      fetchKeys();
      setIsInitialLoad(false);
    }
  }, [isConnected, isInitialLoad]);

  // When connection status changes, refresh data
  useEffect(() => {
    if (isConnected) {
      fetchKeys(pattern, currentPage, keysPerPage);
    }
  }, [isConnected]);

  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const getTypeIcon = (type) => {
    // Instead of a loading icon, use a generic key icon for unknown types
    if (!type) return <i className={`fas fa-key ${styles.text.secondary}`}></i>;
    
    const iconMap = {
      'string': <i className={isDark ? 'text-blue-400 fas fa-font' : 'text-blue-600 fas fa-font'}></i>,
      'list': <i className={isDark ? 'text-green-400 fas fa-list' : 'text-green-600 fas fa-list'}></i>,
      'set': <i className={isDark ? 'text-purple-400 fas fa-th-large' : 'text-purple-600 fas fa-th-large'}></i>,
      'zset': <i className={isDark ? 'text-yellow-400 fas fa-sort-amount-up' : 'text-yellow-600 fas fa-sort-amount-up'}></i>,
      'hash': <i className={isDark ? 'text-red-400 fas fa-hashtag' : 'text-red-600 fas fa-hashtag'}></i>
    };
    
    return iconMap[type.toLowerCase()] || <i className="fas fa-question text-gray-400"></i>;
  };

  const keyType = (key) => {
    return keyDetails && keyDetails.key === key ? keyDetails.type : null;
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    
    // Add first page
    pageNumbers.push(1);
    
    // Add ellipsis if needed
    if (currentPage > 3) {
      pageNumbers.push('...');
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      pageNumbers.push('...');
    }
    
    // Add last page if there are multiple pages
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return (
      <div className={`flex items-center justify-between p-3 ${styles.panel} border-t ${styles.border}`}>
        <div className="flex items-center">
          <p className={`text-sm ${styles.text.secondary}`}>
            <span className={styles.text.primary}>{keys.length > 0 ? (currentPage - 1) * keysPerPage + 1 : 0}</span> to{' '}
            <span className={styles.text.primary}>{Math.min(currentPage * keysPerPage, totalKeys)}</span>{' '}
            of <span className={styles.text.primary}>{totalKeys}</span> keys
          </p>
          
          <div className="flex items-center ml-6">
            <label className={`text-sm ${styles.text.secondary} mr-2`}>Per page:</label>
            <select
              value={keysPerPage}
              onChange={(e) => setKeysPerPage(Number(e.target.value))}
              className={`rounded ${isDark ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-white text-gray-700 border-gray-300'} text-sm px-2 py-1 focus:border-blue-500 focus:ring-blue-500`}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
        
        <div className="flex">
          <nav className="flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => loadPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                currentPage === 1 
                  ? styles.pagination.disabled
                  : styles.pagination.item
              }`}
            >
              <span className="sr-only">Previous</span>
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            
            {pageNumbers.map((page, index) => (
              <button
                key={index}
                onClick={() => page !== '...' && loadPage(page)}
                disabled={page === '...'}
                className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                  page === currentPage 
                    ? styles.pagination.active
                    : page === '...' 
                      ? styles.pagination.disabled
                      : styles.pagination.item
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => loadPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                currentPage === totalPages || totalPages === 0
                  ? styles.pagination.disabled
                  : styles.pagination.item
              }`}
            >
              <span className="sr-only">Next</span>
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </nav>
        </div>
      </div>
    );
  };

  // Key List in ListView mode
  const renderListView = () => {
    const sortedKeys = getSortedKeys();
    
    return (
      <div className="h-full flex flex-col">
        <div className="keys-list-container flex-1 overflow-auto">
          <table className="min-w-full border-collapse">
            <thead className={`${styles.table.header} sticky top-0 z-10`}>
              <tr>
                <th className="w-10 py-3 px-3 text-left">
                  <label className="inline-flex">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                      className={`rounded-sm ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-blue-600 focus:ring-blue-500`}
                    />
                    <span className="sr-only">Select all</span>
                  </label>
                </th>
                <th 
                  className="py-3 px-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    <span>Key</span>
                    {sortBy === 'name' && (
                      <i className={`fas fa-sort-${sortDir === 'asc' ? 'up' : 'down'} ${styles.text.accent}`}></i>
                    )}
                  </div>
                </th>
                <th className="w-24 py-3 px-3 text-left text-xs font-medium uppercase tracking-wider">
                  Type
                </th>
                <th className="w-20 py-3 px-3 text-right text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${styles.divider}`}>
              {sortedKeys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center p-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'} mb-3`}>
                        <i className={`fas fa-search ${styles.text.secondary} text-xl`}></i>
                      </div>
                      <p className={`${styles.text.primary} font-medium mb-1`}>No keys found</p>
                      <p className={`${styles.text.secondary} text-sm`}>
                        {pattern !== '*' 
                          ? `No keys match the pattern "${pattern}"`
                          : 'No keys found in the current database'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedKeys.map((key) => (
                  <tr 
                    key={key} 
                    className={`${styles.table.row} transition-colors ${selectedKey === key ? `${styles.item.selected} border-l-2` : ''}`}
                  >
                    <td className="py-2 px-3">
                      <label className="inline-flex">
                        <input
                          type="checkbox"
                          checked={selectedKeys.has(key)}
                          onChange={() => handleCheckboxChange(key)}
                          onClick={(e) => e.stopPropagation()}
                          className={`rounded-sm ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-blue-600 focus:ring-blue-500`}
                        />
                        <span className="sr-only">Select {key}</span>
                      </label>
                    </td>
                    <td 
                      className={`py-2 px-3 font-mono text-sm cursor-pointer truncate max-w-xs ${styles.text.primary}`}
                      onClick={() => handleKeySelect(key)}
                    >
                      {key}
                    </td>
                    <td className="py-2 px-3 text-sm">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(keyType(key))}
                        <span className={`text-xs uppercase ${styles.text.secondary}`}>
                          {keyType(key) || 'Key'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleKeySelect(key)}
                          className={`p-1.5 rounded-md ${isDark 
                            ? 'bg-gray-700 hover:bg-gray-600 text-blue-400' 
                            : 'bg-gray-100 hover:bg-gray-200 text-blue-600'
                          } transition-colors`}
                          title="View key details"
                        >
                          <i className="fas fa-eye text-xs"></i>
                        </button>
                        <button
                          onClick={() => deleteKey(key)}
                          className={`p-1.5 rounded-md ${isDark 
                            ? 'bg-gray-700 hover:bg-red-900/50 text-gray-400 hover:text-red-400' 
                            : 'bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600'
                          } transition-colors`}
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
        {renderPagination()}
      </div>
    );
  };

  // Grid view for keys
  const renderGridView = () => {
    const sortedKeys = getSortedKeys();
    
    return (
      <div className="h-full flex flex-col">
        <div className="keys-list-container flex-1 overflow-auto p-3">
          {sortedKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
                <i className={`fas fa-search ${styles.text.secondary} text-2xl`}></i>
              </div>
              <p className={`${styles.text.primary} font-medium text-lg mb-2`}>No keys found</p>
              <p className={`${styles.text.secondary} text-center max-w-md`}>
                {pattern !== '*' 
                  ? `No keys match the pattern "${pattern}"`
                  : 'No keys found in the current database'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sortedKeys.map((key) => (
                <div 
                  key={key}
                  className={`relative rounded-lg ${styles.item.base} ${styles.item.hover} transition-all ${
                    selectedKey === key ? styles.item.selected : styles.panel
                  }`}
                >
                  {/* Selection checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <label className="inline-flex">
                      <input
                        type="checkbox"
                        checked={selectedKeys.has(key)}
                        onChange={() => handleCheckboxChange(key)}
                        className={`rounded-sm ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} text-blue-600 focus:ring-blue-500`}
                      />
                      <span className="sr-only">Select {key}</span>
                    </label>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleKeySelect(key)}
                      className={`p-1.5 rounded-md ${isDark 
                        ? 'bg-gray-700/90 hover:bg-gray-600/90 text-blue-400' 
                        : 'bg-gray-100/90 hover:bg-gray-200/90 text-blue-600'
                      } transition-colors`}
                      title="View key details"
                    >
                      <i className="fas fa-eye text-xs"></i>
                    </button>
                    <button
                      onClick={() => deleteKey(key)}
                      className={`p-1.5 rounded-md ${isDark 
                        ? 'bg-gray-700/90 hover:bg-red-900/40 text-gray-400 hover:text-red-400' 
                        : 'bg-gray-100/90 hover:bg-red-100/90 text-gray-600 hover:text-red-600'
                      } transition-colors`}
                      title="Delete key"
                    >
                      <i className="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                  
                  {/* Card content */}
                  <div 
                    className="p-4 pt-8 cursor-pointer group"
                    onClick={() => handleKeySelect(key)}
                  >
                    <div className="flex flex-col items-center mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-gray-700' : 'bg-gray-100'
                      } mb-3 group-hover:scale-110 transition-transform`}>
                        {getTypeIcon(keyType(key))}
                      </div>
                      <div className={`text-xs uppercase ${styles.text.secondary}`}>
                        {keyType(key) || 'Key'}
                      </div>
                    </div>
                    
                    <div className={`font-mono text-sm truncate mt-3 pt-3 border-t ${styles.divider} text-center ${styles.text.primary}`} 
                      title={key}>
                      {key}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {renderPagination()}
      </div>
    );
  };

  // If not connected, show a connection prompt
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`text-center p-8 max-w-md ${styles.panel} rounded-xl shadow-lg`}>
          <div className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full ${styles.bg.accent} bg-opacity-10`}>
            <i className={`fas fa-database ${styles.text.accent} text-4xl`}></i>
          </div>
          <h2 className={`text-xl font-bold mb-4 ${styles.text.primary}`}>Not Connected</h2>
          <p className={`mb-6 ${styles.text.secondary}`}>
            Please connect to a Redis server to explore keys.
          </p>
          <button className={`px-6 py-2 ${styles.button.primary} rounded-lg shadow-lg`}>
            <i className="fas fa-plug mr-2"></i>Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex bg-opacity-50 ${styles.container}`}>
      {/* Keys List Panel */}
      <div className={`w-1/2 flex flex-col ${styles.panel} border-r ${styles.border}`}>
        {/* Search and Controls Header */}
        <div className={`${styles.panel} sticky top-0 z-10 border-b ${styles.border}`}>
          {/* Search Bar */}
          <div className="p-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className={`fas fa-search ${styles.search.icon}`}></i>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={pattern}
                onChange={handleSearchChange}
                placeholder="Search keys (e.g., user:*)"
                className={`block w-full pl-10 pr-10 py-2 rounded-lg ${styles.search.input} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow`}
              />
              {pattern !== '*' && (
                <button 
                  className={`absolute inset-y-0 right-0 flex items-center pr-3 ${styles.search.icon} hover:${styles.text.accent}`}
                  onClick={() => {
                    setPattern('*');
                    fetchKeys('*', 1, keysPerPage);
                  }}
                  title="Clear search"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
          
          {/* Toolbar */}
          <div className="px-3 pb-3 flex justify-between items-center">
            {/* Left Side Controls */}
            <div className="flex items-center space-x-3">
              <div className={`flex rounded-lg overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-sm`}>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1.5 transition-colors ${viewMode === 'list' 
                    ? isDark ? 'bg-gray-600 text-blue-400' : 'bg-white text-blue-600 shadow-sm' 
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List view"
                >
                  <i className="fas fa-list"></i>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1.5 transition-colors ${viewMode === 'grid' 
                    ? isDark ? 'bg-gray-600 text-blue-400' : 'bg-white text-blue-600 shadow-sm' 
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid view"
                >
                  <i className="fas fa-th-large"></i>
                </button>
              </div>
              
              <div className={`text-sm ${styles.text.secondary}`}>
                {totalKeys} keys
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedKeys.size > 0 && (
              <button
                onClick={deleteSelectedKeys}
                className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 ${styles.button.danger}`}
              >
                <i className="fas fa-trash"></i>
                Delete ({selectedKeys.size})
              </button>
            )}
          </div>
        </div>
        
        {/* Keys List */}
        {viewMode === 'list' ? renderListView() : renderGridView()}
      </div>

      {/* Key Details Panel */}
      <div className={`w-1/2 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
        {selectedKey && keyDetails ? (
          <KeyDetails 
            keyDetails={keyDetails} 
            onDelete={deleteKey} 
            connectionConfig={connectionConfig}
            showToast={showToast}
            setIsLoading={setIsLoading}
            theme={theme} 
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className={`w-20 h-20 flex items-center justify-center rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} mb-6`}>
              <i className={`fas fa-database text-3xl ${isDark ? 'text-gray-500' : 'text-gray-400'}`}></i>
            </div>
            <h2 className={`text-xl font-semibold mb-2 ${styles.text.primary}`}>No key selected</h2>
            <p className={`mb-6 max-w-md ${styles.text.secondary}`}>
              {keys.length > 0 
                ? 'Select a key from the list to view its details' 
                : pattern !== '*' 
                  ? 'Try searching with a different pattern'
                  : 'No keys found in the current database'}
            </p>
            {keys.length > 0 && (
              <div className="flex justify-center mt-2">
                <i style={{marginTop: '5px'}} className={`fas fa-arrow-left ${styles.text.accent} mr-2`}></i>
                <span className={styles.text.secondary}>Select a key from the list</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeysView;