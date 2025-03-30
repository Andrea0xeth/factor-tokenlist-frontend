'use client';

import React, { memo } from 'react';
import { BuildingBlock } from '@factordao/tokenlist';

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
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(option => option.value as BuildingBlock);
    onChange(options.length === 0 ? [] : options);
  };

  const toggleBuildingBlock = (block: BuildingBlock) => {
    const isSelected = selected.includes(block);
    if (isSelected) {
      onChange(selected.filter(b => b !== block));
    } else {
      onChange([...selected, block]);
    }
  };

  return (
    <div className={className}>
      <label htmlFor="building-block-filter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        Building Blocks
      </label>
      <div className="space-y-2">
        <select
          id="building-block-filter"
          value={selected}
          onChange={handleChange}
          disabled={isLoading}
          multiple
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-sm text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 disabled:opacity-50"
        >
          {buildingBlocks.map((block) => (
            <option key={block} value={block}>
              {BUILDING_BLOCK_NAMES[block] || block}
            </option>
          ))}
        </select>
        
        <div className="flex flex-wrap gap-1 mt-1">
          {buildingBlocks.map((block) => (
            <button
              key={block}
              onClick={() => toggleBuildingBlock(block)}
              disabled={isLoading}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                selected.includes(block)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {BUILDING_BLOCK_NAMES[block] || block}
            </button>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              disabled={isLoading}
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

BuildingBlockFilter.displayName = 'BuildingBlockFilter';
export default BuildingBlockFilter; 