import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { productsApi, type Product } from './productsApi';
import { useCart } from '../cart/CartContext';
import { useWishlist } from '../../shared/WishlistContext';
import { useToast } from '../../shared/context/ToastContext';
import { ProductCard } from './components/ProductCard';

export function ProductDetailPage() {
  const { t } = useLanguage() as any;
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const [isSuccessCart, setIsSuccessCart] = useState(false);
  const [isSuccessWishlist, setIsSuccessWishlist] = useState(false);

  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    if (isSuccessCart) {
      const timer = setTimeout(() => setIsSuccessCart(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccessCart]);

  useEffect(() => {
    if (isSuccessWishlist) {
      const timer = setTimeout(() => setIsSuccessWishlist(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isSuccessWishlist]);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      if (!slug) return;
      setIsLoading(true);
      setError(null);
      
      try {
        const fetchedProduct = await productsApi.getBySlug(slug);
        setProduct(fetchedProduct);
        setQuantity(1); // reset quantity on load
        
        // Fetch related products from the same category
        try {
          const relatedData = await productsApi.getAll({ category: fetchedProduct.category, limit: 5 });
          // Filter out the current product and take up to 4
          const filtered = relatedData.items
            .filter(p => p._id !== fetchedProduct._id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        } catch (relatedErr) {
          console.error("Failed to fetch related products", relatedErr);
          setRelatedProducts([]);
        }
        
      } catch (err) {
        setError('Failed to load product details.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductAndRelated();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090614] text-white px-4 py-24 flex items-center justify-center">
        <div className="animate-spin rounded-md h-8 w-8 border-t-2 border-b-2 border-border"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#090614] text-white px-4 py-24 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-6">{error || 'Product not found'}</h2>
        <Link to="/products" className="px-6 py-2.5 bg-surface hover:bg-surfaceHover border border-border text-white rounded-md transition-colors">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product._id || product.slug);

  const handleAddToCart = async () => {
    if (product.stock === 0 || isAddingToCart) return;
    setIsAddingToCart(true);
    try {
      await addItem(product, quantity);
      setIsSuccessCart(true);
      showToast({ message: 'Added to cart successfully', type: 'success' });
    } catch (err) {
      showToast({ message: 'Failed to add item to cart', type: 'error' });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    await toggleWishlist(product);
    setIsSuccessWishlist(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] px-8 py-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <nav>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-card)] border border-border px-4 py-2 rounded-md transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-[#c084fc] rtl:rotate-180" />
            <span>{t.productDetail.backToCatalog}</span>
          </Link>
        </nav>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-[var(--bg-card)] border border-border p-8 rounded-md shadow-2xl items-start">
          <div className="w-full h-96 bg-[var(--bg-main)] rounded-md overflow-hidden border border-border relative">
            <img
              src={product.images?.[0] ?? '/placeholder.png'}
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
              <span className="text-xs font-semibold text-[#c084fc] bg-[var(--bg-main)] border border-border px-3 py-1 rounded-lg">
                {product.category?.replace('-', ' ')}
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

            <div className="space-y-4 pt-4 border-t border-border">
              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[var(--text-muted)]">
                    {t.productDetail.quantity}:
                  </span>

                  <div className="flex items-center bg-[var(--bg-main)] border border-border rounded-md overflow-hidden">
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

              <div className="flex items-center gap-4 pt-2">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart || isSuccessCart}
                  className={`flex-1 py-3.5 rounded-md text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer
                    ${isSuccessCart 
                      ? 'bg-green-500 text-white' 
                      : 'bg-surface hover:bg-surface active:bg-surface text-white active:scale-[0.98]'
                    }
                  `}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {isAddingToCart || isSuccessCart
                      ? t.productDetail.addedToCart
                      : t.productDetail.addToCart}
                  </span>
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`p-3 rounded-md border transition-all ${
                    isWishlisted
                      ? 'bg-pink-950/40 border-pink-500 text-pink-400'
                      : 'bg-[var(--bg-main)] border-border text-[var(--text-main)] hover:text-pink-400'
                  }`}
                  title={isWishlisted ? t.productDetail.addToWishlist : t.productDetail.addToWishlist}

                >
                  <Heart className={`w-5 h-5 transition-transform duration-300 ${isWishlisted ? 'fill-current' : ''} ${isSuccessWishlist ? 'scale-125' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="pt-16 pb-12 border-t border-border">
            <h2 className="text-2xl font-serif font-bold text-[var(--text-main)] mb-8">{t.productDetail?.related || "You May Also Like"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;