'use client';

import React, { Suspense, Fragment, useState, useEffect, useRef } from 'react';
import { useAppContext } from './context/AppContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import { getChainName } from './lib/chains';
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
      filters: { searchText, selectedProtocolIds, selectedBuildingBlocks }
    },
    filteredTokens,
    setSearchText,
    setSelectedProtocols,
    setSelectedBuildingBlocks,
    resetFilters,
    changeChain
  } = useAppContext();

  // Determine if there are active filters
  const hasActiveFilters = searchText.trim() !== '' || 
    selectedProtocolIds.length > 0 || 
    selectedBuildingBlocks.length > 0;

  // Check if we should show skeleton loaders
  const showSkeletons = isLoading || isChangingChain;

  // State to track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  // State to track if header should be visible
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  // Check for mobile screen on client side only and handle scroll
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    // Initial check
    checkMobile();
    
    // Add event listeners
    window.addEventListener('resize', checkMobile);
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - now hides on scroll */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? 'transform-none' : '-translate-y-full'
        }`}
      >
        <Navbar 
          className="bg-white dark:bg-gray-800 shadow-sm" 
          selectedChainId={selectedChain}
          onChainChange={changeChain}
        />
      </div>
      
      {/* Spacer to replace fixed header */}
      <div className="h-16"></div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Mobile filter toolbar */}
        <div className="md:hidden mb-4">
          <MobileFilterToolbar 
            protocols={protocols}
            buildingBlocks={Object.values(BuildingBlock)}
            selectedProtocol={selectedProtocolIds.join(', ')}
            selectedBuildingBlock={selectedBuildingBlocks.join(', ')}
            searchText={searchText}
            onSearchChange={setSearchText}
            onProtocolClick={(value) => setSelectedProtocols(value)}
            onBuildingBlockClick={(value) => setSelectedBuildingBlocks(value)}
            onResetFilters={resetFilters}
          />
        </div>
        
        {/* Desktop filters and search - keep this sticky */}
        <div className="hidden md:block sticky top-0 bg-white dark:bg-gray-800 z-40 shadow-md mb-10">
          {/* Title bar with chain selector */}
          <div className="container mx-auto px-4 py-3 flex items-center justify-end border-b border-gray-200 dark:border-gray-700">
            {/* Active filters badges */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                {selectedProtocolIds.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                    <span>{selectedProtocolIds.map(id => protocols.find(p => p.id === id)?.name || id).join(', ')}</span>
                    <button onClick={() => setSelectedProtocols([])} className="ml-1 text-blue-500 hover:text-blue-700">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {selectedBuildingBlocks.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                    <span>{selectedBuildingBlocks.join(', ')}</span>
                    <button onClick={() => setSelectedBuildingBlocks([])} className="ml-1 text-purple-500 hover:text-purple-700">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {searchText.trim() !== '' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
                    <span>{searchText}</span>
                    <button onClick={() => setSearchText('')} className="ml-1 text-green-500 hover:text-green-700">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={resetFilters}
                  className="ml-2 px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 text-sm rounded-full transition-colors flex items-center"
                >
                  <XMarkIcon className="h-3 w-3 mr-1" />
                  Clear All
                </button>
              </div>
            )}
          </div>
          
          {/* Filter controls */}
          <div className="container mx-auto px-4 py-3 grid grid-cols-12 gap-4 items-center">
            {/* Search field - spans 4 columns */}
            <div className="col-span-4">
              <SearchInput 
                value={searchText} 
                onChange={setSearchText} 
              />
            </div>
            
            {/* Protocol filter - spans 4 columns */}
            <div className="col-span-4">
              <ProtocolFilter 
                protocols={protocols} 
                selected={selectedProtocolIds}
                onChange={(value) => setSelectedProtocols(value)}
              />
            </div>
            
            {/* Building block filter - spans 4 columns */}
            <div className="col-span-4">
              <BuildingBlockFilter 
                buildingBlocks={Object.values(BuildingBlock)}
                selected={selectedBuildingBlocks}
                onChange={(value) => setSelectedBuildingBlocks(value as BuildingBlock[])}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
        
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
          <MobileFilterToolbar 
            protocols={protocols}
            buildingBlocks={Object.values(BuildingBlock)}
            selectedProtocol={selectedProtocolIds.join(', ')}
            selectedBuildingBlock={selectedBuildingBlocks.join(', ')}
            searchText={searchText}
            onSearchChange={setSearchText}
            onProtocolClick={(value) => setSelectedProtocols(value)}
            onBuildingBlockClick={(value) => setSelectedBuildingBlocks(value)}
            onResetFilters={resetFilters}
          />
        )}
      </div>
    </main>
  );
}
