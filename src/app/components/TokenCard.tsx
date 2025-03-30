'use client';

import { useState } from 'react';
import { Token } from '../types/index';
import TokenImage from './TokenImage';
import { getExplorerUrl } from '../lib/chains';
import { useAppContext } from '../context/AppContext';
import { BuildingBlock } from '@factordao/tokenlist';

interface TokenCardProps {
  token: Token;
  isMobile?: boolean;
}

// Map building block IDs to user-friendly names
const BUILDING_BLOCK_NAMES: Record<string, string> = {
  [BuildingBlock.BORROW]: 'Borrow',
  [BuildingBlock.DEPOSIT]: 'Deposit',
  [BuildingBlock.STAKE]: 'Stake',
  [BuildingBlock.WITHDRAW]: 'Withdraw',
  [BuildingBlock.SWAP]: 'Swap',
  [BuildingBlock.REPAY]: 'Repay',
  // Add any other building blocks that are actually in the enum
  // Removed CLAIM, LEVERAGE, MINT, REDEEM, UNSTAKE as they might not exist
};

/**
 * Card component that displays a token with its information
 */
export default function TokenCard({ token, isMobile = false }: TokenCardProps) {
  const { state } = useAppContext();
  const { selectedChain } = state;
  
  // Extract token details
  const symbol = token.symbol || '';
  const name = token.name || '';
  const protocols = token.extensions?.protocols || [];
  const buildingBlocks = token.extensions?.buildingBlocks || [];
  
  // Check if it's a Pro Vault
  const isProVault = protocols.includes('pro-vaults');
  
  // Get APY if available in extensions
  const apy = token.extensions?.vaultInfo?.apy;
  
  // Get the correct explorer URL for the selected chain
  const explorerLink = getExplorerUrl(selectedChain, token.address);

  // Helper function to get friendly name for building block
  const getBuildingBlockName = (block: string): string => {
    return BUILDING_BLOCK_NAMES[block] || block;
  };

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 ${isMobile ? 'shadow-md' : ''}`}>
      <div className="p-4">
        {/* Card header with token image and symbol */}
        <div className="flex items-center mb-3">
          <div className={`relative ${isMobile ? 'mr-4' : 'mr-3'}`}>
            <TokenImage 
              src={token.logoURI}
              alt={token.symbol || 'Token'}
              address={token.address}
              size={isMobile ? 48 : 32}
            />
          </div>
          <div>
            <h3 className={`font-medium text-gray-900 dark:text-white ${isMobile ? 'text-lg' : ''}`}>
              {symbol}
              {isProVault && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  Pro Vault
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {name}
            </p>
          </div>
        </div>

        {/* Token chain and address details */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Chain
            </span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              {selectedChain}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Address
            </span>
            <a 
              href={explorerLink}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-mono text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate max-w-[180px]"
            >
              {token.address}
            </a>
          </div>
        </div>

        {/* Token protocols */}
        {protocols.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Protocols
            </h4>
            <div className="flex flex-wrap gap-1">
              {protocols.map((protocol) => (
                <span
                  key={protocol}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                >
                  {protocol}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Token building blocks */}
        {buildingBlocks.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Actions
            </h4>
            <div className="flex flex-wrap gap-1">
              {buildingBlocks.map((block) => (
                <span
                  key={block}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                >
                  {getBuildingBlockName(block)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* APY display if available */}
        {apy !== undefined && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              APY
            </h4>
            <div className={`font-semibold text-green-600 dark:text-green-400 ${isMobile ? 'text-lg' : ''}`}>
              {apy}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 