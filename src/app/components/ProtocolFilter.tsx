'use client';

import React, { memo } from 'react';
import { Protocol } from '../types/index';

interface ProtocolFilterProps {
  protocols: Protocol[];
  selected: string | null;
  onChange: (protocolId: string | null) => void;
  className?: string;
}

/**
 * Memoized component for protocol filtering
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
    const value = e.target.value;
    onChange(value === '' ? null : value);
  };

  return (
    <div className={className}>
      <label htmlFor="protocol-filter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        Protocol
      </label>
      <select
        id="protocol-filter"
        value={selected || ''}
        onChange={handleChange}
        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-sm text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600"
      >
        <option value="">All Protocols</option>
        {sortedProtocols.map((protocol) => (
          <option key={protocol.id} value={protocol.id}>
            {protocol.name}
          </option>
        ))}
      </select>
    </div>
  );
});

ProtocolFilter.displayName = 'ProtocolFilter';
export default ProtocolFilter;