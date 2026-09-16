import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { listProducts, listCategories, type Product } from "./productsApi";
import { Input } from "../../shared/components/ui/Input";
import { useDebounce } from "../../shared/hooks/useDebounce";
import { ProductCard } from "./components/ProductCard";
import { Icon } from "../../shared/components/ui/Icon";
import { Select } from "../../shared/components/ui/Select";

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const page = Number(searchParams.get("page") ?? "1");
  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const searchParamValue = searchParams.get("search") ?? "";

  const [searchInput, setSearchInput] = useState(searchParamValue);
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (debouncedSearch !== searchParamValue) {
      updateParam("search", debouncedSearch);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    setSearchInput(searchParamValue);
  }, [searchParamValue]);

  useEffect(() => {
    listCategories()
      .then((res) => setCategories(res))
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listProducts({
      page,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort as "price_asc" | "price_desc" | "newest",
      search: searchParamValue || undefined,
    })
      .then((res) => {
        setItems(res.items);
        setTotalPages(res.totalPages);
        setTotalItems(res.total);
      })
      .catch(() => setError("Could not load products. Please try again later."))
      .finally(() => setLoading(false));
  }, [page, category, minPrice, maxPrice, sort, searchParamValue]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set("page", "1"); // reset pagination on filter change
    setSearchParams(next);
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearAllFilters() {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  }

  const hasActiveFilters = useMemo(() => {
    return Boolean(category || minPrice || maxPrice || searchParamValue || sort !== "newest");
  }, [category, minPrice, maxPrice, searchParamValue, sort]);

  return (
    <div className="w-full bg-surface min-h-screen pb-xl">
      {/* Hero Section */}
      <div className="w-full bg-surface-container-low border-b border-outline-variant/30 py-xl px-gutter relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-40 pointer-events-none bg-gradient-to-l from-primary/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="font-headline text-5xl md:text-6xl text-on-surface mb-space-sm">Catalog</h1>
          <p className="font-body text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Discover our curated collection of premium wooden puzzles and engaging escapes, designed to challenge the mind.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-margin lg:px-margin-lg pt-xl flex flex-col lg:flex-row gap-xl">
        
        {/* Mobile Filter Toggle */}
        <button 
          className="lg:hidden flex items-center justify-center gap-space-sm w-full py-space-sm bg-surface-container border border-outline-variant rounded-lg font-label-lg text-on-surface mb-space-sm"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <Icon name="tune" />
          {isMobileFiltersOpen ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filters Sidebar */}
        <aside className={`lg:w-64 shrink-0 flex flex-col gap-xl ${isMobileFiltersOpen ? 'block' : 'hidden lg:flex'} animate-slide-up`}>
          <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/50">
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <Icon name="filter_list" className="text-xl" /> Filters
            </h2>
            {hasActiveFilters && (
              <button 
                onClick={clearAllFilters}
                className="text-primary hover:text-primary/80 font-label-md text-sm underline transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search */}
          <div className="flex flex-col gap-space-sm">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg" />
              <Input
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-surface-container-lowest"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-space-sm">
            <h3 className="font-label-lg text-label-lg text-on-surface flex items-center justify-between">
              Category
              <Icon name="expand_less" className="text-on-surface-variant" />
            </h3>
            <div className="flex flex-col gap-1 mt-2">
              <button
                onClick={() => updateParam("category", "")}
                className={`text-left px-3 py-2 rounded-md font-body-sm transition-colors ${!category ? 'bg-primary text-on-primary font-medium shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => updateParam("category", c)}
                  className={`text-left px-3 py-2 rounded-md font-body-sm transition-colors flex items-center gap-2 ${category === c ? 'bg-primary text-on-primary font-medium shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  <Icon name="chevron_right" className={`text-sm ${category === c ? 'text-on-primary' : 'text-on-surface-variant/50'}`} />
                  <span className="capitalize">{c.replace('-', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-space-sm">
            <h3 className="font-label-lg text-label-lg text-on-surface flex items-center justify-between">
              Price range
              <Icon name="expand_less" className="text-on-surface-variant" />
            </h3>
            <div className="flex items-center gap-space-sm mt-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm z-10">$</span>
              <Input
                type="number"
                placeholder="10"
                defaultValue={minPrice}
                onBlur={(e) => updateParam("minPrice", e.target.value)}
                className="pl-7 bg-surface-container-lowest text-sm"
              />
              <span className="text-on-surface-variant">-</span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm z-10">$</span>
              <Input
                type="number"
                placeholder="200"
                defaultValue={maxPrice}
                onBlur={(e) => updateParam("maxPrice", e.target.value)}
                className="pl-3 pr-7 bg-surface-container-lowest text-sm text-right"
              />
            </div>
          </div>

        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-[500px]">
          
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-xl animate-fade-in">
            <p className="text-body-md text-on-surface-variant">
              {loading ? (
                <span className="animate-pulse bg-surface-container-high h-5 w-32 rounded inline-block"></span>
              ) : (
                <span className="font-medium text-on-surface">{totalItems} products found</span>
              )}
            </p>

            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-sm text-on-surface-variant bg-surface-container-lowest px-3 py-2 rounded-lg border border-outline-variant/50">
                <span className="text-sm font-medium">Sort by:</span>
              <Select
                value={sort}
                onChange={(v) => updateParam("sort", v)}
                options={[
                  { value: "newest", label: "Newest" },
                  { value: "price_asc", label: "Price: Low to High" },
                  { value: "price_desc", label: "Price: High to Low" },
                ]}
                className="w-48"
              />
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center flex-1 bg-surface-container-lowest rounded-2xl border border-error/20 p-xl text-center">
              <Icon name="error_outline" className="text-5xl text-error mb-space-md" />
              <h3 className="font-headline-sm text-xl text-on-surface mb-space-sm">Oops! Something went wrong</h3>
              <p className="text-on-surface-variant mb-space-lg max-w-md">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-primary text-on-primary px-space-lg py-2 rounded-md font-label-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 bg-surface-container-lowest/50 rounded-2xl border border-outline-variant/30 p-xl text-center">
              <Icon name="inventory_2" className="text-6xl text-outline-variant mb-space-md" />
              <h3 className="font-headline-sm text-2xl text-on-surface mb-space-sm">No products found</h3>
              <p className="text-on-surface-variant mb-space-lg max-w-md">
                We couldn't find any products matching your current filters. Try adjusting your search or category.
              </p>
              {hasActiveFilters && (
                <button 
                  onClick={clearAllFilters}
                  className="bg-surface-container-high text-on-surface px-space-lg py-2 rounded-md font-label-md hover:bg-surface-container-highest transition-colors border border-outline-variant"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Product Grid / Loading Skeletons */}
          {(!error && (loading || items.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-space-lg gap-y-xl animate-slide-up">
              {loading ? (
                // Skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-space-sm animate-pulse-slow">
                    <div className="aspect-[4/5] bg-surface-container-high rounded-xl"></div>
                    <div className="h-6 bg-surface-container-high rounded w-3/4 mt-2"></div>
                    <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="h-6 bg-surface-container-high rounded w-1/4"></div>
                      <div className="h-8 bg-surface-container-high rounded w-1/3"></div>
                    </div>
                  </div>
                ))
              ) : (
                // Actual Products
                items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-space-md mt-24 mb-xl border-t border-outline-variant/30 pt-xl">
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                aria-label="Previous Page"
              >
                <Icon name="chevron_left" />
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  // Show current page, first, last, and neighbors
                  if (p === 1 || p === totalPages || Math.abs(page - p) <= 1) {
                    return (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-label-md transition-colors ${
                          page === p 
                            ? 'bg-primary text-on-primary shadow-md' 
                            : 'text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (Math.abs(page - p) === 2) {
                    return <span key={p} className="text-on-surface-variant">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                className="w-10 h-10 rounded-full flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                aria-label="Next Page"
              >
                <Icon name="chevron_right" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
