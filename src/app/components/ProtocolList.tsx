import { useState, useEffect } from 'react';
import { Token, Protocol, Action } from '../types/index';
import TokenImage from './TokenImage';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getActionsByTokenAndProtocol } from '../lib/tokenlist';
import ActionList from './ActionList';

interface ProtocolListProps {
  protocols: Protocol[];
  token: Token;
  onSelectProtocol: (protocol: Protocol) => void;
  onSelectAction: (action: Action, token: Token, protocol: Protocol) => void;
}

export default function ProtocolList({ protocols, token, onSelectProtocol, onSelectAction }: ProtocolListProps) {
  const [expandedProtocolId, setExpandedProtocolId] = useState<string | null>(null);
  const [actionsMap, setActionsMap] = useState<Record<string, Action[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const toggleProtocol = (protocolId: string) => {
    setExpandedProtocolId(expandedProtocolId === protocolId ? null : protocolId);
  };

  // Load actions when a protocol is expanded
  useEffect(() => {
    if (!expandedProtocolId) return;
    
    // Skip if we already have the actions for this protocol
    if (actionsMap[expandedProtocolId]) return;
    
    // Set loading state
    setLoading(prev => ({ ...prev, [expandedProtocolId]: true }));
    
    // Fetch actions
    const fetchActions = async () => {
      try {
        const actions = await getActionsByTokenAndProtocol(token.address, expandedProtocolId);
        setActionsMap(prev => ({ ...prev, [expandedProtocolId]: actions }));
      } catch (error) {
        console.error('Failed to load actions:', error);
        setActionsMap(prev => ({ ...prev, [expandedProtocolId]: [] }));
      } finally {
        setLoading(prev => ({ ...prev, [expandedProtocolId]: false }));
      }
    };
    
    fetchActions();
  }, [expandedProtocolId, token.address, actionsMap]);

  return (
    <div className="space-y-2 mt-2">
      {protocols.map(protocol => {
        const isExpanded = expandedProtocolId === protocol.id;
        const actions = isExpanded ? actionsMap[protocol.id] || [] : [];
        const isLoadingActions = loading[protocol.id];
        
        return (
          <div key={protocol.id} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <div
              className="flex items-center p-3 bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                onSelectProtocol(protocol);
                toggleProtocol(protocol.id);
              }}
            >
              <div className="flex-shrink-0 mr-3">
                <TokenImage
                  src={protocol.logoURI}
                  alt={protocol.name}
                  size={32}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium text-gray-900 dark:text-white">
                      {protocol.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {protocol.marketCount || 0} markets
                    </p>
                  </div>

                  {isExpanded ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="pl-8 pr-3 pb-3 pt-1 bg-gray-50 dark:bg-gray-800">
                {isLoadingActions ? (
                  <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Loading actions...
                  </div>
                ) : (
                  <ActionList
                    actions={actions}
                    token={token}
                    protocol={protocol}
                    onSelectAction={(action) => onSelectAction(action, token, protocol)}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 