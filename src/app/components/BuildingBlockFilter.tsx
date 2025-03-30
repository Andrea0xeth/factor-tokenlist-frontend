'use client';

import React, { memo } from 'react';
import { BuildingBlock } from '@factordao/tokenlist';

interface BuildingBlockFilterProps {
  buildingBlocks: BuildingBlock[];
  selected: BuildingBlock | null;
  onChange: (buildingBlock: BuildingBlock | null) => void;
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
 * Memoized component for building block filtering
 */
const BuildingBlockFilter = memo(({
  buildingBlocks,
  selected,
  onChange,
  isLoading = false,
  className = ''
}: BuildingBlockFilterProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange(value === '' ? null : value as BuildingBlock);
  };

  return (
    <div className={className}>
      <label htmlFor="building-block-filter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        Building Block
      </label>
      <select
        id="building-block-filter"
        value={selected || ''}
        onChange={handleChange}
        disabled={isLoading}
        className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-sm text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 disabled:opacity-50"
      >
        <option value="">All Building Blocks</option>
        {buildingBlocks.map((block) => (
          <option key={block} value={block}>
            {BUILDING_BLOCK_NAMES[block] || block}
          </option>
        ))}
      </select>
    </div>
  );
});

BuildingBlockFilter.displayName = 'BuildingBlockFilter';
export default BuildingBlockFilter; 