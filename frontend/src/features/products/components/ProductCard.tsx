import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../productsApi';
import { useCart } from '../../cart/CartContext';
import { useToast } from '../../../shared/context/ToastContext';
import { useWishlist } from '../../../shared/WishlistContext';
import { Icon } from '../../../shared/components/ui/Icon';
import { PriceDisplay } from '../../../shared/components/ui/PriceDisplay';
import { StarRating } from '../../../shared/components/ui/StarRating';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t } = useLanguage() as any;
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const isWishlisted = isInWishlist(product._id || product.slug);
  const imageSrc = product.images?.[0];

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => setIsSuccess(false), 2000);
    return () => clearTimeout(timer);
  }, [isSuccess]);

  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);
  }, [imageSrc]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0 || isAdding) return;

    setIsAdding(true);
    try {
      await addItem(product, 1);
      setIsSuccess(true);
      showToast({ message: 'Added to bag', type: 'success' });
    } catch {
      showToast({ message: 'Could not add to bag', type: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
  };

  return (
    <article
      onClick={() => navigate(`/products/${product.slug}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/products/${product.slug}`);
        }
      }}
      role="link"
      tabIndex={0}
      className="product-card group flex flex-col h-full bg-surface-container-low rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer border border-transparent hover:border-outline-variant/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <div className="relative w-full aspect-[4/5] bg-surface-container-lowest overflow-hidden">
        {!imageLoaded && !imageFailed && <div className="absolute inset-0 animate-shimmer" aria-hidden />}
        {imageSrc && !imageFailed ? (
          <img
            src={imageSrc}
            alt={product.name}
            className={`w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline">
            <Icon name="inventory_2" size={32} />
          </div>
        )}

        <button
          onClick={handleToggleWishlist}
          className={`wishlist-btn absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur flex items-center justify-center transition-transform hover:scale-110 z-10 ${
            isWishlisted
              ? 'bg-surface-container-lowest/80 text-error'
              : 'bg-surface-container-lowest/80 text-on-surface-variant hover:text-primary'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          type="button"
        >
          <Icon
            name={isWishlisted ? 'favorite' : 'favorite_border'}
            size={18}
            fill={isWishlisted ? 'currentColor' : 'none'}
          />
        </button>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-surface/60 flex items-center justify-center z-10">
            <span className="bg-error text-on-error px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest">
              {t.productDetail?.outOfStock || 'Out of Stock'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
            {product.category?.replace(/-/g, ' ')}
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface leading-snug group-hover:text-primary transition-colors mt-0.5 mb-1 truncate">
            {product.name}
          </h3>
          {product.averageRating !== undefined && (
            <StarRating rating={product.averageRating} count={product.reviewCount} />
          )}
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-outline-variant/10 mt-1">
          <PriceDisplay amount={product.price} size="md" />
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding || isSuccess}
            type="button"
            className={`
              add-to-cart-btn px-3.5 py-1.5 rounded font-label-md text-label-md transition-colors flex items-center gap-1.5 shadow-sm
              ${
                product.stock === 0
                  ? 'bg-surface-container-high text-outline cursor-not-allowed'
                  : isSuccess
                    ? 'bg-primary text-on-primary'
                    : 'bg-primary-container text-on-primary-container hover:bg-primary'
              }
            `}
          >
            {isAdding ? (
              <Icon name="refresh" className="animate-spin" size={16} />
            ) : isSuccess ? (
              <Icon name="check" size={16} />
            ) : (
              <Icon name="shopping_bag" size={16} />
            )}
            <span className="hidden sm:inline-block">
              {isSuccess ? t.productCard?.added || 'Added' : t.productCard?.add || 'Add to Cart'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
