'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

/**
 * Search input component with clear button
 */
export default function SearchInput({
  value,
  onChange,
  onReset,
  placeholder = "Search...",
  className = "",
  autoFocus = false
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  // Handle reset button click
  const handleReset = useCallback(() => {
    setLocalValue('');
    onChange('');
    if (onReset) onReset();
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange, onReset]);

  // Set initial focus on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        className="block w-full rounded-md border-0 py-2 pl-10 pr-10 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 sm:text-sm sm:leading-6 bg-white dark:bg-gray-800"
        placeholder={placeholder}
        aria-label="Search"
      />
      {localValue && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={handleReset}
          aria-label="Clear search"
        >
          <XMarkIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400" />
        </button>
      )}
    </div>
  );
} 