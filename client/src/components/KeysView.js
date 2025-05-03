import React, { useState, useEffect } from "react";
import KeyDetails from "./KeyDetails";

const keysViewStyles = {
  container: "flex h-full bg-gray-900 text-gray-100",
  keysList: "w-2/5 bg-black/40 overflow-auto shadow-lg border-r border-gray-800/30 backdrop-blur-sm",
  searchBar: "p-2 sticky top-0 bg-black/60 border-b border-gray-800/50 flex gap-2 backdrop-blur-md z-10",
  searchInput: "flex-1 px-3 py-2 bg-gray-900/70 text-white border border-gray-700/50 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all duration-200",
  searchButton: "bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors duration-200 flex items-center justify-center",
  bulkActionBar: "p-2 bg-red-900/20 border-b border-red-800/30 flex justify-between items-center backdrop-blur-sm",
  selectedText: "text-sm font-semibold text-white",
  deleteButton: "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 flex items-center gap-1",
  table: {
    header: "sticky top-0 flex items-center p-2 bg-black/70 border-b border-gray-700/50 text-gray-300 text-xs uppercase tracking-wider backdrop-blur-md z-10",
    row: "flex items-center p-2 border-b border-gray-800/30 hover:bg-gray-800/40 transition-colors duration-150 text-sm",
    rowSelected: "bg-gray-800/50 border-l-2 border-red-500",
    checkboxCol: "mr-2",
    keyCol: "w-4/6 cursor-pointer truncate",
    typeCol: "w-1/6 text-gray-400",
    actionsCol: "w-1/6 flex space-x-1 justify-end"
  },
  actionButton: "bg-gray-800 hover:bg-gray-700 text-white p-1 rounded-md transition-colors duration-200",
  detailsPanel: "w-3/5 bg-gray-900 overflow-auto",
  emptyState: "h-full flex flex-col items-center justify-center text-gray-500",
  emptyIcon: "text-5xl mb-4 opacity-30",
  noKeysMessage: "p-4 text-center text-gray-500 italic"
};

const KeysView = ({ isConnected, connectionConfig, showToast, setIsLoading }) => {
  const [keys, setKeys] = useState([]);
  const [pattern, setPattern] = useState("*");
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [keyDetails, setKeyDetails] = useState(null);

  const fetchKeys = async () => {
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
        fetchKeys();
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
          `Successfully deleted ${data.deleted_count} of ${data.total_count} keys.`
        );
        fetchKeys();
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
    setSelectAll(newSelectedKeys.size === keys.length);
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(keys));
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    if (isConnected) {
      fetchKeys();
    }
  }, [isConnected]);

  return (
    <div className={keysViewStyles.container}>
      <div className={keysViewStyles.keysList}>
        <div className={keysViewStyles.searchBar}>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && fetchKeys()}
            placeholder="Search keys (e.g., user:*)"
            className={keysViewStyles.searchInput}
          />
          <button
            onClick={fetchKeys}
            className={keysViewStyles.searchButton}
            title="Search keys"
          >
            <i className="fas fa-search"></i>
          </button>
        </div>

        {selectedKeys.size > 0 && (
          <div className={keysViewStyles.bulkActionBar}>
            <span className={keysViewStyles.selectedText}>
              {selectedKeys.size} selected
            </span>
            <button
              onClick={deleteSelectedKeys}
              className={keysViewStyles.deleteButton}
            >
              <i className="fas fa-trash"></i> Delete
            </button>
          </div>
        )}

        <div>
          <div className={keysViewStyles.table.header}>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAllChange}
              className={keysViewStyles.table.checkboxCol}
            />
            <div className="w-4/6 text-xs uppercase">Key</div>
            <div className="w-1/6 text-xs uppercase">Type</div>
            <div className="w-1/6 text-xs uppercase text-right">Actions</div>
          </div>

          {keys.length === 0 ? (
            <div className={keysViewStyles.noKeysMessage}>
              No keys found matching pattern: {pattern}
            </div>
          ) : (
            keys.map((key) => (
              <div
                key={key}
                className={`${keysViewStyles.table.row} ${
                  selectedKey === key ? keysViewStyles.table.rowSelected : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedKeys.has(key)}
                  onChange={() => handleCheckboxChange(key)}
                  onClick={(e) => e.stopPropagation()}
                  className={keysViewStyles.table.checkboxCol}
                />
                <div
                  className={keysViewStyles.table.keyCol}
                  onClick={() => handleKeySelect(key)}
                  title={key}
                >
                  {key}
                </div>
                <div className={keysViewStyles.table.typeCol}>
                  {keyDetails && keyDetails.key === key ? keyDetails.type : "..."}
                </div>
                <div className={keysViewStyles.table.actionsCol}>
                  <button
                    onClick={() => handleKeySelect(key)}
                    className={keysViewStyles.actionButton}
                    title="View key details"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    onClick={() => deleteKey(key)}
                    className={keysViewStyles.actionButton}
                    title="Delete key"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={keysViewStyles.detailsPanel}>
        {selectedKey && keyDetails ? (
          <KeyDetails keyDetails={keyDetails} onDelete={deleteKey} />
        ) : (
          <div className={keysViewStyles.emptyState}>
            <i className="fas fa-arrow-left text-5xl mb-4 opacity-30"></i>
            <div>Select a key to view details</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeysView;