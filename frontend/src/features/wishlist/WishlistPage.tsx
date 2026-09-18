import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../shared/WishlistContext';
import { useCart } from '../cart/CartContext';
import { useToast } from '../../shared/context/ToastContext';
import { Icon } from '../../shared/components/ui/Icon';
import type { Product } from '../products/productsApi';

export function WishlistPage() {
  const { wishlistItems, toggleWishlist, isLoading } = useWishlist();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('recent');

  const filteredItems = useMemo(() => {
    let items = [...wishlistItems];
    if (categoryFilter !== 'all') {
      items = items.filter(item => item.category === categoryFilter);
    }
    
    switch (sortOption) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'recent':
      default:
        // Assume recent is default order (which is preserved by default or reverse if needed, backend sends recent first)
        break;
    }
    return items;
  }, [wishlistItems, categoryFilter, sortOption]);

  const handleRemove = async (product: Product) => {
    await toggleWishlist(product);
    showToast({ message: 'Removed from wishlist', type: 'success' });
  };

  const handleMoveToCart = async (product: Product) => {
    if (product.stock === 0) {
      showToast({ message: 'Item is out of stock', type: 'error' });
      return;
    }
    try {
      await addItem(product, 1);
      await toggleWishlist(product);
      showToast({ message: 'Moved to cart', type: 'success' });
    } catch (err) {
      showToast({ message: 'Failed to move to cart', type: 'error' });
    }
  };

  const handleMoveAllToCart = async () => {
    const availableItems = filteredItems.filter(p => p.stock > 0);
    if (availableItems.length === 0) {
      showToast({ message: 'No available items to move', type: 'error' });
      return;
    }
    
    let movedCount = 0;
    for (const item of availableItems) {
      try {
        await addItem(item, 1);
        await toggleWishlist(item);
        movedCount++;
      } catch (e) {
        console.error("Failed to move item", item);
      }
    }
    showToast({ message: `Moved ${movedCount} item(s) to cart`, type: 'success' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="bg-surface font-body-md text-on-surface min-h-screen pt-20">
      <div className="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin pt-space-lg">
        {/* Wishlist Action Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
          <div>
            <div className="flex items-center gap-space-xs text-primary font-label-caps text-label-caps uppercase tracking-widest mb-1">
              <Icon name="bookmark" className="text-[15px]" />
              <span>Cabinet of Curiosities</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Curated Wishlist & Saved Pieces</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{wishlistItems.length} master-crafted editions saved for future contemplation.</p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap shrink-0">
            <div className="flex items-center bg-surface-container-low rounded px-space-sm py-1 shadow-sm">
              <span className="font-label-caps text-label-caps text-outline uppercase mr-2">Category:</span>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-on-surface font-label-md text-label-md focus:outline-none cursor-pointer py-1 pr-2"
              >
                <option className="bg-surface-container-high text-on-surface" value="all">All Disciplines</option>
                {/* Dynamically generate options based on current wishlist categories */}
                {Array.from(new Set(wishlistItems.map(item => item.category))).map(cat => (
                  <option key={cat} className="bg-surface-container-high text-on-surface" value={cat}>
                    {cat.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center bg-surface-container-low rounded px-space-sm py-1 shadow-sm">
              <span className="font-label-caps text-label-caps text-outline uppercase mr-2">Sort:</span>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent text-on-surface font-label-md text-label-md focus:outline-none cursor-pointer py-1 pr-2"
              >
                <option className="bg-surface-container-high text-on-surface" value="recent">Recently Saved</option>
                <option className="bg-surface-container-high text-on-surface" value="price-asc">Price: Low to High</option>
                <option className="bg-surface-container-high text-on-surface" value="price-desc">Price: High to Low</option>
              </select>
            </div>
            <button 
              onClick={handleMoveAllToCart}
              disabled={filteredItems.length === 0}
              className="h-10 px-space-md bg-primary hover:bg-primary-container text-on-primary transition-all duration-200 font-label-md text-label-md rounded flex items-center gap-space-xs shadow-md disabled:opacity-50"
            >
              <Icon name="shopping_cart_checkout" className="text-[18px]" />
              <span>Move All to Cart ({filteredItems.length})</span>
            </button>
          </div>
        </div>

        {/* Wishlist Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-24 text-center border-t border-outline-variant/30">
            <Icon name="favorite_border" className="text-6xl text-outline mb-space-sm" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">No items found</h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-6">
              {wishlistItems.length === 0 
                ? "Your wishlist is currently empty. Explore our catalog to find pieces you love."
                : "No items match your current filter."}
            </p>
            <Link to="/products" className="inline-block px-8 py-3 bg-primary-container text-on-primary-container rounded font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors">
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md lg:gap-space-lg mb-space-2xl">
            {filteredItems.map(item => (
              <div key={item._id} className="group bg-surface-container-low rounded-xl overflow-hidden shadow-lg flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1">
                <div className="relative w-full aspect-[4/5] bg-surface-container overflow-hidden block">
                  <Link to={`/products/${item.slug}`}>
                    <img 
                      src={item.images?.[0] || '/placeholder.png'} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </Link>
                  <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-md font-label-caps text-[10px] tracking-wider uppercase shadow ${item.stock > 0 ? 'text-primary' : 'text-error'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.stock > 0 ? 'bg-primary' : 'bg-error'}`}></span>
                    <span>{item.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                  <button 
                    onClick={() => handleRemove(item)}
                    aria-label="Remove item" 
                    className="absolute top-3 right-3 w-8 h-8 rounded bg-surface-container-lowest/80 backdrop-blur-md text-on-surface-variant hover:text-error hover:bg-surface-container-lowest flex items-center justify-center transition-colors shadow"
                  >
                    <Icon name="close" className="text-[18px]" />
                  </button>
                </div>
                
                <div className="p-space-md flex flex-col flex-1 justify-between bg-surface-container-low">
                  <div>
                    <div className="flex items-center justify-between text-outline font-label-caps text-label-caps uppercase tracking-wider mb-1">
                      <span>{item.category.replace('-', ' ')}</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors leading-tight">
                      <Link to={`/products/${item.slug}`}>{item.name}</Link>
                    </h3>
                  </div>
                  
                  <div className="mt-space-md pt-space-sm flex flex-col gap-space-sm">
                    <div className="flex items-baseline justify-between">
                      <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Edition Price</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tabular-nums">${item.price.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <button 
                        onClick={() => handleMoveToCart(item)}
                        disabled={item.stock === 0}
                        className="col-span-5 h-10 px-space-sm bg-primary hover:bg-primary-container text-on-primary transition-colors rounded font-label-md text-label-md flex items-center justify-center gap-space-xs font-semibold shadow-sm disabled:opacity-50"
                      >
                        <Icon name="shopping_bag" className="text-[18px]" />
                        <span>Move to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default WishlistPage;