import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../shared/context/LanguageContext';
import { Icon } from '../../../shared/components/ui/Icon';
import { SearchInput } from '../../../shared/components/ui/SearchInput';

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
  priceCeiling?: number;
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
  onSortChange,
  priceCeiling = 2000,
}) => {
  const { t } = useLanguage() as any;
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMax(maxPrice);
  }, [maxPrice]);

  // Debounce price only — SearchInput already debounces search
  useEffect(() => {
    const timer = setTimeout(() => {
      onPriceChange(minPrice, localMax);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMax, minPrice]);

  return (
    <section className="bg-surface-container-low rounded-lg p-space-md lg:p-space-lg mb-space-xl shadow-xl flex flex-col gap-space-md relative z-20 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex-1 w-full md:max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={t.productFilters?.search || 'Search puzzles...'}
            debounceMs={300}
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-space-sm w-full md:w-auto justify-start md:justify-end">
          <div className="relative min-w-[160px]">
            <label htmlFor="catalog-category" className="sr-only">
              Category
            </label>
            <select
              id="catalog-category"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full bg-surface-container-high text-on-surface text-label-md px-3.5 py-2.5 rounded appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all pr-9 border border-outline-variant/20"
            >
              <option value="">{t.productFilters?.allCategories || 'All Categories'}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-surface-container-high px-3.5 py-2 rounded border border-outline-variant/20">
            <label htmlFor="catalog-price" className="font-label-caps text-label-caps text-outline uppercase">
              {t.productFilters?.price || 'Price:'}
            </label>
            <input
              id="catalog-price"
              type="range"
              min={0}
              max={priceCeiling}
              value={localMax}
              onChange={(e) => setLocalMax(Number(e.target.value))}
              className="w-20 accent-primary cursor-pointer h-1.5 bg-surface-container-lowest rounded-lg"
            />
            <span className="font-label-md text-label-md text-primary font-mono tabular-nums">
              {t.productFilters?.upTo || 'Up to'} ${localMax}
            </span>
          </div>

          <div className="relative min-w-[170px]">
            <label htmlFor="catalog-sort" className="sr-only">
              Sort
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full bg-surface-container-high text-on-surface text-label-md px-3.5 py-2.5 rounded appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all pr-9 border border-outline-variant/20"
            >
              <option value="newest">{t.productFilters?.newest || 'Newest Arrivals'}</option>
              <option value="price_asc">{t.productFilters?.priceLowToHigh || 'Price: Low to High'}</option>
              <option value="price_desc">{t.productFilters?.priceHighToLow || 'Price: High to Low'}</option>
            </select>
            <Icon
              name="sort"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
