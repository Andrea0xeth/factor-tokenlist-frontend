'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import { Protocol } from '../types/index';
import { ChevronDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

  // States for dropdown
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProtocol = (protocolId: string) => {
    const isSelected = selected.includes(protocolId);
    if (isSelected) {
      onChange(selected.filter(id => id !== protocolId));
    } else {
      onChange([...selected, protocolId]);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label htmlFor="protocol-filter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        Protocols {selected.length > 0 && `(${selected.length} selected)`}
      </label>
      
      {/* Dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 pl-3 pr-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className="truncate">
          {selected.length === 0 
            ? 'Select protocols' 
            : selected.length === 1 
              ? protocols.find(p => p.id === selected[0])?.name || selected[0]
              : `${selected.length} protocols selected`
          }
        </span>
        <ChevronDownIcon className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
          {/* Search and clear section */}
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {selected.length} selected
            </span>
            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50"
              >
                Clear all
              </button>
            )}
          </div>
          
          {/* Options */}
          <div className="max-h-40 overflow-y-auto py-1">
            {sortedProtocols.map((protocol) => (
              <div
                key={protocol.id}
                onClick={() => toggleProtocol(protocol.id)}
                className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selected.includes(protocol.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <span className="text-sm text-gray-900 dark:text-white">{protocol.name}</span>
                {selected.includes(protocol.id) && (
                  <CheckIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Selected items display (compact chips) */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 max-h-16 overflow-y-auto">
          {selected.map(id => {
            const protocol = protocols.find(p => p.id === id);
            return (
              <div 
                key={id} 
                className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full px-2 py-0.5"
              >
                <span className="truncate max-w-[100px]">{protocol?.name || id}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProtocol(id);
                  }} 
                  className="ml-1"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

ProtocolFilter.displayName = 'ProtocolFilter';
export default ProtocolFilter;