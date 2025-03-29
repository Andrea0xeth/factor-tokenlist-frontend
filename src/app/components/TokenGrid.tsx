import React, { memo } from 'react';
import { Token, Protocol } from '../types/index';
import TokenCard from './TokenCard';

interface TokenGridProps {
  tokens: Token[];
  protocols: Protocol[];
  chainId: number;
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
  loading = false, 
  emptyMessage = 'No tokens found'
}: TokenGridProps) => {
  
  // If there are no tokens, show a message
  if (!loading && tokens.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-300">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tokens.map((token, index) => (
        <TokenCard
          key={`${token.address}-${token.chainId || chainId}-${index}`}
          token={token}
        />
      ))}
    </div>
  );
});

TokenGrid.displayName = 'TokenGrid';
export default TokenGrid; 