import React, { useState, useEffect } from "react";
import axios from "axios";
import KeyDetails from "./KeyDetails";

const KeysView = ({
  isConnected,
  connectionConfig,
  showToast,
  setIsLoading,
}) => {
  const [keys, setKeys] = useState([]);
  const [pattern, setPattern] = useState("*");
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [keyDetails, setKeyDetails] = useState(null);

  // Fetch keys when connection changes or when refreshed
  const fetchKeys = async () => {
    if (!isConnected) {
      showToast("Not Connected", "Please connect to Redis server first.", true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`/api/keys`, {
        ...connectionConfig,
        pattern,
      });

      setKeys(response.data.keys || []);

      // Clear selected keys that are no longer in the result
      const newSelectedKeys = new Set(
        [...selectedKeys].filter((key) => response.data.keys.includes(key))
      );
      setSelectedKeys(newSelectedKeys);

      // If the previously selected key is no longer in results, clear the selection
      if (selectedKey && !response.data.keys.includes(selectedKey)) {
        setSelectedKey(null);
        setKeyDetails(null);
      }
    } catch (error) {
      showToast(
        "Error",
        error.response?.data?.detail || "Failed to fetch keys.",
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key selection
  const handleKeySelect = (key) => {
    setSelectedKey(key);
    fetchKeyDetails(key);
  };

  // Fetch details for a specific key
  const fetchKeyDetails = async (key) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `/api/key/${encodeURIComponent(key)}`,
        connectionConfig
      );
      setKeyDetails(response.data);
    } catch (error) {
      showToast(
        "Error",
        error.response?.data?.detail ||
          `Failed to fetch details for key: ${key}`,
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a key
  const deleteKey = async (key) => {
    const userConfirmed = window.confirm(
      `Are you sure you want to delete the key: ${key}?`
    );
    if (!userConfirmed) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `/api/key/${encodeURIComponent(key)}`,
        {
          data: connectionConfig,
        }
      );

      if (response.data.status === "ok") {
        showToast("Success", `Key '${key}' was deleted successfully.`);

        // Refresh keys list
        fetchKeys();

        // If the deleted key was selected, clear the selection
        if (selectedKey === key) {
          setSelectedKey(null);
          setKeyDetails(null);
        }
      } else {
        showToast(
          "Error",
          response.data.detail || "Failed to delete key.",
          true
        );
      }
    } catch (error) {
      showToast(
        "Error",
        error.response?.data?.detail ||
          "An error occurred while deleting the key.",
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Delete multiple keys
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
    if (!userConfirmed) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`/api/keys/delete`, {
        ...connectionConfig,
        keys: keysToDelete,
      });

      if (response.data.deleted_count > 0) {
        showToast(
          "Success",
          `Successfully deleted ${response.data.deleted_count} of ${response.data.total_count} keys.`
        );

        // Refresh keys list
        fetchKeys();

        // Clear selections
        setSelectedKeys(new Set());
        setSelectAll(false);

        // If a selected key was deleted, clear the selection
        if (selectedKey && keysToDelete.includes(selectedKey)) {
          setSelectedKey(null);
          setKeyDetails(null);
        }
      } else {
        const errorMsg =
          Array.isArray(response.data.errors) && response.data.errors.length > 0
            ? response.data.errors.join(", ")
            : "Unknown error";
        showToast("Error", "Failed to delete keys: " + errorMsg, true);
      }
    } catch (error) {
      showToast(
        "Error",
        error.response?.data?.detail ||
          "An error occurred while deleting keys.",
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle checkbox changes for individual keys
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

  // Handle select all checkbox
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(keys));
    }
    setSelectAll(!selectAll);
  };

  // Load keys on component mount if connected
  useEffect(() => {
    if (isConnected) {
      fetchKeys();
    }
  }, [isConnected]);

  return (
    <div className="flex h-full">
      <div className="w-1/2 bg-white overflow-auto shadow-md">
        <div className="p-4 bg-gray-100 border-b flex items-center">
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && fetchKeys()}
            placeholder="Search keys (e.g., user:*)"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={fetchKeys}
            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            <i className="fas fa-search"></i>
          </button>
        </div>

        {selectedKeys.size > 0 && (
          <div className="p-2 bg-gray-200 border-b flex justify-between items-center">
            <span className="text-sm font-semibold">
              {selectedKeys.size} selected
            </span>
            <button
              onClick={deleteSelectedKeys}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              <i className="fas fa-trash mr-1"></i> Delete Selected
            </button>
          </div>
        )}

        <div className="keys-list">
          <div className="flex items-center p-3 bg-gray-200 border-b">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAllChange}
              className="mr-2"
            />
            <div className="w-4/6 font-semibold">Key</div>
            <div className="w-1/6 font-semibold">Type</div>
            <div className="w-1/6 font-semibold">Actions</div>
          </div>

          {keys.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No keys found matching pattern: {pattern}
            </div>
          ) : (
            keys.map((key) => (
              <div
                key={key}
                className={`flex items-center p-3 border-b hover:bg-gray-100 ${
                  selectedKey === key
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedKeys.has(key)}
                  onChange={() => handleCheckboxChange(key)}
                  onClick={(e) => e.stopPropagation()}
                  className="mr-2"
                />
                <div
                  className="w-4/6 cursor-pointer truncate"
                  onClick={() => handleKeySelect(key)}
                >
                  {key}
                </div>
                <div className="w-1/6 text-gray-600">
                  {keyDetails && keyDetails.key === key
                    ? keyDetails.type
                    : "..."}
                </div>
                <div className="w-1/6 flex space-x-1">
                  <button
                    onClick={() => handleKeySelect(key)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    onClick={() => deleteKey(key)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-1/2 bg-white overflow-auto">
        {selectedKey && keyDetails ? (
          <KeyDetails keyDetails={keyDetails} onDelete={deleteKey} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <i className="fas fa-arrow-left text-5xl mb-4"></i>
            <div>Select a key to view details</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeysView;
