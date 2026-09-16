import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  triggerClassName?: string;
}

export function Select({ value, onChange, options, className = "", triggerClassName = "" }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full bg-surface-container-lowest px-3 py-2 rounded-lg border ${isOpen ? 'border-primary' : 'border-outline-variant/50'} focus:outline-none focus:border-primary transition-colors text-sm font-semibold text-on-surface gap-2 ${triggerClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption?.label}</span>
        <Icon name={isOpen ? "expand_less" : "expand_more"} className="text-on-surface-variant pointer-events-none" />
      </button>

      {isOpen && (
        <ul
          className="absolute z-50 w-full min-w-[160px] right-0 mt-1 bg-surface-container-lowest border border-outline-variant/50 rounded-lg shadow-lg max-h-60 overflow-auto animate-fade-in"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                value === option.value
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
