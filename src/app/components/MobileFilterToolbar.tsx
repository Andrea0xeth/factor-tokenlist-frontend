'use client';

import { useCallback, useEffect, useState } from 'react';
import { 
  XMarkIcon, 
  AdjustmentsHorizontalIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpCircleIcon 
} from '@heroicons/react/24/outline';
import { BuildingBlock } from '@factordao/tokenlist';
import { Protocol } from '../types/index';

interface MobileFilterToolbarProps {
  protocols: Protocol[];
  buildingBlocks: BuildingBlock[];
  selectedProtocol: string;
  selectedBuildingBlock: string;
  searchText: string;
  onSearchChange: (value: string) => void;
  onProtocolClick: (protocols: string[]) => void;
  onBuildingBlockClick: (buildingBlocks: BuildingBlock[]) => void;
  onResetFilters: () => void;
}

export default function MobileFilterToolbar({
  protocols,
  buildingBlocks,
  selectedProtocol,
  selectedBuildingBlock,
  searchText,
  onSearchChange,
  onProtocolClick,
  onBuildingBlockClick,
  onResetFilters
}: MobileFilterToolbarProps) {
  // Convert string representations to arrays
  const selectedProtocols = selectedProtocol ? selectedProtocol.split(', ') : [];
  const selectedBuildingBlocksArray = selectedBuildingBlock 
    ? selectedBuildingBlock.split(', ').map(b => b as BuildingBlock) 
    : [];
  
  // Count active filters for the badge
  const activeFilterCount = [
    selectedProtocols.length > 0 ? 1 : 0, 
    selectedBuildingBlocksArray.length > 0 ? 1 : 0, 
    searchText ? 1 : 0
  ].filter(Boolean).length;

  // Local state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localSearchText, setLocalSearchText] = useState(searchText);
  const [selectedTab, setSelectedTab] = useState<'protocols' | 'buildingBlocks'>('protocols');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearchText(searchText);
  }, [searchText]);
  
  // Listen for scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle search submission
  const handleSearchSubmit = useCallback(() => {
    onSearchChange(localSearchText);
    setIsSearchFocused(false);
  }, [localSearchText, onSearchChange]);
  
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Fixed bottom toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
        {/* Main toolbar */}
        <div className="flex items-center justify-between p-3">
          {/* Filter button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 p-2 rounded-full"
          >
            <FunnelIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          
          {/* Search input */}
          <div className={`relative flex-1 mx-3 transition-all duration-200 ${isSearchFocused ? 'scale-105' : ''}`}>
            <input
              type="text"
              placeholder="Search..."
              value={localSearchText}
              onChange={(e) => setLocalSearchText(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              className="w-full py-2 px-3 pr-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            
            {localSearchText ? (
              <button
                onClick={() => {
                  setLocalSearchText('');
                  onSearchChange('');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            ) : (
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          
          {/* Apply search button */}
          {localSearchText !== searchText && (
            <button
              onClick={handleSearchSubmit}
              className="bg-blue-500 text-white p-2 rounded-full"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Active filters pills */}
        {activeFilterCount > 0 && (
          <div className="px-3 py-2 flex flex-wrap gap-1.5 items-center border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
            {selectedProtocols.map(protocol => (
              <span key={protocol} className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                {protocols.find(p => p.id === protocol)?.name || protocol}
                <button
                  onClick={() => onProtocolClick([protocol])}
                  className="ml-1"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
            
            {selectedBuildingBlocksArray.map(block => (
              <span key={block} className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-800/30 text-purple-800 dark:text-purple-300 rounded-full text-xs">
                {block}
                <button
                  onClick={() => onBuildingBlockClick([block])}
                  className="ml-1"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
            
            {searchText && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 rounded-full text-xs">
                "{searchText}"
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-1"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            
            <button
              onClick={onResetFilters}
              className="ml-auto inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-300 rounded-full text-xs"
            >
              <XMarkIcon className="h-3 w-3 mr-1" />
              Clear All
            </button>
          </div>
        )}
      </div>
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-40 transition-opacity duration-300"
        >
          <ArrowUpCircleIcon className="h-6 w-6" />
        </button>
      )}
      
      {/* Filter drawer */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div
          className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-xl shadow-xl transition-transform duration-300 transform ${
            isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ maxHeight: '80vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Drawer content */}
          <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 64px)' }}>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                className={`flex-1 py-2 text-center font-medium ${
                  selectedTab === 'protocols'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setSelectedTab('protocols')}
              >
                Protocols
              </button>
              <button
                className={`flex-1 py-2 text-center font-medium ${
                  selectedTab === 'buildingBlocks'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => setSelectedTab('buildingBlocks')}
              >
                Building Blocks
              </button>
            </div>
            
            {/* Protocols grid */}
            {selectedTab === 'protocols' && (
              <div className="grid grid-cols-2 gap-2">
                {protocols.map(protocol => (
                  <button
                    key={protocol.id}
                    onClick={() => {
                      onProtocolClick([protocol.id]);
                      setIsDrawerOpen(false);
                    }}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center border ${
                      selectedProtocols.includes(protocol.id)
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2">
                      {protocol.logoURI ? (
                        <img 
                          src={protocol.logoURI} 
                          alt={protocol.name} 
                          className="w-8 h-8 rounded-full" 
                        />
                      ) : (
                        <span className="text-xs font-bold">
                          {protocol.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      selectedProtocols.includes(protocol.id)
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {protocol.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Building blocks list */}
            {selectedTab === 'buildingBlocks' && (
              <div className="space-y-2">
                {buildingBlocks.map(block => (
                  <button
                    key={block}
                    onClick={() => {
                      onBuildingBlockClick([block]);
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full p-3 rounded-lg flex items-center justify-between ${
                      selectedBuildingBlocksArray.includes(block)
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="font-medium">{block}</span>
                    {selectedBuildingBlocksArray.includes(block) && (
                      <span className="h-3 w-3 rounded-full bg-purple-600 dark:bg-purple-400"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {/* Reset button */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  onResetFilters();
                  setIsDrawerOpen(false);
                }}
                className="w-full mt-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 