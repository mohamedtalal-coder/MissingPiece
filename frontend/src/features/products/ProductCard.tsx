import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../features/cart/CartContext';

export function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const productId =
    product.id || product._id || product.productId || product.title;
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const currentWishlist = JSON.parse(
      localStorage.getItem('wishlist') || '[]'
    );
    const exists = currentWishlist.some(
      (item: any) =>
        (item.id || item._id || item.productId || item.title) === productId
    );
    setIsWishlisted(exists);
  }, [productId]);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();

    const currentWishlist = JSON.parse(
      localStorage.getItem('wishlist') || '[]'
    );

    const exists = currentWishlist.some(
      (item: any) =>
        (item.id || item._id || item.productId || item.title) === productId
    );

    let updated;
    const standardizedProduct = { ...product, id: productId };

    if (exists) {
      updated = currentWishlist.filter(
        (item: any) =>
          (item.id || item._id || item.productId || item.title) !== productId
      );
      setIsWishlisted(false);
      alert('Removed from wishlist');
    } else {
      updated = [...currentWishlist, standardizedProduct];
      setIsWishlisted(true);
      alert('Added to wishlist successfully!');
    }

    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[#7e22ce]/40 rounded-2xl p-4 space-y-4 shadow-[0_0_20px_rgba(126,34,206,0.15)] flex flex-col justify-between font-sans">
      <div className="space-y-3">
        <div className="relative group overflow-hidden rounded-xl">
          <img
            src={product.image || product.imageUrl || product.img}
            alt={product.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-[var(--bg-main)]/80 border border-[#7e22ce]/50 flex items-center justify-center transition-all cursor-pointer ${
              isWishlisted
                ? 'text-pink-500 bg-pink-500/10'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? 'fill-pink-500' : ''
              }`}
            />
          </button>
        </div>

        <div>
          <Link
            to={`/products/${productId}`}
            className="hover:text-[#c084fc] transition-colors"
          >
            <h3 className="text-[var(--text-main)] font-serif font-bold text-sm line-clamp-1">
              {product.title}
            </h3>
          </Link>

          <p className="text-[#c084fc] font-semibold text-xs mt-1">
            ${Number(product.price || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-[#7e22ce]/20">
        <button
          onClick={(e) => {
            e.preventDefault();
            addToCart(product);
          }}
          className="w-full bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;