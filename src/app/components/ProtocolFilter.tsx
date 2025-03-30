'use client';

import React, { memo } from 'react';
import { Protocol } from '../types/index';

interface ProtocolFilterProps {
  protocols: Protocol[];
  selected: string[];
  onChange: (protocolIds: string[]) => void;
  className?: string;
}

/**
 * Memoized component for protocol filtering with multiple selection support
 */
const ProtocolFilter = memo(({
  protocols,
  selected,
  onChange,
  className = ''
}: ProtocolFilterProps) => {
  // Sort protocols alphabetically for consistent UI
  const sortedProtocols = React.useMemo(() => {
    return [...protocols].sort((a, b) => a.name.localeCompare(b.name));
  }, [protocols]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value);
    onChange(options.length === 0 || (options.length === 1 && options[0] === '') ? [] : options);
  };

  const toggleProtocol = (protocolId: string) => {
    const isSelected = selected.includes(protocolId);
    if (isSelected) {
      onChange(selected.filter(id => id !== protocolId));
    } else {
      onChange([...selected, protocolId]);
    }
  };

  return (
    <div className={className}>
      <label htmlFor="protocol-filter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        Protocols
      </label>
      <div className="space-y-2">
        <select
          id="protocol-filter"
          value={selected}
          onChange={handleChange}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-sm text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600"
          multiple
        >
          {sortedProtocols.map((protocol) => (
            <option key={protocol.id} value={protocol.id}>
              {protocol.name}
            </option>
          ))}
        </select>
        
        <div className="flex flex-wrap gap-1 mt-1">
          {sortedProtocols.slice(0, 6).map((protocol) => (
            <button
              key={protocol.id}
              onClick={() => toggleProtocol(protocol.id)}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                selected.includes(protocol.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {protocol.name}
            </button>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

ProtocolFilter.displayName = 'ProtocolFilter';
export default ProtocolFilter;