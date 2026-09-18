import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../shared/WishlistContext';
import { useCart } from '../cart/CartContext';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Icon } from '../../shared/components/ui/Icon';
import { Button } from '../../shared/components/ui/Button';
import { Spinner } from '../../shared/components/ui/Spinner';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { PriceDisplay } from '../../shared/components/ui/PriceDisplay';
import { Motion } from '../../shared/components/ui/Motion';
import { useReducedMotion } from '../../shared/hooks/useReducedMotion';
import type { Product } from '../products/productsApi';

type PendingAction = 'remove' | 'move';

function WishlistCardSkeleton() {
  return (
    <div
      className="flex flex-col bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/20 shadow-lg"
      aria-hidden
    >
      <div className="aspect-[4/5] w-full animate-shimmer" />
      <div className="p-space-md flex flex-col gap-space-sm">
        <div className="h-3 w-1/3 rounded animate-shimmer" />
        <div className="h-5 w-3/4 rounded animate-shimmer" />
        <div className="flex items-center justify-between pt-space-sm mt-space-sm border-t border-outline-variant/10">
          <div className="h-4 w-1/4 rounded animate-shimmer" />
          <div className="h-8 w-full rounded animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

interface WishlistItemCardProps {
  item: Product;
  pendingAction: PendingAction | null;
  onRemove: (product: Product) => void;
  onMoveToCart: (product: Product) => void;
  t: Record<string, any>;
}

function WishlistItemCard({ item, pendingAction, onRemove, onMoveToCart, t }: WishlistItemCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = item.images?.[0];
  const isPending = pendingAction !== null;

  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);
  }, [imageSrc]);

  return (
    <article className="group relative bg-surface-container-low rounded-xl overflow-hidden shadow-lg flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 border border-transparent hover:border-outline-variant/30">
      {isPending && (
        <div
          className="absolute inset-0 z-20 bg-surface/70 backdrop-blur-[2px] flex items-center justify-center rounded-xl"
          aria-live="polite"
          aria-busy="true"
        >
          <Spinner size="md" />
        </div>
      )}

      <div className="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
        <Link to={`/products/${item.slug}`} className="block w-full h-full" tabIndex={isPending ? -1 : 0}>
          {!imageLoaded && !imageFailed && (
            <div className="absolute inset-0 animate-shimmer" aria-hidden />
          )}
          {imageSrc && !imageFailed ? (
            <img
              src={imageSrc}
              alt={item.name}
              className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-outline bg-surface-container-lowest">
              <Icon name="inventory_2" size={32} />
            </div>
          )}
        </Link>

        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-md font-label-caps text-[10px] tracking-wider uppercase shadow ${
            item.stock > 0 ? 'text-primary' : 'text-error'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${item.stock > 0 ? 'bg-primary' : 'bg-error'}`} />
          <span>
            {item.stock > 0
              ? t.productDetail?.inStock || 'In Stock'
              : t.productDetail?.outOfStock || 'Out of Stock'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item)}
          disabled={isPending}
          aria-label="Remove from wishlist"
          className="absolute top-3 right-3 w-8 h-8 rounded bg-surface-container-lowest/80 backdrop-blur-md text-on-surface-variant hover:text-error hover:bg-surface-container-lowest flex items-center justify-center transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>

      <div className="p-space-md flex flex-col flex-1 justify-between bg-surface-container-low">
        <div>
          <div className="font-label-caps text-label-caps text-outline uppercase tracking-wider mb-1">
            {item.category?.replace(/-/g, ' ')}
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors leading-tight">
            <Link to={`/products/${item.slug}`} tabIndex={isPending ? -1 : 0}>
              {item.name}
            </Link>
          </h3>
        </div>

        <div className="mt-space-md pt-space-sm flex flex-col gap-space-sm border-t border-outline-variant/10">
          <div className="flex items-baseline justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
              {t.wishlist?.price || 'Edition Price'}
            </span>
            <PriceDisplay amount={item.price} size="md" className="font-headline-sm" />
          </div>
          <Button
            onClick={() => onMoveToCart(item)}
            disabled={item.stock === 0 || isPending}
            icon="shopping_bag"
            className="w-full"
          >
            {t.wishlist?.moveToCart || 'Move to Cart'}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function WishlistPage() {
  const { wishlistItems, toggleWishlist, isLoading } = useWishlist();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage() as any;
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('recent');
  const [pendingItems, setPendingItems] = useState<Record<string, PendingAction>>({});
  const [isMovingAll, setIsMovingAll] = useState(false);

  const filteredItems = useMemo(() => {
    let items = [...wishlistItems];
    if (categoryFilter !== 'all') {
      items = items.filter((item) => item.category === categoryFilter);
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
        break;
    }
    return items;
  }, [wishlistItems, categoryFilter, sortOption]);

  const categories = useMemo(
    () => Array.from(new Set(wishlistItems.map((item) => item.category).filter(Boolean))),
    [wishlistItems]
  );

  const setPending = (id: string, action: PendingAction | null) => {
    setPendingItems((prev) => {
      const next = { ...prev };
      if (action === null) {
        delete next[id];
      } else {
        next[id] = action;
      }
      return next;
    });
  };

  const handleRemove = async (product: Product) => {
    const id = product._id;
    if (pendingItems[id]) return;

    setPending(id, 'remove');
    try {
      await toggleWishlist(product);
      showToast({ message: 'Removed from wishlist', type: 'success' });
    } catch {
      showToast({ message: 'Failed to remove from wishlist', type: 'error' });
    } finally {
      setPending(id, null);
    }
  };

  const handleMoveToCart = async (product: Product) => {
    const id = product._id;
    if (pendingItems[id]) return;

    if (product.stock === 0) {
      showToast({ message: 'Item is out of stock', type: 'error' });
      return;
    }

    setPending(id, 'move');
    try {
      await addItem(product, 1);
      await toggleWishlist(product);
      showToast({ message: 'Moved to cart', type: 'success' });
    } catch {
      showToast({ message: 'Failed to move to cart', type: 'error' });
    } finally {
      setPending(id, null);
    }
  };

  const handleMoveAllToCart = async () => {
    const availableItems = filteredItems.filter((p) => p.stock > 0);
    if (availableItems.length === 0) {
      showToast({ message: 'No available items to move', type: 'error' });
      return;
    }

    setIsMovingAll(true);
    let movedCount = 0;

    for (const item of availableItems) {
      if (pendingItems[item._id]) continue;
      setPending(item._id, 'move');
      try {
        await addItem(item, 1);
        await toggleWishlist(item);
        movedCount++;
      } catch {
        showToast({ message: `Failed to move ${item.name}`, type: 'error' });
      } finally {
        setPending(item._id, null);
      }
    }

    setIsMovingAll(false);
    if (movedCount > 0) {
      showToast({ message: `Moved ${movedCount} item(s) to cart`, type: 'success' });
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="bg-surface font-body-md text-on-surface min-h-screen">
        <div className="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin pt-space-lg pb-space-2xl">
          <EmptyState
            icon="lock"
            title={t.wishlist?.loginTitle || 'Sign in to view your wishlist'}
            description={
              t.wishlist?.loginDesc ||
              'Your curated collection is saved to your account. Sign in to browse saved editions and move them to your bag.'
            }
            actionText={t.wishlist?.loginAction || 'Sign In'}
            onAction={() => navigate('/login', { state: { from: '/wishlist' } })}
          />
          <p className="text-center mt-space-md font-body-md text-on-surface-variant">
            {t.wishlist?.noAccount || 'New to the atelier?'}{' '}
            <Link to="/register" className="text-primary hover:underline font-label-md">
              {t.wishlist?.createAccount || 'Create an account'}
            </Link>
          </p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="bg-surface font-body-md text-on-surface min-h-screen">
        <div className="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin pt-space-lg pb-space-2xl">
          <div className="mb-space-lg space-y-2">
            <div className="h-4 w-40 rounded animate-shimmer" />
            <div className="h-10 w-72 max-w-full rounded animate-shimmer" />
            <div className="h-4 w-56 rounded animate-shimmer" />
          </div>
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md lg:gap-space-lg"
            aria-busy="true"
            aria-label="Loading wishlist"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <WishlistCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-surface font-body-md text-on-surface min-h-screen">
      <div className="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin pt-space-lg pb-space-2xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
          <div>
            <div className="flex items-center gap-space-xs text-primary font-label-caps text-label-caps uppercase tracking-widest mb-1">
              <Icon name="bookmark" size={15} />
              <span>{t.wishlist?.subtitle || 'Cabinet of Curiosities'}</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              {t.wishlist?.title || 'Curated Wishlist & Saved Pieces'}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {wishlistItems.length}{' '}
              {t.wishlist?.itemsSaved || 'master-crafted editions saved for future contemplation.'}
            </p>
          </div>

          <div className="flex items-center gap-space-sm flex-wrap shrink-0">
            <div className="flex items-center bg-surface-container-low rounded px-space-sm py-1 shadow-sm border border-outline-variant/20">
              <span className="font-label-caps text-label-caps text-outline uppercase mr-2">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                disabled={isMovingAll}
                className="bg-transparent text-on-surface font-label-md text-label-md focus:outline-none cursor-pointer py-1 pr-2 disabled:opacity-50"
              >
                <option className="bg-surface-container-high text-on-surface" value="all">
                  All Disciplines
                </option>
                {categories.map((cat) => (
                  <option key={cat} className="bg-surface-container-high text-on-surface" value={cat}>
                    {cat.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-surface-container-low rounded px-space-sm py-1 shadow-sm border border-outline-variant/20">
              <span className="font-label-caps text-label-caps text-outline uppercase mr-2">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                disabled={isMovingAll}
                className="bg-transparent text-on-surface font-label-md text-label-md focus:outline-none cursor-pointer py-1 pr-2 disabled:opacity-50"
              >
                <option className="bg-surface-container-high text-on-surface" value="recent">
                  Recently Saved
                </option>
                <option className="bg-surface-container-high text-on-surface" value="price-asc">
                  Price: Low to High
                </option>
                <option className="bg-surface-container-high text-on-surface" value="price-desc">
                  Price: High to Low
                </option>
              </select>
            </div>

            <Button
              onClick={handleMoveAllToCart}
              disabled={filteredItems.length === 0 || isMovingAll}
              isLoading={isMovingAll}
              icon="shopping_cart_checkout"
            >
              {t.wishlist?.moveAllToCart || 'Move All to Cart'} ({filteredItems.length})
            </Button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            icon="favorite_border"
            title={
              wishlistItems.length === 0
                ? t.wishlist?.emptyTitle || 'Your wishlist is empty'
                : t.wishlist?.noMatchTitle || 'No items match your filter'
            }
            description={
              wishlistItems.length === 0
                ? t.wishlist?.emptyDesc ||
                  'Explore our catalog to discover master-crafted editions worth saving.'
                : t.wishlist?.noMatchDesc || 'Try a different category or reset your filters.'
            }
            actionText={t.wishlist?.explore || 'Explore Catalog'}
            onAction={() => navigate('/products')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md lg:gap-space-lg">
            {filteredItems.map((item, index) => (
              <Motion
                key={item._id}
                delayMs={reducedMotion ? 0 : Math.min(index, 11) * 55}
                className="h-full"
              >
                <WishlistItemCard
                  item={item}
                  pendingAction={pendingItems[item._id] ?? null}
                  onRemove={handleRemove}
                  onMoveToCart={handleMoveToCart}
                  t={t}
                />
              </Motion>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default WishlistPage;
