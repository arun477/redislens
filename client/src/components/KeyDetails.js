import React from 'react';

const KeyDetails = ({ keyDetails, onDelete }) => {
  // Format bytes to human-readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Render different value types
  const renderValue = () => {
    const { type, value } = keyDetails;
    
    if (type === 'string') {
      return (
        <textarea
          readOnly
          className="w-full h-40 p-2 border rounded bg-gray-50 font-mono text-sm"
          value={value}
        />
      );
    } else if (type === 'list') {
      return (
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border text-left">Index</th>
              <th className="py-2 px-4 border text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            {value.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="py-2 px-4 border">{index}</td>
                <td className="py-2 px-4 border">{item}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (type === 'set') {
      return (
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            {value.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="py-2 px-4 border">{item}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (type === 'zset') {
      // For zset, value is returned as [member1, score1, member2, score2, ...]
      const pairs = [];
      for (let i = 0; i < value.length; i += 2) {
        pairs.push({ member: value[i], score: value[i+1] });
      }
      
      return (
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border text-left">Member</th>
              <th className="py-2 px-4 border text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair, index) => (
              <tr key={index} className="border-t">
                <td className="py-2 px-4 border">{pair.member}</td>
                <td className="py-2 px-4 border">{pair.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (type === 'hash') {
      return (
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border text-left">Field</th>
              <th className="py-2 px-4 border text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(value).map(([field, val], index) => (
              <tr key={index} className="border-t">
                <td className="py-2 px-4 border">{field}</td>
                <td className="py-2 px-4 border">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      return (
        <pre className="p-2 bg-gray-50 rounded overflow-auto max-h-80 text-sm">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
  };

  return (
    <div className="p-4">
      <div className="text-xl font-bold border-b pb-2 mb-4">{keyDetails.key}</div>
      
      <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-100 p-4 rounded">
        <div>
          <div className="text-sm text-gray-600">Type</div>
          <div className="font-semibold">{keyDetails.type}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">TTL</div>
          <div className="font-semibold">
            {keyDetails.ttl > 0 ? `${keyDetails.ttl} seconds` : 'No expiration'}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Size</div>
          <div className="font-semibold">{formatBytes(keyDetails.memory_usage)}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="font-semibold mb-2">Value</div>
        <div className="bg-white border rounded p-2 overflow-auto">
          {renderValue()}
        </div>
      </div>
      
      <div className="border-t pt-4 flex justify-end">
        <button
          onClick={() => onDelete(keyDetails.key)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center"
        >
          <i className="fas fa-trash mr-2"></i> Delete Key
        </button>
      </div>
    </div>
  );
};

export default KeyDetails;