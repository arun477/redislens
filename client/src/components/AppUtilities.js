import React, { useState, useEffect } from 'react';

/**
 * AppUtilities component provides global utilities for the application
 * such as keyboard shortcuts, context menus, and more.
 */
const AppUtilities = ({ 
  isConnected, 
  setActiveView, 
  refreshCurrentView, 
  toggleSidebar 
}) => {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if not in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Keyboard shortcuts with Alt key
      if (e.altKey) {
        switch (e.key) {
          case 'k':
            // Alt+K: Show keys view
            e.preventDefault();
            setActiveView('keys-view');
            break;
          case 'i':
            // Alt+I: Show info view
            e.preventDefault();
            setActiveView('info-view');
            break;
          case 'c':
            // Alt+C: Show command view
            e.preventDefault();
            setActiveView('command-view');
            break;
          case 'r':
            // Alt+R: Refresh current view
            e.preventDefault();
            refreshCurrentView();
            break;
          case 's':
            // Alt+S: Toggle sidebar
            e.preventDefault();
            toggleSidebar();
            break;
          case '?':
            // Alt+?: Show keyboard shortcuts
            e.preventDefault();
            setShowKeyboardShortcuts(true);
            break;
          default:
            break;
        }
      } else if (e.key === 'Escape') {
        // Close keyboard shortcuts dialog
        setShowKeyboardShortcuts(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView, refreshCurrentView, toggleSidebar]);
  
  // Keyboard shortcuts dialog
  const renderKeyboardShortcutsDialog = () => {
    if (!showKeyboardShortcuts) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-black/80 border border-gray-800/50 rounded-lg p-6 shadow-2xl max-w-md w-full">
          <div className="flex justify-between items-center mb-4 border-b border-gray-800/50 pb-2">
            <h2 className="text-xl font-semibold text-cyan-400">Keyboard Shortcuts</h2>
            <button 
              onClick={() => setShowKeyboardShortcuts(false)}
              className="text-gray-400 hover:text-white"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg text-white mb-2">Navigation</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Keys Explorer</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Alt + K</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Server Dashboard</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Alt + I</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Command Terminal</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Alt + C</kbd>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg text-white mb-2">Actions</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Refresh Current View</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Alt + R</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Toggle Sidebar</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Alt + S</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Show Keyboard Shortcuts</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Alt + ?</kbd>
                </div>
              </div>
            </div>
            
            {isConnected && (
              <div>
                <h3 className="text-lg text-white mb-2">Command Terminal</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Previous Command</span>
                    <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">↑</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Next Command</span>
                    <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">↓</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Execute Command</span>
                    <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Enter</kbd>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowKeyboardShortcuts(false)}
              className="px-4 py-2 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      {/* Hidden floating action button to show keyboard shortcuts */}
      <button
        onClick={() => setShowKeyboardShortcuts(true)}
        className="fixed bottom-4 left-4 z-40 w-10 h-10 rounded-full bg-black/50 hover:bg-gray-800/50 border border-gray-800/50 text-gray-400 hover:text-cyan-400 flex items-center justify-center transition-colors shadow-lg"
        title="Keyboard Shortcuts (Alt+?)"
      >
        <i className="fas fa-keyboard"></i>
      </button>
      
      {/* Keyboard shortcuts dialog */}
      {renderKeyboardShortcutsDialog()}
    </>
  );
};

export default AppUtilities;