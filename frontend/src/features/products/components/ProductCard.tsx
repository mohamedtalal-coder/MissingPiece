import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../productsApi';
import { useCart } from '../../cart/CartContext';
import { useToast } from '../../../shared/context/ToastContext';
import { useWishlist } from '../../../shared/WishlistContext';
import { Icon } from '../../../shared/components/ui/Icon';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const isWishlisted = isInWishlist(product._id || product.slug); // fallback for safety

  // Reset success state after a brief moment
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation
    if (product.stock === 0 || isAdding) return;
    
    setIsAdding(true);
    try {
      await addItem(product, 1);
      setIsSuccess(true);
      showToast({ message: 'Added to cart successfully', type: 'success' });
    } catch (err) {
      showToast({ message: 'Failed to add item to cart', type: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation
    await toggleWishlist(product);
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block relative w-full overflow-hidden rounded-2xl bg-purple-950/30 border border-purple-500/10 shadow-lg hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300 backdrop-blur-md">
      {/* Image container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
        <img
          src={product.images?.[0] ?? '/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white/70 hover:text-red-400 hover:bg-black/60 transition-all duration-300 shadow-sm z-10 hover:scale-110 cursor-pointer"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Icon name={isWishlisted ? 'favorite' : 'favorite_border'} className={`text-xl transition-colors ${isWishlisted ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] fill-current' : ''}`} />
        </button>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-red-500/80 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.5)]">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold text-purple-50 truncate group-hover:text-purple-300 transition-colors drop-shadow-sm">
            {product.name}
          </h3>
          <p className="text-sm text-purple-300/60 truncate capitalize mt-0.5">
            {product.category?.replace('-', ' ')}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="text-xl text-purple-100 font-bold tracking-tight">
            ${product.price?.toFixed(2)}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding || isSuccess}
            className={`
              flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 min-w-[110px] shadow-md cursor-pointer
              ${product.stock === 0 
                ? 'bg-purple-900/30 text-purple-300/40 cursor-not-allowed border border-purple-900/50' 
                : isSuccess 
                  ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                  : 'bg-purple-600 text-white hover:bg-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] active:scale-95'
              }
            `}
          >
            {isAdding ? 'Adding...' : isSuccess ? <Icon name="check" className="text-xl drop-shadow-md" /> : 'Add to cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};
