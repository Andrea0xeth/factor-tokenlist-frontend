'use client';

import { useAppContext } from '@/app/context/AppContext';
import SearchInput from './SearchInput';
import ProtocolFilter from './ProtocolFilter';
import BuildingBlockFilter from './BuildingBlockFilter';
import { BuildingBlock } from '@factordao/tokenlist';
import React, { useState } from 'react';
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function MobileFilterToolbar() {
  const {
    state: {
      filters: { searchText, selectedProtocolId, selectedBuildingBlock },
      isLoading,
      protocols
    },
    setSearchText,
    setSelectedProtocol,
    setSelectedBuildingBlock,
    resetFilters
  } = useAppContext();
  
  // State to track expanded state of filters
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'filters'>('search');
  
  // Check if we have active filters
  const hasActiveFilters = 
    searchText.trim() !== '' || 
    selectedProtocolId !== null || 
    selectedBuildingBlock !== null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 shadow-lg transition-transform">
      {/* Expanded panel */}
      {expanded && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <div className="flex">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-3 py-1.5 rounded-l-md text-sm font-medium ${
                  activeTab === 'search'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
                Search
              </button>
              <button
                onClick={() => setActiveTab('filters')}
                className={`px-3 py-1.5 rounded-r-md text-sm font-medium ${
                  activeTab === 'filters'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4 inline mr-1" />
                Filters
              </button>
            </div>
            
            <button
              onClick={() => setExpanded(false)}
              className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search tab */}
          {activeTab === 'search' && (
            <div className="w-full">
              <SearchInput 
                value={searchText} 
                onChange={setSearchText} 
                placeholder="Search by name, symbol or address..."
              />
            </div>
          )}
          
          {/* Filters tab */}
          {activeTab === 'filters' && (
            <div className="space-y-3">
              <div className="w-full">
                <ProtocolFilter 
                  protocols={protocols}
                  selected={selectedProtocolId}
                  onChange={setSelectedProtocol}
                />
              </div>
              
              <div className="w-full">
                <BuildingBlockFilter 
                  buildingBlocks={Object.values(BuildingBlock)}
                  selected={selectedBuildingBlock}
                  onChange={(value) => setSelectedBuildingBlock(value as BuildingBlock | null)}
                  isLoading={isLoading}
                />
              </div>
              
              {hasActiveFilters && (
                <button
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
                  onClick={resetFilters}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Collapsed toolbar */}
      <div className="p-3 pb-safe flex justify-between items-center">
        <button
          onClick={() => {
            setExpanded(true);
            setActiveTab('filters');
          }}
          className="flex items-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md"
        >
          <AdjustmentsHorizontalIcon className="w-5 h-5 mr-1" />
          Filters {hasActiveFilters && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full"></span>}
        </button>
        
        <div className="flex-1 mx-2">
          <button 
            onClick={() => {
              setExpanded(true);
              setActiveTab('search');
            }}
            className="w-full flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-md"
          >
            <MagnifyingGlassIcon className="w-5 h-5 mr-1" />
            {searchText ? searchText : "Search..."}
          </button>
        </div>
        
        {hasActiveFilters && (
          <button
            className="px-3 py-2 bg-red-600 text-white rounded-md text-sm"
            onClick={resetFilters}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
} 