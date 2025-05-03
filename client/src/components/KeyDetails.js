import React from 'react';

const keyDetailsStyles = {
  container: "h-full bg-gray-900 text-gray-100 flex flex-col",
  header: "p-4 bg-black/30 sticky top-0 z-10 flex justify-between items-center backdrop-blur-md border-b border-gray-800/30",
  title: "text-xl font-semibold flex items-center gap-2 truncate",
  contentContainer: "flex-1 p-4 overflow-auto",
  metadataCard: "grid grid-cols-3 gap-4 mb-4 bg-black/20 p-4 rounded-lg border border-gray-800/30 shadow-md backdrop-blur-sm",
  metadataItem: "space-y-1",
  metadataLabel: "text-xs uppercase tracking-wider text-gray-500",
  metadataValue: "font-semibold text-white",
  valueSection: "mb-4 space-y-2",
  valueSectionLabel: "font-semibold text-white flex items-center gap-2",
  valueContainer: "bg-black/30 border border-gray-800/30 rounded-lg p-3 shadow-inner overflow-auto max-h-96 backdrop-blur-sm",
  textArea: "w-full h-40 p-3 bg-black/40 text-white border border-gray-700/30 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-red-500",
  table: {
    container: "min-w-full border border-gray-800/50 rounded-lg overflow-hidden",
    header: "bg-black/60 text-left text-white text-sm font-semibold",
    headerCell: "py-2 px-4 border-b border-gray-800/50",
    body: "divide-y divide-gray-800/30",
    row: "transition-colors duration-150 hover:bg-gray-800/20",
    cell: "py-2 px-4 text-sm"
  },
  footer: "mt-auto border-t border-gray-800/30 p-4 flex justify-end bg-black/30 backdrop-blur-sm",
  deleteButton: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-md flex items-center justify-center transition-all duration-300 gap-2"
};

const KeyDetails = ({ keyDetails, onDelete }) => {
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

  const renderValue = () => {
    const { type, value } = keyDetails;

    if (type === 'string') {
      return (
        <textarea
          readOnly
          className={keyDetailsStyles.textArea}
          value={value}
        />
      );
    } else if (type === 'list') {
      return (
        <table className={keyDetailsStyles.table.container}>
          <thead className={keyDetailsStyles.table.header}>
            <tr>
              <th className={keyDetailsStyles.table.headerCell}>Index</th>
              <th className={keyDetailsStyles.table.headerCell}>Value</th>
            </tr>
          </thead>
          <tbody className={keyDetailsStyles.table.body}>
            {value.map((item, index) => (
              <tr key={index} className={keyDetailsStyles.table.row}>
                <td className={keyDetailsStyles.table.cell}>{index}</td>
                <td className={keyDetailsStyles.table.cell}>{item}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (type === 'set') {
      return (
        <table className={keyDetailsStyles.table.container}>
          <thead className={keyDetailsStyles.table.header}>
            <tr>
              <th className={keyDetailsStyles.table.headerCell}>Member</th>
            </tr>
          </thead>
          <tbody className={keyDetailsStyles.table.body}>
            {value.map((item, index) => (
              <tr key={index} className={keyDetailsStyles.table.row}>
                <td className={keyDetailsStyles.table.cell}>{item}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (type === 'zset') {
      const pairs = [];
      for (let i = 0; i < value.length; i += 2) {
        pairs.push({ member: value[i], score: value[i+1] });
      }
      return (
        <table className={keyDetailsStyles.table.container}>
          <thead className={keyDetailsStyles.table.header}>
            <tr>
              <th className={keyDetailsStyles.table.headerCell}>Member</th>
              <th className={keyDetailsStyles.table.headerCell}>Score</th>
            </tr>
          </thead>
          <tbody className={keyDetailsStyles.table.body}>
            {pairs.map((pair, index) => (
              <tr key={index} className={keyDetailsStyles.table.row}>
                <td className={keyDetailsStyles.table.cell}>{pair.member}</td>
                <td className={keyDetailsStyles.table.cell}>{pair.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (type === 'hash') {
      return (
        <table className={keyDetailsStyles.table.container}>
          <thead className={keyDetailsStyles.table.header}>
            <tr>
              <th className={keyDetailsStyles.table.headerCell}>Field</th>
              <th className={keyDetailsStyles.table.headerCell}>Value</th>
            </tr>
          </thead>
          <tbody className={keyDetailsStyles.table.body}>
            {Object.entries(value).map(([field, val], index) => (
              <tr key={index} className={keyDetailsStyles.table.row}>
                <td className={keyDetailsStyles.table.cell}>{field}</td>
                <td className={keyDetailsStyles.table.cell}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      return (
        <pre className="p-3 bg-black/40 text-white rounded-md overflow-auto max-h-80 text-sm font-mono">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
  };

  return (
    <div className={keyDetailsStyles.container}>
      <div className={keyDetailsStyles.header}>
        <div className={keyDetailsStyles.title}>
          {getTypeIcon(keyDetails.type)}
          <span className="truncate">{keyDetails.key}</span>
        </div>
      </div>

      <div className={keyDetailsStyles.contentContainer}>
        <div className={keyDetailsStyles.metadataCard}>
          <div className={keyDetailsStyles.metadataItem}>
            <div className={keyDetailsStyles.metadataLabel}>Type</div>
            <div className={keyDetailsStyles.metadataValue}>
              {getTypeIcon(keyDetails.type)} {keyDetails.type}
            </div>
          </div>
          <div className={keyDetailsStyles.metadataItem}>
            <div className={keyDetailsStyles.metadataLabel}>Time to Live</div>
            <div className={keyDetailsStyles.metadataValue}>
              {keyDetails.ttl > 0 ? `${keyDetails.ttl} seconds` : 'No expiration'}
            </div>
          </div>
          <div className={keyDetailsStyles.metadataItem}>
            <div className={keyDetailsStyles.metadataLabel}>Memory Usage</div>
            <div className={keyDetailsStyles.metadataValue}>{formatBytes(keyDetails.memory_usage)}</div>
          </div>
        </div>

        <div className={keyDetailsStyles.valueSection}>
          <div className={keyDetailsStyles.valueSectionLabel}>
            <i className="fas fa-database text-gray-400 mr-1"></i> Value
          </div>
          <div className={keyDetailsStyles.valueContainer}>
            {renderValue()}
          </div>
        </div>
      </div>

      <div className={keyDetailsStyles.footer}>
        <button
          onClick={() => onDelete(keyDetails.key)}
          className={keyDetailsStyles.deleteButton}
        >
          <i className="fas fa-trash-alt"></i> Delete Key
        </button>
      </div>
    </div>
  );
};

export default KeyDetails;