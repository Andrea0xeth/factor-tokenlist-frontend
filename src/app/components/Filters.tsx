import { useEffect, useState } from 'react';
import { ProtocolFilters } from '@/app/components/ProtocolFilters';
import { DevFilters } from '@/app/components/DevFilters';
import { BuildingBlockFilters } from '@/app/components/BuildingBlockFilters';
import { useWindowSize } from '@/app/hooks/useWindowSize';

export const Filters = () => {
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Close mobile filters when resizing to desktop
  useEffect(() => {
    if (!isMobile) {
      setShowMobileFilters(false);
    }
  }, [isMobile]);

  if (isMobile) {
    return (
      <>
        {/* Mobile filter toggle button */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-12 h-12 bg-[#2C3156] rounded-full shadow-lg"
          aria-label="Toggle filters"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>

        {/* Mobile filters bottom sheet */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setShowMobileFilters(false)}>
            <div
              className="fixed bottom-0 left-0 right-0 bg-[#1B1F38] rounded-t-xl shadow-lg z-50 p-4 pb-8 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-400 hover:text-white"
                  aria-label="Close filters"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Protocol filters section */}
                <div>
                  <h3 className="text-md font-medium text-white mb-2">Protocols</h3>
                  <ProtocolFilters className="flex flex-wrap gap-2" />
                </div>
                
                {/* Building Block filters section */}
                <div>
                  <h3 className="text-md font-medium text-white mb-2">Building Blocks</h3>
                  <BuildingBlockFilters className="flex flex-wrap gap-2" />
                </div>
                
                {/* Dev filters section */}
                <div>
                  <h3 className="text-md font-medium text-white mb-2">Developer Options</h3>
                  <DevFilters className="flex flex-wrap gap-2" />
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop filters
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold mb-2">Protocols</h1>
        <ProtocolFilters />
      </div>
      <div>
        <h1 className="text-xl font-semibold mb-2">Building Blocks</h1>
        <BuildingBlockFilters />
      </div>
      <div>
        <h1 className="text-xl font-semibold mb-2">Developer Options</h1>
        <DevFilters />
      </div>
    </div>
  );
}; 