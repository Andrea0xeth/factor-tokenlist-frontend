'use client';

import React, { useState, useMemo } from 'react';
import TokenImage from './TokenImage';
import { Token } from '../types';
import { getExplorerUrl } from '../lib/chains';
import { useAppContext } from '../context/AppContext';
import { BuildingBlock } from '@factordao/tokenlist';

// Import the getProtocolLogoURI function
import { getProtocolLabel } from '../lib/tokenlist';

interface TokenCardProps {
  token: Token;
  onClick?: (token: Token) => void;
}

// Map building block IDs to user-friendly names
const BUILDING_BLOCK_NAMES: Record<string, string> = {
  [BuildingBlock.BORROW]: 'Borrow',
  [BuildingBlock.DEPOSIT]: 'Deposit',
  [BuildingBlock.STAKE]: 'Stake',
  [BuildingBlock.WITHDRAW]: 'Withdraw',
  [BuildingBlock.SWAP]: 'Swap',
  [BuildingBlock.REPAY]: 'Repay',
};

// Function to get protocol logo URLs
const getProtocolLogoUrl = (protocol: string): string => {
  return `/icons/protocols/${protocol.toLowerCase()}.png`;
};

const TokenCard: React.FC<TokenCardProps> = ({ token, onClick }) => {
  const { state } = useAppContext();
  const { selectedChain } = state;
  
  // Extract token details
  const symbol = token.symbol || '';
  const name = token.name || '';
  const protocols = token.extensions?.protocols || [];
  const buildingBlocks = token.extensions?.buildingBlocks || [];
  
  // Check if it's a Pro Vault
  const isProVault = protocols.includes('pro-vaults') || Boolean(token.vaultAddress);
  
  // Get APY if available in extensions
  const apy = token.extensions?.vaultInfo?.apy;
  const formattedApy = typeof apy === 'number' ? `${apy.toFixed(2)}%` : null;
  
  // Check if token is deprecated
  const isDeprecated = token.extensions?.vaultInfo?.deprecated;
  
  // Get the correct explorer URL for the selected chain
  const explorerLink = getExplorerUrl(selectedChain, token.address);

  // Store the protocol being hovered for tooltip
  const [hoveredProtocol, setHoveredProtocol] = useState<string | null>(null);

  return (
    <div 
      onClick={() => onClick && onClick(token)}
      className={`relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 ${isDeprecated ? 'border-red-300 dark:border-red-700' : ''}`}
    >
      {isDeprecated && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold py-0.5 px-1.5 rounded">
          Deprecated
        </div>
      )}
      
      {isProVault && formattedApy && (
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold py-0.5 px-1.5 rounded">
          APY: {formattedApy}
        </div>
      )}

      <div className="p-2.5">
        {/* Header section with logo and name side by side */}
        <div className="flex items-center mb-2">
          <div className="mr-2.5 flex-shrink-0">
            <TokenImage 
              src={token.logoURI}
              alt={symbol}
              address={token.address}
              size={30}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white leading-tight truncate" title={token.name}>
              {symbol}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {name}
            </p>
          </div>
          {/* Address section moved to top right */}
          <a 
            href={explorerLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 ml-2"
            onClick={(e) => e.stopPropagation()}
            title={`View on explorer: ${token.address}`}
          >
            {token.address.slice(0, 6)}...{token.address.slice(-4)}
          </a>
        </div>
        
        {/* Building block badges - more compact */}
        {buildingBlocks.length > 0 && (
          <div className="mt-1">
            <div className="flex flex-wrap gap-1 justify-start">
              {buildingBlocks.map((block) => (
                <span 
                  key={block}
                  className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-sm px-1.5 py-0.5 text-[10px]"
                >
                  {BUILDING_BLOCK_NAMES[block] || block}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Protocol icons with tooltips */}
        {protocols.length > 0 && (
          <div className="mt-2 relative">
            <div className="flex flex-wrap gap-1.5 justify-start">
              {protocols.map((protocol) => (
                <div 
                  key={protocol}
                  className="relative"
                  onMouseEnter={() => setHoveredProtocol(protocol)}
                  onMouseLeave={() => setHoveredProtocol(null)}
                >
                  <div 
                    className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md"
                    style={{ 
                      backgroundImage: `url(${getProtocolLogoUrl(protocol)})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      backgroundColor: '#f0f0f0' // Light background for transparent logos
                    }}
                  >
                    {/* Fallback if no image or image fails to load */}
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 opacity-0">
                      {protocol.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Enhanced tooltip with animation */}
                  {hoveredProtocol === protocol && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs rounded-md shadow-lg whitespace-nowrap z-10 animate-fadeIn">
                      {protocol.charAt(0).toUpperCase() + protocol.slice(1)}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenCard;