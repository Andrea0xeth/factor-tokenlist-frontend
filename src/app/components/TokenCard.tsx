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
  isSelected?: boolean;
  onClick?: (token: Token) => void;
}

/**
 * Card component that displays a token with its information
 */
export default function TokenCard({ token, isSelected = false, onClick }: TokenCardProps) {
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
    <div
      className={`rounded-lg overflow-hidden border transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        {/* Card header with token image and symbol */}
        <div className="flex items-center mb-3">
          <TokenImage
            src={token.logoURI}
            alt={token.symbol}
            address={token.address}
            size={32}
            className="mr-3"
          />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {symbol}
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
              {token.chainId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Address
            </span>
            <a 
              href={getExplorerUrl(selectedChain, token.address)}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-mono text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate max-w-[180px]"
              onClick={(e) => e.stopPropagation()}
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
                  {getProtocolLabel(protocol)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Token building blocks */}
        {hasBuildingBlocks && (
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
                  {BUILDING_BLOCK_NAMES[block as BuildingBlock] || block}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Token tags */}
        {hasTags && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Tags
            </h4>
            <div className="flex flex-wrap gap-1">
              {token.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Block Explorer Link */}
        {explorerLink && (
          <Link 
            href={explorerLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2"
          >
            View on Block Explorer
          </Link>
        )}
      </div>
    </div>
  );
} 