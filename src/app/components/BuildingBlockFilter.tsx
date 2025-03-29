'use client';

import React, { useState } from 'react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Combobox } from '@headlessui/react';
import { BuildingBlock } from '@factordao/tokenlist';

// Map of building blocks with their readable names
const BUILDING_BLOCK_NAMES: Record<string, string> = {
  [BuildingBlock.BORROW]: 'Borrow',
  [BuildingBlock.CDP]: 'CDP',
  [BuildingBlock.DEPOSIT]: 'Deposit',
  [BuildingBlock.GRANTREWARDS]: 'Grant Rewards',
  [BuildingBlock.STAKE]: 'Stake',
  [BuildingBlock.TRANSFER]: 'Transfer',
  [BuildingBlock.WITHDRAW]: 'Withdraw',
  [BuildingBlock.ZAP]: 'Zap',
};

interface BuildingBlockFilterProps {
  buildingBlocks: string[];
  selected: string | null;
  onChange: (buildingBlock: string | null) => void;
}

/**
 * Component for filtering tokens by building block
 */
export default function BuildingBlockFilter({
  buildingBlocks = [],
  selected,
  onChange
}: BuildingBlockFilterProps) {
  const [query, setQuery] = useState('');

  // Filter building blocks based on search query
  const filteredBuildingBlocks = query === ''
    ? buildingBlocks
    : buildingBlocks.filter((buildingBlock) => {
        const friendlyName = BUILDING_BLOCK_NAMES[buildingBlock] || buildingBlock;
        return friendlyName.toLowerCase().includes(query.toLowerCase()) ||
               buildingBlock.toLowerCase().includes(query.toLowerCase());
      });

  // Get the friendly name for the selected building block
  const selectedFriendlyName = selected ? (BUILDING_BLOCK_NAMES[selected] || selected) : null;

  // Placeholder text for the input field
  const placeholderText = selectedFriendlyName || "Filter by building block";

  // List of available building blocks with the selected one at the top
  const sortedBuildingBlocks = Array.isArray(filteredBuildingBlocks) 
    ? [...filteredBuildingBlocks].sort((a, b) => {
        if (a === selected) return -1;
        if (b === selected) return 1;
        
        const nameA = BUILDING_BLOCK_NAMES[a] || a;
        const nameB = BUILDING_BLOCK_NAMES[b] || b;
        return nameA.localeCompare(nameB);
      })
    : [];

  return (
    <div className="w-full max-w-xs">
      <Combobox value={selected} onChange={onChange}>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white dark:bg-slate-800 text-left shadow-md focus:outline-none sm:text-sm border border-gray-300 dark:border-slate-700">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white focus:ring-0 bg-transparent"
              displayValue={(buildingBlock: string | null) => 
                buildingBlock ? (BUILDING_BLOCK_NAMES[buildingBlock] || buildingBlock) : ''
              }
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholderText}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {selected && (
              <Combobox.Option
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                  }`
                }
                value={null}
              >
                {({ selected: isSelected, active }) => (
                  <>
                    <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                      Clear filter
                    </span>
                    {isSelected ? (
                      <span
                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                          active ? 'text-white' : 'text-blue-600'
                        }`}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Combobox.Option>
            )}
            {sortedBuildingBlocks.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                No building blocks found.
              </div>
            ) : (
              sortedBuildingBlocks.map((buildingBlock) => (
                <Combobox.Option
                  key={buildingBlock}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                    }`
                  }
                  value={buildingBlock}
                >
                  {({ selected: isSelected, active }) => (
                    <>
                      <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                        {BUILDING_BLOCK_NAMES[buildingBlock] || buildingBlock}
                      </span>
                      {isSelected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-blue-600'
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
} 