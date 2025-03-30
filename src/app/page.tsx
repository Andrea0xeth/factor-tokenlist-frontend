'use client';

import React, { Suspense, Fragment, useState, useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import Navbar from './components/Navbar';
import ChainSelector from './components/ChainSelector';
import LoadingSpinner from './components/LoadingSpinner';
import { getChainName } from './lib/chains';
import { SUPPORTED_CHAIN_IDS } from './lib/tokenlist';
import { SkeletonCard } from './components/SkeletonCard';
import TokenGrid from './components/TokenGrid';
import ProtocolFilter from './components/ProtocolFilter';
import BuildingBlockFilter from './components/BuildingBlockFilter';
import SearchInput from './components/SearchInput';
import { Transition } from '@headlessui/react';
import { BuildingBlock } from '@factordao/tokenlist';
import MobileFilterToolbar from '@/app/components/MobileFilterToolbar';

export default function Home() {
  // We use the Context to access the app's global state
  const {
    state: {
      tokens,
      protocols,
      selectedChain,
      isLoading,
      isChangingChain,
      error,
      filters: { searchText, selectedProtocolId, selectedBuildingBlock }
    },
    filteredTokens,
    setSearchText,
    setSelectedProtocol,
    setSelectedBuildingBlock,
    resetFilters,
    changeChain
  } = useAppContext();

  // Determine if there are active filters
  const hasActiveFilters = searchText.trim() !== '' || 
    selectedProtocolId !== null || 
    selectedBuildingBlock !== null;

  // Check if we should show skeleton loaders
  const showSkeletons = isLoading || isChangingChain;

  // State to track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile screen on client side only
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 pb-8">
        {/* Chain selector */}
        {SUPPORTED_CHAIN_IDS.length > 1 && (
          <div className="mb-4 flex justify-end">
            <ChainSelector 
              selectedChain={selectedChain} 
              onChainChange={changeChain} 
            />
          </div>
        )}
        
        {/* Desktop filters - hidden on mobile */}
        {!isMobile && (
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2 md:w-1/3">
              <SearchInput 
                value={searchText} 
                onChange={setSearchText} 
              />
            </div>
            
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <ProtocolFilter 
                  protocols={protocols} 
                  selected={selectedProtocolId}
                  onChange={setSelectedProtocol}
                />
              </div>
              <div className="w-full sm:w-1/2">
                <BuildingBlockFilter 
                  buildingBlocks={Object.values(BuildingBlock)}
                  selected={selectedBuildingBlock}
                  onChange={(value) => setSelectedBuildingBlock(value as BuildingBlock | null)}
                  isLoading={isLoading}
                />
              </div>
            </div>
            
            {(selectedProtocolId !== null || selectedBuildingBlock !== null || searchText.trim() !== '') && (
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>
        )}
        
        {/* Loading state */}
        <Transition
          show={showSkeletons}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          as={Fragment}
        >
          <div>
            <div className="flex justify-center items-center mb-6">
              <LoadingSpinner />
              <p className="ml-3 text-gray-600 dark:text-gray-300">
                Loading tokens for {getChainName(selectedChain)}...
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <SkeletonCard key={`skeleton-${index}`} opacity={1} />
              ))}
            </div>
          </div>
        </Transition>
        
        {/* Error state */}
        {!showSkeletons && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        
        {/* No results state */}
        {!showSkeletons && !error && filteredTokens.length === 0 && tokens.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 my-6">
            <p className="text-yellow-700 dark:text-yellow-300">
              No tokens match the selected filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
        
        {/* Token grid */}
        {!showSkeletons && !error && (
          <Suspense fallback={<div>Loading...</div>}>
            <Transition
              show={!showSkeletons}
              enter="transition-opacity duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              as={Fragment}
            >
              <div className={isMobile ? 'mb-24' : ''}>
                <TokenGrid 
                  tokens={filteredTokens} 
                  protocols={protocols} 
                  chainId={selectedChain}
                  isMobile={isMobile}
                />
                
                {filteredTokens.length > 0 && (
                  <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Showing {filteredTokens.length} tokens out of {tokens.length} available for {getChainName(selectedChain)}
                  </div>
                )}
              </div>
            </Transition>
          </Suspense>
        )}
        
        {/* Mobile Bottom Filter Toolbar */}
        {isMobile && (
          <MobileFilterToolbar />
        )}
      </div>
    </main>
  );
}
