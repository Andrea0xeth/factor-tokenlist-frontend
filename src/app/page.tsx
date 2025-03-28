'use client';

import React, { Suspense, Fragment } from 'react';
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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Factor TokenList Explorer
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              View tokens and protocols available on
              {SUPPORTED_CHAIN_IDS.length === 1 ? (
                <span className="ml-1 font-medium">{getChainName(SUPPORTED_CHAIN_IDS[0])}</span>
              ) : (
                <span> multiple chains</span>
              )}
            </p>
          </div>
          
          {SUPPORTED_CHAIN_IDS.length > 1 && (
            <ChainSelector 
              selectedChain={selectedChain} 
              onChainChange={changeChain} 
            />
          )}
        </div>
        
        {/* Filters section */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <SearchInput 
                value={searchText} 
                onChange={setSearchText} 
                placeholder="Name, symbol or address..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Protocol
              </label>
              <ProtocolFilter 
                protocols={protocols} 
                selectedProtocolId={selectedProtocolId}
                onChange={setSelectedProtocol}
                isLoading={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Action
              </label>
              <BuildingBlockFilter 
                selectedBuildingBlock={selectedBuildingBlock}
                onChange={setSelectedBuildingBlock}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {filteredTokens.length} results found
              </div>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                aria-label="Reset all filters"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
        
        {SUPPORTED_CHAIN_IDS.length > 1 && (
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              You are viewing tokens on <span className="font-medium mx-1">{getChainName(selectedChain)}</span>
            </p>
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
              <div>
                <TokenGrid 
                  tokens={filteredTokens} 
                  protocols={protocols} 
                  chainId={selectedChain}
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
      </div>
    </main>
  );
}
