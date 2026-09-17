import { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  const loadWishlist = () => {
    const items = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistItems(items);
  };

  useEffect(() => {
    loadWishlist();
    window.addEventListener('storage', loadWishlist);
    return () => window.removeEventListener('storage', loadWishlist);
  }, []);

  const handleRemove = (id: any) => {
    const updated = wishlistItems.filter((item: any) => (item.id || item._id || item.title) !== id);
    setWishlistItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const handleMoveToCart = (product: any) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const productId = product.id || product._id || product.title;
    const existingIndex = currentCart.findIndex((item: any) => (item.id || item._id || item.title) === productId);

    let updatedCart;
    if (existingIndex > -1) {
      currentCart[existingIndex].qty = (currentCart[existingIndex].qty || 1) + 1;
      updatedCart = [...currentCart];
    } else {
      updatedCart = [...currentCart, { ...product, id: productId, qty: 1 }];
    }

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    handleRemove(productId);
    alert(`Moved "${product.title}" to cart successfully!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 font-sans space-y-8 text-white">
      <div className="flex items-center gap-3 border-b border-[#7e22ce]/30 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#130e21] border border-[#7e22ce]/50 flex items-center justify-center shadow-[0_0_15px_rgba(126,34,206,0.3)]">
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold">My Wishlist</h1>
          <p className="text-xs text-[#cbd5e1]">Manage your favorite luxury puzzle items</p>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-16 bg-[#130e21] border border-[#7e22ce]/40 rounded-3xl space-y-4">
          <p className="text-sm text-[#cbd5e1]">Your wishlist is currently empty.</p>
          <Link to="/products" className="inline-block bg-[#7e22ce] text-white text-xs px-6 py-3 rounded-xl font-semibold shadow-[0_0_15px_rgba(126,34,206,0.4)]">
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wishlistItems.map((product) => {
            const prodId = product.id || product._id || product.title;
            return (
              <div key={prodId} className="bg-[#130e21] border border-[#7e22ce]/40 rounded-2xl p-4 space-y-4 shadow-[0_0_20px_rgba(126,34,206,0.15)] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-xl">
                    <img src={product.image || product.imageUrl || product.img} alt={product.title} className="w-full h-48 object-cover" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm line-clamp-1">{product.title}</h3>
                    <p className="text-[#c084fc] font-semibold text-xs mt-1">${Number(product.price || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#7e22ce]/20">
                  <button 
                    onClick={() => handleMoveToCart(product)}
                    className="flex-1 bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>
                  <button 
                    onClick={() => handleRemove(prodId)}
                    className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;