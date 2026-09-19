import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className = '',
  autoFocus = false,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceMs);
  const initialMount = useRef(true);

  // Update local value if parent value changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Notify parent only when debounced value changes (skip initial mount)
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    onChange(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <Icon 
        name="search" 
        className="absolute start-space-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" 
        size={18}
      />
      
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-surface-container-lowest border-b border-outline-variant/30 py-3 ps-10 pe-10 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
      />
      
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute end-space-sm top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Clear search"
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
};
