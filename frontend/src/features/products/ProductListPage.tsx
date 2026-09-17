import { useState, useEffect, useCallback } from 'react';
import { productsApi } from './productsApi';
import type { Product } from './productsApi';
import { ProductCard } from './components/ProductCard';
import { ProductFilters } from './components/ProductFilters';
import { ProductCardSkeleton } from './components/ProductCardSkeleton';
import { Icon } from '../../shared/components/ui/Icon';
import { useLanguage } from '../../shared/context/LanguageContext';

export function ProductListPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);
  const [sortBy, setSortBy] = useState('newest');

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const cats = await productsApi.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const fetchProducts = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsApi.getAll({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        minPrice,
        maxPrice,
        sort: sortBy as any
      }, signal);
      setProducts(data.items);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') return;
      setError("The pieces couldn't be found. Please try again.");
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] px-4 md:px-8 py-12 space-y-12 font-sans">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-6 text-center">
        <h1 className="text-4xl md:text-6xl font-serif font-extrabold tracking-tight text-[var(--text-main)] drop-shadow-sm">
          {t.productList.title}
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto font-light leading-relaxed">
          {t.productList.description}
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto bg-[var(--bg-card)] border border-[#7e22ce]/40 rounded-2xl p-6 md:p-8 shadow-xl">
        <ProductFilters 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={(min, max) => { setMinPrice(min); setMaxPrice(max); }}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {/* Grid Area */}
      <div className="max-w-7xl mx-auto min-h-[50vh]">
        {error ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center bg-[var(--bg-card)] border border-red-500/30 rounded-2xl">
            <Icon name="error_outline" className="text-6xl text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]" />
            <h3 className="text-2xl font-semibold text-[var(--text-main)]">{error}</h3>
            <button 
              onClick={() => fetchProducts()}
              className="mt-6 px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(147,51,234,0.4)] font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center bg-[var(--bg-card)] border border-[#7e22ce]/30 rounded-2xl">
            <Icon name="search_off" className="text-6xl text-[var(--text-muted)]" />
            <h3 className="text-2xl font-semibold text-[var(--text-main)]">{t.productList.noProducts}</h3>
            <p className="text-lg text-[var(--text-muted)]">Try adjusting your filters or search term.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setMinPrice(0);
                setMaxPrice(200);
              }}
              className="mt-6 px-8 py-3 border-2 border-purple-500/30 text-[var(--text-main)] rounded-full hover:bg-[#7e22ce]/20 hover:border-purple-400 transition-all duration-300 font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductListPage;