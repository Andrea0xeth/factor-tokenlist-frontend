'use client';

import { useAppContext } from '@/app/context/AppContext';
import SearchInput from './SearchInput';
import ProtocolFilter from './ProtocolFilter';
import BuildingBlockFilter from './BuildingBlockFilter';
import { BuildingBlock } from '@factordao/tokenlist';

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
  
  const hasActiveFilters = 
    searchText.trim() !== '' || 
    selectedProtocolId !== null || 
    selectedBuildingBlock !== null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 shadow-lg">
      <div className="container mx-auto p-3 pb-safe">
        <div className="flex flex-col gap-3">
          <div className="w-full">
            <SearchInput 
              value={searchText} 
              onChange={setSearchText} 
              placeholder="Search tokens..."
            />
          </div>
          
          <div className="flex justify-between gap-2">
            <div className="flex-1">
              <ProtocolFilter 
                protocols={protocols}
                selected={selectedProtocolId}
                onChange={setSelectedProtocol}
              />
            </div>
            
            <div className="flex-1">
              <BuildingBlockFilter 
                buildingBlocks={Object.values(BuildingBlock)}
                selected={selectedBuildingBlock}
                onChange={(value) => setSelectedBuildingBlock(value as BuildingBlock | null)}
                isLoading={isLoading}
              />
            </div>
            
            {hasActiveFilters && (
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md whitespace-nowrap text-sm"
                onClick={resetFilters}
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