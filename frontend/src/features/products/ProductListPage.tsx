import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from './productsApi';
import type { Product } from './productsApi';
import { ProductCard } from './components/ProductCard';
import { ProductFilters } from './components/ProductFilters';
import { ProductCardSkeleton } from './components/ProductCardSkeleton';
import { Icon } from '../../shared/components/ui/Icon';
import { Motion } from '../../shared/components/ui/Motion';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Pagination } from '../../shared/components/ui/Pagination';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { useReducedMotion } from '../../shared/hooks/useReducedMotion';

const DEFAULT_MAX_PRICE = 2000;

export function ProductListPage() {
  const { t } = useLanguage() as any;
  const [searchParams, setSearchParams] = useSearchParams();
  const reducedMotion = useReducedMotion();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateParams = (newParams: Record<string, string | null>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        updated.delete(key);
      } else {
        updated.set(key, value);
      }
    });
    if (!('page' in newParams) && updated.has('page')) {
      updated.delete('page');
    }
    setSearchParams(updated);
  };

  const fetchCategories = async () => {
    try {
      const cats = await productsApi.getCategories();
      setCategories(cats);
    } catch {
      // Categories are non-critical; filters still work without them
    }
  };

  const fetchProducts = useCallback(
    async (signal?: AbortSignal) => {
      const hasExisting = products.length > 0;
      if (hasExisting) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      try {
        const data = await productsApi.getAll(
          {
            search: searchTerm || undefined,
            category: selectedCategory || undefined,
            minPrice,
            maxPrice,
            sort: sortBy as 'price_asc' | 'price_desc' | 'newest',
            page,
            limit: 12,
          },
          signal
        );
        setProducts(data.items);
        setTotalPages(data.totalPages);
      } catch (err: unknown) {
        const e = err as { name?: string; code?: string };
        if (e.name === 'CanceledError' || e.name === 'AbortError' || e.code === 'ERR_CANCELED') return;
        setError(t.productList?.fetchError || "The pieces couldn't be found. Please try again.");
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    // products.length intentionally omitted — only gate first vs refresh UI
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchTerm, selectedCategory, minPrice, maxPrice, sortBy, page, t.productList?.fetchError]
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  return (
    <div className="w-full flex flex-col relative overflow-hidden">
      <div
        className="absolute -top-40 start-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none rounded-full"
        aria-hidden
      />

      <div className="max-w-[1360px] mx-auto w-full px-margin-mobile lg:px-margin pt-space-md pb-space-2xl">
        <section className={`flex flex-col gap-space-sm pb-space-lg relative z-10 ${reducedMotion ? '' : 'animate-slide-up'}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mt-space-xs">
            <div>
              <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight font-medium">
                {t.productList?.heroTitle || 'Master Puzzle Collection'}
              </h1>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md pb-1.5">
              {t.productList?.heroDesc || 'Architectural joinery, heirloom walnut grains, and micro-precision laser die-cuts for contemplative focus.'}
            </p>
          </div>
        </section>

        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => updateParams({ category: cat })}
          searchTerm={searchTerm}
          onSearchChange={(term) => updateParams({ search: term })}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={(min, max) => {
            setMinPrice(min);
            setMaxPrice(max);
          }}
          sortBy={sortBy}
          onSortChange={(sort) => updateParams({ sort })}
          priceCeiling={DEFAULT_MAX_PRICE}
        />

        {error ? (
          <div className="flex flex-col items-center justify-center py-space-2xl space-y-4 text-center bg-surface-container-low border border-error/30 rounded-xl animate-fade-in">
            <Icon name="error_outline" className="text-6xl text-error" />
            <h2 className="font-headline-md text-headline-md text-on-surface">{error}</h2>
            <button
              type="button"
              onClick={() => fetchProducts()}
              className="mt-6 px-space-xl py-3 bg-primary-container hover:bg-primary text-on-primary-container rounded font-semibold transition-colors"
            >
              {t.productList?.tryAgain || 'Try Again'}
            </button>
          </div>
        ) : isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md lg:gap-space-lg relative z-10"
            aria-busy="true"
            aria-label="Loading products"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon="search_off"
            title={t.productList?.noProducts || 'No Editions Found'}
            description={t.productList?.noProductsDesc || 'Try adjusting your filters or search term.'}
            actionText={t.productList?.clearFilters || 'Clear Filters'}
            onAction={() => {
              updateParams({ search: null, category: null, sort: null, page: null });
              setMinPrice(0);
              setMaxPrice(DEFAULT_MAX_PRICE);
            }}
          />
        ) : (
          <>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md lg:gap-space-lg relative z-10 transition-opacity duration-300 ${
                isRefreshing ? 'opacity-60 pointer-events-none' : 'opacity-100'
              }`}
            >
              {products.map((product, i) => (
                <Motion key={product._id} delayMs={reducedMotion ? 0 : Math.min(i, 11) * 45} className="h-full">
                  <ProductCard product={product} />
                </Motion>
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => updateParams({ page: p.toString() })}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default ProductListPage;
