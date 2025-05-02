import React from 'react';

const KeyDetails = ({ keyDetails, onDelete }) => {
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const renderValue = () => {
    const { type, value } = keyDetails;

    if (type === 'string') {
      return (
        <textarea
          readOnly
          className="w-full h-40 p-2 bg-gray-700 text-white border border-gray-600 rounded-md font-mono text-sm"
          value={value}
        />
      );
    } else if (type === 'list') {
      return (
        <table className="min-w-full border border-gray-600">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-2 px-4 border border-gray-600 text-left text-white">Index</th>
              <th className="py-2 px-4 border border-gray-600 text-left text-white">Value</th>
            </tr>
          </thead>
          <tbody>
            {value.map((item, index) => (
              <tr key={index} className="border-t border-gray-600">
                <td className="py-2 px-4 border border-gray-600 text-white">{index}</td>
                <td className="py-2 px-4 border border-gray-600 text-white">{item}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (type === 'set') {
      return (
        <table className="min-w-full border border-gray-600">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-2 px-4 border border-gray-600 text-left text-white">Value</th>
            </tr>
          </thead>
          <tbody>
            {value.map((item, index) => (
              <tr key={index} className="border-t border-gray-600">
                <td className="py-2 px-4 border border-gray-600 text-white">{item}</td>
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
        <table className="min-w-full border border-gray-600">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-2 px-4 border border-gray-600 text-left text-white">Member</th>
              <th className="py-2 px-4 border border-gray-600 text-left text-white">Score</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair, index) => (
              <tr key={index} className="border-t border-gray-600">
                <td className="py-2 px-4 border border-gray-600 text-white">{pair.member}</td>
                <td className="py-2 px-4 border border-gray-600 text-white">{pair.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (type === 'hash') {
      return (
        <table className="min-w-full border border-gray-600">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-2 px-4 border border-gray-600 text-left text-white">Field</th>
              <th className="py-2 px-4 border border-gray-600 text-left text-white">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(value).map(([field, val], index) => (
              <tr key={index} className="border-t border-gray-600">
                <td className="py-2 px-4 border border-gray-600 text-white">{field}</td>
                <td className="py-2 px-4 border border-gray-600 text-white">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      return (
        <pre className="p-2 bg-gray-700 text-white rounded-md overflow-auto max-h-80 text-sm">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white">
      <div className="text-xl font-semibold border-b border-gray-600 pb-2 mb-4">{keyDetails.key}</div>

      <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-900 p-4 rounded-lg">
        <div>
          <div className="text-sm text-gray-400">Type</div>
          <div className="font-semibold">{keyDetails.type}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">TTL</div>
          <div className="font-semibold">
            {keyDetails.ttl > 0 ? `${keyDetails.ttl} seconds` : 'No expiration'}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Size</div>
          <div className="font-semibold">{formatBytes(keyDetails.memory_usage)}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="font-semibold mb-2">Value</div>
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-2 overflow-auto">
          {renderValue()}
        </div>
      </div>

      <div className="border-t border-gray-600 pt-4 flex justify-end">
        <button
          onClick={() => onDelete(keyDetails.key)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition duration-150 ease-in-out"
        >
          <i className="fas fa-trash mr-2"></i> Delete Key
        </button>
      </div>
    </div>
  );
};

export default KeyDetails;