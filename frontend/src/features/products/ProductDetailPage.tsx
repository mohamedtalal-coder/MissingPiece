import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';

export function ProductDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);

  const product = {
    id: Number(id) || 1,
    name: 'Mystic Nebula 1000pcs Jigsaw Puzzle',
    category: 'Jigsaw Puzzles',
    price: 45.0,
    stock: 12,
    description:
      'Immerse yourself in the cosmos with this master-crafted 1000-piece jigsaw puzzle. Featuring high-definition vibrant cosmic imagery, precision-cut wooden pieces, and a satisfying tight fit designed for true puzzle enthusiasts.',
    image:
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
  };

  const handleAddToCart = () => {
    if (product.stock > 0) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] px-8 py-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-card)] border border-[#7e22ce]/40 px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#c084fc]" />
          <span>{t.productDetail.backToCatalog}</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-[var(--bg-card)] border border-[#7e22ce]/40 p-8 rounded-3xl shadow-2xl">
          <div className="w-full h-96 bg-[var(--bg-main)] rounded-2xl overflow-hidden border border-[#7e22ce]/30 relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {product.stock === 0 && (
              <div className="absolute top-4 left-4 bg-red-950/90 border border-red-600/50 text-red-300 text-xs font-bold px-3 py-1 rounded-lg">
                {t.productDetail.outOfStock}
              </div>
            )}
          </div>

          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-[#c084fc] bg-[var(--bg-main)] border border-[#7e22ce]/40 px-3 py-1 rounded-lg">
                {product.category}
              </span>

              <h1 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-main)]">
                {product.name}
              </h1>

              <p className="text-xl font-bold text-[var(--text-main)]">
                ${product.price.toFixed(2)}
              </p>

              <div className="flex items-center gap-2 text-xs">
                {product.stock > 0 ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {t.productDetail.inStock} ({product.stock}{' '}
                    {t.productDetail.available})
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {t.productDetail.outOfStock}
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-2 font-sans">
                {product.description}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#7e22ce]/30">
              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[var(--text-muted)]">
                    {t.productDetail.quantity}:
                  </span>

                  <div className="flex items-center bg-[var(--bg-main)] border border-[#7e22ce]/40 rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        setQuantity(Math.max(1, quantity - 1))
                      }
                      className="px-3 py-1.5 text-[var(--text-main)] hover:bg-[#7e22ce]/30 transition-colors"
                    >
                      -
                    </button>

                    <span className="px-4 text-xs font-bold text-[var(--text-main)]">
                      {quantity}
                    </span>

                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(product.stock, quantity + 1)
                        )
                      }
                      className="px-3 py-1.5 text-[var(--text-main)] hover:bg-[#7e22ce]/30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white rounded-xl text-xs font-semibold shadow-md hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />

                  <span>
                    {addedToCart
                      ? t.productDetail.addedToCart
                      : t.productDetail.addToCart}
                  </span>
                </button>

                <button
                  onClick={() =>
                    setAddedToWishlist(!addedToWishlist)
                  }
                  className={`p-3 rounded-xl border transition-all ${
                    addedToWishlist
                      ? 'bg-pink-950/40 border-pink-500 text-pink-400'
                      : 'bg-[var(--bg-main)] border-[#7e22ce]/40 text-[var(--text-main)] hover:text-pink-400'
                  }`}
                  title={t.productDetail.addToWishlist}
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;