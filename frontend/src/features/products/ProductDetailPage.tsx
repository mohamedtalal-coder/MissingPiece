import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { productsApi, type Product } from './productsApi';
import { useCart } from '../cart/CartContext';
import { useWishlist } from '../../shared/WishlistContext';
import { useToast } from '../../shared/context/ToastContext';
import { ProductCard } from './components/ProductCard';

export function ProductDetailPage() {
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#090614] text-white px-4 py-24 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-6">{error || 'Product not found'}</h2>
        <Link to="/products" className="px-6 py-2.5 bg-[#1a1433] hover:bg-[#231a42] border border-purple-500/20 text-white rounded-md transition-colors">
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
    <div className="min-h-screen bg-[#090614] text-white">
      
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-16">
        
        {/* Navigation Breadcrumb */}
        <nav>
          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-purple-300/70 hover:text-purple-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </Link>
        </nav>

        {/* Main Product Section (Two-Column) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          
          {/* Left: Image */}
          <div className="w-full bg-[#110c22] rounded-lg overflow-hidden border border-purple-500/10">
            <div className="aspect-square md:aspect-[4/5] relative bg-black/20">
              <img 
                src={product.images?.[0] ?? '/placeholder.png'} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>

          {/* Right: Information */}
          <div className="flex flex-col">
            <div className="space-y-4">
              <span className="inline-block text-xs font-semibold text-purple-400 uppercase tracking-wider">
                {product.category?.replace('-', ' ')}
              </span>
              
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
                {product.name}
              </h1>
              
              <div className="pt-2">
                <p className="text-2xl md:text-3xl font-semibold text-purple-100">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              
              {/* Stock Status */}
              <div className="flex items-center gap-2 text-sm pt-2">
                {product.stock > 0 ? (
                  <span className="text-green-500 flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-4 h-4" /> In Stock
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4" /> Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-8 border-t border-purple-500/10 space-y-6">
              
              {product.stock > 0 && (
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-purple-200">Quantity</label>
                  <div className="flex items-center w-max bg-[#130e21] border border-purple-500/20 rounded-md overflow-hidden">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2.5 text-purple-300 hover:bg-[#1a1433] hover:text-white transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-6 text-sm font-bold text-white min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2.5 text-purple-300 hover:bg-[#1a1433] hover:text-white transition-colors cursor-pointer"
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
                      : 'bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white active:scale-[0.98]'
                    }
                  `}
                >
                  {isSuccessCart ? (
                    <>
                      <CheckCircle className="w-5 h-5 animate-pulse" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={handleToggleWishlist}
                  className={`p-3.5 rounded-md border transition-all duration-300 cursor-pointer flex-shrink-0 
                    ${isSuccessWishlist ? 'scale-110' : 'active:scale-95'}
                    ${isWishlisted 
                      ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                      : 'bg-transparent border-purple-500/20 text-purple-300 hover:bg-purple-500/10 hover:text-white'
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-5 h-5 transition-transform duration-300 ${isWishlisted ? 'fill-current' : ''} ${isSuccessWishlist ? 'scale-125' : ''}`} />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Product Details Section */}
        <section className="pt-10 border-t border-purple-500/10">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-serif font-bold text-white mb-6">Product Details</h2>
            <div className="prose prose-invert prose-purple max-w-none">
              <p className="text-base text-purple-100/80 leading-relaxed whitespace-pre-wrap">
                {product.description || 'No description available for this product.'}
              </p>
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="pt-16 pb-12 border-t border-purple-500/10">
            <h2 className="text-2xl font-serif font-bold text-white mb-8">You May Also Like</h2>
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