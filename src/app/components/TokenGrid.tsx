import React, { memo, useState } from 'react';
import { Token, Protocol } from '../types/index';
import TokenCard from './TokenCard';
import TokenDetailModal from './TokenDetailModal';

interface TokenGridProps {
  tokens: Token[];
  protocols: Protocol[];
  chainId: number;
  isMobile?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * Optimized component for displaying a grid of tokens
 */
const TokenGrid = memo(({ 
  tokens, 
  protocols, 
  chainId, 
  isMobile = false, 
  loading = false, 
  emptyMessage = 'No tokens found'
}: TokenGridProps) => {
  // State for the selected token to show in modal
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Handle token card click
  const handleTokenClick = (token: Token) => {
    setSelectedToken(token);
    setIsModalOpen(true);
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  // If there are no tokens, show a message
  if (!loading && tokens.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-300">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <>
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${isMobile ? 'gap-y-6' : ''}`}>
        {tokens.map((token, index) => (
          <TokenCard
            key={`${token.address}-${token.chainId || chainId}-${index}`}
            token={token}
            onClick={handleTokenClick}
          />
        ))}
      </div>
      
      {/* Token Detail Modal */}
      <TokenDetailModal 
        token={selectedToken}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
});

TokenGrid.displayName = 'TokenGrid';
export default TokenGrid; 