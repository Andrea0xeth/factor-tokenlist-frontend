import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { ChainId } from '@factordao/tokenlist';
import { SUPPORTED_CHAIN_IDS } from '../lib/tokenlist';
import { getChainName, getChainColor } from '../lib/chains';

interface ChainSelectorProps {
  selectedChain: ChainId;
  onChainChange: (chainId: ChainId) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Componente per selezionare la blockchain da visualizzare
 */
export default function ChainSelector({
  selectedChain,
  onChainChange,
  disabled = false,
  className = ''
}: ChainSelectorProps) {
  return (
    <div className={`w-full max-w-xs ${className}`}>
      <Listbox value={selectedChain} onChange={onChainChange} disabled={disabled}>
        <div className="relative mt-1">
          <Listbox.Button 
            className="relative w-full min-w-[150px] cursor-default rounded-md bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 sm:text-sm"
            disabled={disabled}
          >
            <ChainBadge chainId={selectedChain} />
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {SUPPORTED_CHAIN_IDS.map((chainId) => (
                <Listbox.Option
                  key={chainId}
                  value={chainId}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <ChainBadge chainId={chainId} />
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

// Componente per mostrare il badge della chain con il colore corrispondente
function ChainBadge({ chainId }: { chainId: ChainId }) {
  const chainName = getChainName(chainId);
  const chainColor = getChainColor(chainId);
  
  return (
    <div className="flex items-center">
      <span
        className="inline-block h-3 w-3 rounded-full mr-2 flex-shrink-0"
        style={{ backgroundColor: chainColor }}
        aria-hidden="true"
      />
      <span className="block truncate">{chainName}</span>
    </div>
  );
} 