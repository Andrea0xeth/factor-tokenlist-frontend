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
import { useWindowSize } from '@/app/hooks/useWindowSize';

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
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;
  
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

  // Function to copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // You could add a toast notification here
        console.log('Address copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy address: ', err);
      });
  };

  return (
    <div
      className={`bg-[#2C3156] rounded-lg p-4 transition-all duration-300 
        ${isMobile ? 'w-full' : 'max-w-sm'} 
        hover:shadow-lg hover:shadow-[#4A5387]/30 hover:scale-[1.02] h-full flex flex-col`}
    >
      <div className="flex items-center mb-4">
        <div className="flex items-center mr-4">
          <TokenImage
            chainId={token.chainId}
            address={token.address}
            symbol={token.symbol}
            width={isMobile ? 36 : 32}
            height={isMobile ? 36 : 32}
          />
          <div className="ml-3">
            <div className={`font-medium ${isMobile ? 'text-lg' : 'text-md'}`}>{symbol}</div>
            <div className="text-[#B8BCD8] text-sm truncate max-w-[140px]">{name}</div>
          </div>
        </div>
      </div>

      <div className="mt-2 mb-4 space-y-2">
        {/* Building Blocks */}
        {buildingBlocks.length > 0 && (
          <div>
            <div className="text-[#B8BCD8] text-xs mb-1">Building Blocks</div>
            <div className="flex flex-wrap gap-2">
              {buildingBlocks.map((block) => (
                <span
                  key={block}
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                  ${isMobile ? 'text-sm py-1.5' : 'text-xs py-1'} 
                  bg-[#4A5387] text-white`}
                >
                  {block}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Protocols */}
        {protocols.length > 0 && (
          <div>
            <div className="text-[#B8BCD8] text-xs mb-1">Protocols</div>
            <div className="flex flex-wrap gap-2">
              {protocols.map((protocol) => (
                <span
                  key={protocol}
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                  ${isMobile ? 'text-sm py-1.5' : 'text-xs py-1'} 
                  bg-[#4A5387] text-white`}
                >
                  {protocol}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-[#4A5387] flex justify-between items-center">
        <button
          onClick={() => copyToClipboard(token.address)}
          className="text-[#B8BCD8] hover:text-white text-xs flex items-center"
        >
          <span className={`truncate ${isMobile ? 'max-w-[120px]' : 'max-w-[100px]'}`}>{token.address}</span>
          <span className="ml-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </span>
        </button>
        
        <a
          href={explorerLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-white bg-[#4A5387] ${isMobile ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'} rounded flex items-center hover:bg-[#5A63A7]`}
        >
          <span>View in Explorer</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
} 