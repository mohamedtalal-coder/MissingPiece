import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi, type Product } from './productsApi';
import { useCart } from '../cart/CartContext';
import { useWishlist } from '../../shared/WishlistContext';
import { useToast } from '../../shared/context/ToastContext';
import { ProductCard } from './components/ProductCard';
import { Icon } from '../../shared/components/ui/Icon';
import { Reviews } from './components/Reviews';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSuccessCart, setIsSuccessCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const isWishlisted = product ? isInWishlist(product._id || product.slug) : false;

  useEffect(() => {
    if (isSuccessCart) {
      const timer = setTimeout(() => setIsSuccessCart(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccessCart]);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productsApi.getBySlug(slug!);
        setProduct(data);
        setSelectedImage(data.images?.[0] || '/placeholder.png');
        // Fetch related products from same category
        if (data.category) {
          const related = await productsApi.getAll({ category: data.category, limit: 4 });
          setRelatedProducts(related.items.filter((p: Product) => p._id !== data._id).slice(0, 4));
        }
      } catch (err: any) {
        setError("Failed to load product details.");
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product || product.stock === 0 || isAddingToCart) return;

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
    if (product) await toggleWishlist(product);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center pt-20">
        <Icon name="error_outline" className="text-6xl text-error opacity-80" />
        <h3 className="font-headline-sm text-headline-sm text-on-surface mt-4">{error || "Product not found"}</h3>
        <Link to="/products" className="mt-6 px-8 py-3 bg-primary-container text-on-primary-container font-label-md text-label-md rounded hover:bg-primary transition-colors">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased pt-20 pb-20">
      <div className="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin pt-space-lg">
        {/* Breadcrumb */}
        <div className="flex items-center gap-space-xs font-label-caps text-label-caps text-outline uppercase tracking-wider mb-space-lg overflow-x-auto whitespace-nowrap">
          <Link to="/products" className="hover:text-primary transition-colors">Catalog</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary transition-colors">{product.category.replace('-', ' ')}</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface-variant truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl lg:gap-space-2xl">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-space-sm">
            <div className="relative aspect-[4/5] md:aspect-square lg:aspect-[4/3] bg-surface-container-lowest border border-outline-variant/30 rounded-lg overflow-hidden group">
              <img src={selectedImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 w-full">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-primary bg-surface-container' : 'border-outline-variant/60 bg-surface-container hover:border-primary/70 opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`${product.name} - View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="lg:col-span-5 flex flex-col pt-1 lg:pl-space-sm">
            <div className="border-b border-outline-variant/40 pb-6 mb-6">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="font-label-caps text-label-caps uppercase tracking-[0.18em] text-primary-container font-semibold">
                  {product.category.replace('-', ' ')}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm border text-label-caps font-label-caps tracking-wider ${product.stock > 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-error/10 text-error border-error/20'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-primary' : 'bg-error'}`}></span> 
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>
              
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-3">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-display-lg text-[2.5rem] leading-none text-primary font-semibold tracking-tight tabular-nums">
                  ${product.price?.toFixed(2)}
                </span>
              </div>

              {/* Ratings */}
              <div className="flex items-center gap-3">
                <div className="flex items-center text-primary text-[15px]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} name={i < Math.floor(product.averageRating || 0) ? 'star' : i < (product.averageRating || 0) ? 'star_half' : 'star'} />
                  ))}
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{(product.averageRating || 0).toFixed(1)} / 5.0</span>
                <span className="text-outline/40">•</span>
                <a className="font-label-caps text-label-caps uppercase text-primary underline underline-offset-4 hover:text-primary-fixed transition-colors" href="#reviews">
                  {product.reviewCount || 0} Verified Reviews
                </a>
              </div>
            </div>

            <div className="prose prose-sm prose-invert text-on-surface-variant max-w-none mb-8 font-body-md text-body-md whitespace-pre-wrap">
              {product.description}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mt-auto">
              <div className="flex items-end gap-3">
                {product.stock > 0 && (
                  <div className="flex flex-col gap-1.5 w-24 shrink-0">
                    <label htmlFor="qty" className="font-label-caps text-[10px] uppercase text-outline tracking-wider">Qty</label>
                    <div className="relative">
                      <select 
                        id="qty" 
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full bg-surface-container-low border border-outline-variant text-on-surface font-body-lg text-body-lg rounded px-3 py-3 appearance-none focus:outline-none focus:border-primary cursor-pointer"
                      >
                        {Array.from({ length: Math.min(product.stock, 10) }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                      <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart || isSuccessCart}
                  className={`flex-1 h-[52px] rounded font-label-md text-label-md font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg
                    ${product.stock === 0 
                      ? 'bg-surface-container text-outline cursor-not-allowed border border-outline-variant/30 shadow-none' 
                      : isSuccessCart
                      ? 'bg-primary text-on-primary'
                      : 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary hover:shadow-primary/20'
                    }`}
                >
                  <Icon name={isSuccessCart ? 'check' : 'shopping_bag'} className="text-[18px]" />
                  <span>{isAddingToCart ? 'Adding...' : isSuccessCart ? 'Added to Cart' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>

                <button 
                  onClick={handleToggleWishlist}
                  className={`w-[52px] h-[52px] shrink-0 rounded border flex items-center justify-center transition-colors cursor-pointer
                    ${isWishlisted ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10' : 'border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary'}`}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Icon name={isWishlisted ? 'favorite' : 'favorite_border'} className={`text-[22px] ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Reviews Section */}
        <div id="reviews" className="mt-24">
           <Reviews productId={product._id} /> 
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-space-2xl pt-space-xl border-t border-outline-variant/30">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-space-lg">Related Curations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-md">
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