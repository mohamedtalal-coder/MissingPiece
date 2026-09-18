import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../shared/context/LanguageContext';
import { Icon } from '../../../shared/components/ui/Icon';

interface ProductFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  minPrice,
  maxPrice,
  onPriceChange,
  sortBy,
  onSortChange
}) => {
  const { t } = useLanguage() as any;
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Debounce Price
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localMin <= localMax) {
        onPriceChange(localMin, localMax);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localMin, localMax, onPriceChange]);

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Row: Search and Sort */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
          <input 
            type="text" 
            placeholder="Search puzzles..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-md ps-10 pe-4 py-2.5 text-sm md:text-base text-primary placeholder-purple-300/40 focus:outline-none focus:border-border focus:ring-1 focus:ring-purple-400 transition-all shadow-inner"
          />
          {localSearch && (
            <button 
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary transition-colors"
            >
              <Icon name="close" className="text-sm" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto bg-surface border border-border rounded-md px-4 py-2">
          <Icon name="sort" className="text-primary" />
          <select 
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent border-none text-sm font-medium text-primary focus:outline-none cursor-pointer appearance-none [&>option]:bg-background [&>option]:text-primary pe-2"
          >
            <option value="newest">{t.productList?.newest || "Newest Arrivals"}</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Bottom Row: Category Dropdown & Price Slider */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
        
        {/* Category Dropdown */}
        <div className="relative w-full md:w-64" ref={categoryRef}>
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full flex items-center justify-between bg-surface border border-border rounded-md px-4 py-2.5 text-sm text-primary hover:bg-surface transition-colors"
          >
            <span className="truncate">{selectedCategory || 'All Categories'}</span>
            <Icon name={isCategoryOpen ? 'expand_less' : 'expand_more'} className="text-primary flex-shrink-0 ms-2" />
          </button>
          
          {isCategoryOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-background border border-border rounded-md shadow-xl overflow-hidden z-20">
              <button
                onClick={() => { onCategoryChange(''); setIsCategoryOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedCategory === '' ? 'bg-surface text-primary' : 'text-primary hover:bg-surface hover:text-primary'}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { onCategoryChange(cat); setIsCategoryOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors truncate ${selectedCategory === cat ? 'bg-surface text-primary' : 'text-primary hover:bg-surface hover:text-primary'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Slider */}
        <div className="w-full md:w-72 space-y-3 bg-surface px-4 py-3 rounded-md border border-border">
          <div className="flex justify-between items-center text-xs text-primary">
            <span>{t.productList?.priceRange || "Price Range"}</span>
            <span className="font-semibold text-primary">${localMin} - ${localMax}</span>
          </div>
          
          <div className="relative h-1.5 w-full bg-surface rounded-md">
            {/* Active track highlight */}
            <div 
              className="absolute h-full bg-surface rounded-md"
              style={{ 
                left: `${(localMin / 200) * 100}%`, 
                right: `${100 - (localMax / 200) * 100}%` 
              }}
            ></div>
            
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={localMin}
              onChange={(e) => setLocalMin(Math.min(Number(e.target.value), localMax))}
              className="absolute w-full top-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-surface [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-md"
            />
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={localMax}
              onChange={(e) => setLocalMax(Math.max(Number(e.target.value), localMin))}
              className="absolute w-full top-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-surface [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-md"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
