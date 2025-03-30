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
import { BuildingBlock } from '@factordao/tokenlist';
import { useWindowSize } from '@/app/hooks/useWindowSize';

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

  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;

  // Determine if there are active filters
  const hasActiveFilters = searchText.trim() !== '' || 
    selectedProtocolId !== null || 
    selectedBuildingBlock !== null;

  // Check if we should show skeleton loaders
  const showSkeletons = isLoading || isChangingChain;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar filters - hidden on mobile */}
          {!isMobile && (
            <div className="w-full md:w-64 shrink-0">
              <Filters />
            </div>
          )}

          {/* Main content */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold">Token List</h1>
                <div className="flex items-center gap-3">
                  <SearchInput 
                    value={searchText}
                    onChange={setSearchText}
                    placeholder="Search tokens..."
                    className="w-full sm:w-auto"
                  />
                  <ChainSelector />
                </div>
              </div>
            </div>

            {/* Token list grid - responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokens.map((token) => (
                <TokenCard key={`${token.chainId}-${token.address}`} token={token} />
              ))}
            </div>

            {/* Empty state with illustration */}
            {tokens.length === 0 && (
              <div className="text-center py-10">
                <div className="mb-4">
                  <img 
                    src="/empty-state.svg" 
                    alt="No tokens found" 
                    className="w-48 h-48 mx-auto opacity-60"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">No tokens found</h3>
                <p className="text-[#B8BCD8] max-w-md mx-auto">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Filters component - only rendered in mobile view */}
      {isMobile && <Filters />}
    </main>
  );
}
