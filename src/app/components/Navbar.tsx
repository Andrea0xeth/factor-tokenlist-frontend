import React from 'react';

/**
 * Componente per la barra di navigazione principale
 */
export default function Navbar() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600 dark:text-blue-400"
          >
            <path
              d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2ZM16 5C22.065 5 27 9.935 27 16C27 22.065 22.065 27 16 27C9.935 27 5 22.065 5 16C5 9.935 9.935 5 16 5ZM10 12V20H14V12H10ZM18 12V20H22V12H18Z"
              fill="currentColor"
            />
          </svg>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Factor DAO</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">TokenList Explorer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a
            href="https://docs.factordao.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Docs
          </a>
          <a
            href="https://github.com/Factor-dao/factor-tokenlist"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
} 