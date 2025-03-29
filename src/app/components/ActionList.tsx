import { Token, Protocol, Action } from '../types/index';

interface ActionListProps {
  actions: Action[];
  token: Token;
  protocol: Protocol;
  onSelectAction: (action: Action) => void;
}

export default function ActionList({ actions, token, protocol, onSelectAction }: ActionListProps) {
  if (actions.length === 0) {
    return (
      <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
        No actions available for {token.symbol} on {protocol.name}
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      {actions.map(action => (
        <div
          key={`${action.id}-${action.protocolId}-${action.tokenAddress}`}
          className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          onClick={() => onSelectAction(action)}
        >
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {action.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {token.symbol}
            </div>
          </div>
          
          {action.apy !== undefined && (
            <div className="text-sm font-medium text-green-600 dark:text-green-400">
              {action.apy}% APY
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 