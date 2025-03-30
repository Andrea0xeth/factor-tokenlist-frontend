'use client';

import { useAppContext } from '@/app/context/AppContext';
import SearchInput from './SearchInput';
import ProtocolFilter from './ProtocolFilter';
import BuildingBlockFilter from './BuildingBlockFilter';

export default function MobileFilterToolbar() {
  const { state, dispatch } = useAppContext();
  
  const hasActiveFilters = 
    state.selectedProtocols.length > 0 || 
    state.selectedBuildingBlocks.length > 0 || 
    state.search;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50 shadow-lg">
      <div className="container mx-auto p-3 pb-safe">
        <div className="flex flex-col gap-3">
          <div className="w-full">
            <SearchInput 
              value={state.search} 
              onChange={(value) => dispatch({ type: 'SET_SEARCH', payload: value })} 
              placeholder="Search tokens..."
            />
          </div>
          
          <div className="flex justify-between gap-2">
            <div className="flex-1">
              <ProtocolFilter />
            </div>
            
            <div className="flex-1">
              <BuildingBlockFilter />
            </div>
            
            {hasActiveFilters && (
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md whitespace-nowrap text-sm"
                onClick={() => dispatch({ type: 'RESET_FILTERS' })}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 