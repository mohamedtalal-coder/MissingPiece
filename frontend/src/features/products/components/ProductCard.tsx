import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../productsApi';
import { useCart } from '../../cart/CartContext';
import { useToast } from '../../../shared/context/ToastContext';
import { Icon } from '../../../shared/components/ui/Icon';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation
    if (product.stock === 0 || isAdding) return;
    
    setIsAdding(true);
    try {
      await addItem(product._id, 1);
      showToast({ message: 'Added to cart successfully', type: 'success' });
    } catch (err) {
      showToast({ message: 'Failed to add item to cart', type: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation
    setIsWishlisted(!isWishlisted);
    const msg = isWishlisted ? 'Removed from wishlist' : 'Added to wishlist';
    showToast({ message: msg, type: 'info' });
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block relative w-full overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
      {/* Image container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
        <img
          src={product.images[0] ?? '/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          className="absolute top-space-sm right-space-sm p-2 rounded-full bg-surface/80 backdrop-blur-md text-on-surface-variant hover:text-error hover:bg-surface transition-colors shadow-sm z-10"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Icon name={isWishlisted ? 'favorite' : 'favorite_border'} className={`text-xl ${isWishlisted ? 'text-error fill-current' : ''}`} />
        </button>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-surface/50 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-surface px-space-md py-space-xs rounded-full font-label-md text-label-md text-on-surface uppercase tracking-wider">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-space-md flex flex-col gap-space-sm bg-surface-container-lowest">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-body-sm text-on-surface-variant truncate capitalize">
            {product.category.replace('-', ' ')}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-space-xs">
          <p className="font-label-lg text-label-lg text-on-surface font-semibold">
            ${product.price.toFixed(2)}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding}
            className={`
              flex items-center justify-center px-space-md py-2 rounded font-label-md text-label-md transition-all duration-200
              ${product.stock === 0 
                ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-60' 
                : 'bg-primary text-on-primary hover:bg-primary/90 active:scale-95 shadow-sm hover:shadow-md'
              }
            `}
          >
            {isAdding ? 'Adding...' : 'Add to cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};
