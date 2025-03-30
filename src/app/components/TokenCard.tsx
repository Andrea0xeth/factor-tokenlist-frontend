'use client';

import { useState } from 'react';
import { Token } from '../types/index';
import TokenImage from './TokenImage';
import { getProtocolLabel } from '../lib/tokenlist';
import { BuildingBlock } from '@factordao/tokenlist';
import Link from 'next/link';
import Image from 'next/image';
import { getExplorerUrl } from '../lib/chains';
import { useAppContext } from '../context/AppContext';

// Map of building blocks with their readable names
const BUILDING_BLOCK_NAMES: Partial<Record<BuildingBlock, string>> = {
  [BuildingBlock.BORROW]: 'Borrow',
  [BuildingBlock.DEPOSIT]: 'Deposit',
  [BuildingBlock.STAKE]: 'Stake',
  [BuildingBlock.WITHDRAW]: 'Withdraw',
  [BuildingBlock.LEND]: 'Lend',
  [BuildingBlock.PROVIDE_LIQUIDITY]: 'Provide Liquidity',
  [BuildingBlock.REMOVE_LIQUIDITY]: 'Remove Liquidity',
  [BuildingBlock.REPAY]: 'Repay',
};

interface TokenCardProps {
  token: Token;
  isMobile?: boolean;
}

/**
 * Card component that displays a token with its information
 */
export default function TokenCard({ token, isMobile = false }: TokenCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { state } = useAppContext();
  const { selectedChain } = state;
  
  // Check if the token has tags and building blocks
  const hasTags = token.tags && token.tags.length > 0;
  const hasBuildingBlocks = token.extensions?.buildingBlocks && token.extensions.buildingBlocks.length > 0;
  
  // Extract token details
  const symbol = token.symbol || '';
  const name = token.name || '';
  const protocols = token.extensions?.protocols || [];
  const buildingBlocks = token.extensions?.buildingBlocks || [];
  
  // Get the correct explorer URL for the selected chain
  const explorerLink = getExplorerUrl(selectedChain, token.address);
  
  // Handle click event
  const handleClick = () => {
    if (onClick) {
      onClick(token);
    }
  };

  return (
    <div className={`group rounded-xl overflow-hidden border border-zinc-800 transition-all duration-300 ${isMobile ? 'shadow-md hover:shadow-lg' : 'hover:border-zinc-600'}`}>
      <div className="flex items-center p-4 space-x-3">
        <div className={`relative ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}`}>
          <TokenImage token={token} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold text-white truncate ${isMobile ? 'text-lg' : ''}`}>
              {token.name || token.symbol}
            </h3>
            {isProVault && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-900 text-purple-100">
                Pro Vault
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 truncate">
            {token.symbol}
          </p>
        </div>
      </div>

      <div className={`p-4 pt-0 ${isMobile ? 'pb-5' : ''}`}>
        {/* Protocol badges */}
        {protocols && protocols.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {protocols.map((protocol) => (
              <span
                key={protocol}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-300"
              >
                {protocol}
              </span>
            ))}
          </div>
        )}

        <div className={`mt-3 grid grid-cols-2 gap-2 ${isMobile ? 'text-sm' : 'text-xs'}`}>
          {/* APY display */}
          {apy !== undefined && (
            <div className="bg-zinc-800 rounded p-2">
              <span className="text-zinc-400">APY</span>
              <div className={`font-semibold text-green-400 ${isMobile ? 'text-lg' : ''}`}>
                {apy}%
              </div>
            </div>
          )}

          {/* TVL display */}
          {tvl !== undefined && (
            <div className="bg-zinc-800 rounded p-2">
              <span className="text-zinc-400">TVL</span>
              <div className={`font-semibold text-white ${isMobile ? 'text-lg' : ''}`}>
                {tvl}
              </div>
            </div>
          )}
        </div>

        {/* Card actions */}
        <div className={`mt-3 flex space-x-2 ${isMobile ? 'pt-2' : ''}`}>
          {explorerLink && (
            <a
              href={explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 text-center py-2 rounded-md text-sm ${isMobile ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-blue-400 hover:text-blue-300 bg-zinc-800'}`}
            >
              Explorer
            </a>
          )}
          {token.extensions?.website && (
            <a
              href={token.extensions.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 text-center py-2 rounded-md text-sm ${isMobile ? 'text-white bg-purple-600 hover:bg-purple-700' : 'text-purple-400 hover:text-purple-300 bg-zinc-800'}`}
            >
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
} 