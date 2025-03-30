'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import { BuildingBlock } from '@factordao/tokenlist';
import { ChevronDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BuildingBlockFilterProps {
  buildingBlocks: BuildingBlock[];
  selected: BuildingBlock[];
  onChange: (buildingBlocks: BuildingBlock[]) => void;
  isLoading?: boolean;
  className?: string;
}

// Map building block enum values to user-friendly names
const BUILDING_BLOCK_NAMES: Record<string, string> = {
  [BuildingBlock.BORROW]: 'Borrow',
  [BuildingBlock.DEPOSIT]: 'Deposit',
  [BuildingBlock.STAKE]: 'Stake',
  [BuildingBlock.WITHDRAW]: 'Withdraw',
  [BuildingBlock.SWAP]: 'Swap',
  [BuildingBlock.REPAY]: 'Repay',
};

/**
 * Memoized component for building block filtering with multiple selection support
 */
const BuildingBlockFilter = memo(({
  buildingBlocks,
  selected,
  onChange,
  isLoading = false,
  className = ''
}: BuildingBlockFilterProps) => {
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

  const toggleBuildingBlock = (block: BuildingBlock) => {
    const isSelected = selected.includes(block);
    if (isSelected) {
      onChange(selected.filter(b => b !== block));
    } else {
      onChange([...selected, block]);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label htmlFor="building-block-filter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        Actions {selected.length > 0 && `(${selected.length} selected)`}
      </label>
      
      {/* Dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center justify-between w-full py-2 pl-3 pr-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
      >
        <span className="truncate">
          {selected.length === 0 
            ? 'Select actions' 
            : selected.length === 1 
              ? BUILDING_BLOCK_NAMES[selected[0]] || selected[0]
              : `${selected.length} actions selected`
          }
        </span>
        <ChevronDownIcon className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown content */}
      {isOpen && !isLoading && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
          {/* Clear section */}
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
          <div className="py-1">
            {buildingBlocks.map((block) => (
              <div
                key={block}
                onClick={() => toggleBuildingBlock(block)}
                className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selected.includes(block) ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
              >
                <span className="text-sm text-gray-900 dark:text-white">
                  {BUILDING_BLOCK_NAMES[block] || block}
                </span>
                {selected.includes(block) && (
                  <CheckIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Selected items display (compact chips) */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 max-h-16 overflow-y-auto">
          {selected.map(block => (
            <div 
              key={block} 
              className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full px-2 py-0.5"
            >
              <span>{BUILDING_BLOCK_NAMES[block] || block}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBuildingBlock(block);
                }} 
                className="ml-1"
                disabled={isLoading}
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

BuildingBlockFilter.displayName = 'BuildingBlockFilter';
export default BuildingBlockFilter; 