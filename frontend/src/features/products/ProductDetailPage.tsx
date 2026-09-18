import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi, type Product } from './productsApi';
import { useCart } from '../cart/CartContext';
import { useWishlist } from '../../shared/WishlistContext';
import { useToast } from '../../shared/context/ToastContext';
import { useLanguage } from '../../shared/context/LanguageContext';
import { ProductCard } from './components/ProductCard';
import { Icon } from '../../shared/components/ui/Icon';
import { Button } from '../../shared/components/ui/Button';
import { PriceDisplay } from '../../shared/components/ui/PriceDisplay';
import { StarRating } from '../../shared/components/ui/StarRating';
import { Motion } from '../../shared/components/ui/Motion';
import { ZoomModal } from '../../shared/components/ui/ZoomModal';
import { Reviews } from './components/Reviews';
import { useReducedMotion } from '../../shared/hooks/useReducedMotion';

const MAX_QTY = 10;

function ProductDetailSkeleton() {
  return (
    <div className="max-w-[1360px] mx-auto px-margin-mobile md:px-margin pt-space-lg pb-space-2xl w-full" aria-busy="true" aria-label="Loading product">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="aspect-[4/5] sm:aspect-square rounded-lg animate-shimmer" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-sm animate-shimmer" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4 pt-2">
          <div className="h-3 w-24 rounded animate-shimmer" />
          <div className="h-10 w-3/4 rounded animate-shimmer" />
          <div className="h-8 w-32 rounded animate-shimmer" />
          <div className="h-24 w-full rounded animate-shimmer" />
          <div className="h-12 w-full rounded animate-shimmer mt-4" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage() as any;
  const reducedMotion = useReducedMotion();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSuccessCart, setIsSuccessCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const isWishlisted = product ? isInWishlist(product._id || product.slug) : false;
  const maxQty = product ? Math.min(product.stock, MAX_QTY) : 1;

  useEffect(() => {
    if (!isSuccessCart) return;
    const timer = setTimeout(() => setIsSuccessCart(false), 2000);
    return () => clearTimeout(timer);
  }, [isSuccessCart]);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);
      setQuantity(1);
      setMainImageLoaded(false);
      setZoomOpen(false);
      try {
        const data = await productsApi.getBySlug(slug, controller.signal);
        if (controller.signal.aborted) return;
        setProduct(data);
        setSelectedImage(data.images?.[0] || '');
        if (data.category) {
          const related = await productsApi.getAll(
            { category: data.category, limit: 4 },
            controller.signal
          );
          if (!controller.signal.aborted) {
            setRelatedProducts(related.items.filter((p) => p._id !== data._id).slice(0, 4));
          }
        } else {
          setRelatedProducts([]);
        }
      } catch (err: unknown) {
        const e = err as { name?: string; code?: string };
        if (e.name === 'CanceledError' || e.name === 'AbortError' || e.code === 'ERR_CANCELED') return;
        setProduct(null);
        setError('Failed to load product details.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    setMainImageLoaded(false);
  }, [selectedImage]);

  const handleAddToCart = async () => {
    if (!product || product.stock === 0 || isAddingToCart) return;
    const safeQty = Math.min(Math.max(1, quantity), maxQty);

    setIsAddingToCart(true);
    try {
      await addItem(product, safeQty);
      setIsSuccessCart(true);
      showToast({ message: 'Added to bag', type: 'success' });
    } catch {
      showToast({ message: 'Could not add to bag', type: 'error' });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (product) await toggleWishlist(product);
  };

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="w-full bg-surface-container-low/60 border-b border-outline-variant/30 py-3.5 px-margin-mobile md:px-margin">
          <div className="max-w-[1360px] mx-auto h-4 w-64 animate-shimmer rounded" />
        </div>
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-margin animate-fade-in">
        <Icon name="error_outline" className="text-6xl text-error opacity-80" />
        <h1 className="font-headline-sm text-headline-sm text-on-surface mt-4">
          {error || t.productDetail?.notFound || 'Product not found'}
        </h1>
        <Button as="link" to="/products" className="mt-space-lg">
          {t.productDetail?.backToCatalog || 'Back to Catalog'}
        </Button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];

  return (
    <div className="bg-background min-h-screen">
      <div className="flex flex-col w-full">
        <div className="w-full bg-surface-container-low/60 backdrop-blur-sm border-b border-outline-variant/30">
          <div className="max-w-[1360px] mx-auto px-margin-mobile md:px-margin py-3.5 flex flex-wrap items-center justify-between gap-4">
            <nav aria-label="Breadcrumbs" className="flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-[0.14em]">
              <Link to="/products" className="text-on-surface-variant hover:text-primary transition-colors">
                {t.nav?.catalog || 'Catalog'}
              </Link>
              <span className="text-outline/40">/</span>
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                {product.category.replace(/-/g, ' ')}
              </Link>
              <span className="text-outline/40">/</span>
              <span className="text-primary font-semibold tracking-widest truncate max-w-[200px] sm:max-w-md">
                {product.name}
              </span>
            </nav>
            <div className="flex items-center gap-4 text-label-caps font-label-caps uppercase text-on-surface-variant tracking-[0.12em]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden />
                {t.productDetail?.batchNo || 'Batch No.'} {product._id?.slice(-5)}
              </span>
            </div>
          </div>
        </div>

        <section className="max-w-[1360px] mx-auto px-margin-mobile md:px-margin pt-space-lg pb-space-2xl w-full">
          <div
            className={`grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl items-start ${
              reducedMotion ? '' : 'animate-slide-up'
            }`}
          >
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/4.5] bg-surface-container-low rounded-lg overflow-hidden group border border-outline-variant/40 shadow-2xl">
                {!mainImageLoaded && selectedImage && (
                  <div className="absolute inset-0 animate-shimmer z-[5]" aria-hidden />
                )}
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className={`w-full h-full object-cover object-center transform group-hover:scale-105 transition-all duration-700 ease-out ${
                      mainImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setMainImageLoaded(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-outline">
                    <Icon name="inventory_2" size={48} />
                  </div>
                )}

                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 text-label-caps font-label-caps uppercase text-primary border border-outline-variant/50 tracking-[0.16em] rounded-sm">
                    Archival Edition
                  </span>
                </div>

                {selectedImage && (
                  <button
                    type="button"
                    onClick={() => setZoomOpen(true)}
                    className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface-variant hover:text-on-surface border border-outline-variant/50 transition-all"
                    aria-label="Zoom image"
                  >
                    <Icon name="eye" size={18} />
                  </button>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3 w-full" role="listbox" aria-label="Product images">
                  {images.map((img, idx) => {
                    const selected = selectedImage === img;
                    return (
                      <button
                        key={`${img}-${idx}`}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => setSelectedImage(img)}
                        className={`relative aspect-square rounded-sm overflow-hidden transition-all ${
                          selected
                            ? 'border-2 border-primary opacity-100 ring-1 ring-primary/30'
                            : 'border border-outline-variant/60 opacity-70 hover:opacity-100 hover:border-primary/70'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 flex flex-col pt-1 lg:pl-space-sm">
              <div className="border-b border-outline-variant/40 pb-6 mb-6">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-label-caps text-label-caps uppercase tracking-[0.18em] text-primary-container font-semibold">
                    {product.category.replace(/-/g, ' ')}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm border text-label-caps font-label-caps tracking-wider ${
                      product.stock > 0
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-error/10 text-error border-error/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-primary' : 'bg-error'}`}
                      aria-hidden
                    />
                    {product.stock > 0
                      ? `${product.stock} in vault`
                      : t.productDetail?.outOfStock || 'Out of Stock'}
                  </span>
                </div>

                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-3">
                  {product.name}
                </h1>

                <div className="flex items-baseline gap-4 mb-4">
                  <PriceDisplay
                    amount={product.price}
                    size="xl"
                    className="text-primary font-display-lg font-semibold tracking-tight tabular-nums"
                  />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <StarRating rating={product.averageRating || 0} interactive={false} />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {(product.averageRating || 0).toFixed(1)} / 5.0
                  </span>
                  <span className="text-outline/40">•</span>
                  <a
                    className="font-label-caps text-label-caps uppercase text-primary underline underline-offset-4 hover:text-primary-fixed transition-colors"
                    href="#reviews"
                  >
                    {product.reviewCount || 0} {t.productDetail?.reviews || 'Reviews'}
                  </a>
                </div>
              </div>

              <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6 whitespace-pre-wrap">
                {product.description}
              </div>

              <div className="flex flex-col gap-4 pt-1 mb-8">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center border border-outline-variant bg-surface-container-low rounded-sm h-12">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={product.stock === 0 || quantity <= 1}
                      className="w-11 h-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      <Icon name="remove" size={18} />
                    </button>
                    <span className="w-12 text-center font-label-md text-label-md text-on-surface font-semibold tabular-nums" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      disabled={product.stock === 0 || quantity >= maxQty}
                      className="w-11 h-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      <Icon name="add" size={18} />
                    </button>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || isAddingToCart || isSuccessCart}
                    className="flex-1 h-12 rounded-sm shadow-md transition-all font-semibold uppercase tracking-wider"
                    icon={isSuccessCart ? 'check' : 'shopping_bag'}
                    isLoading={isAddingToCart}
                  >
                    {isSuccessCart
                      ? t.productDetail?.added || 'Added to Bag'
                      : product.stock === 0
                        ? t.productDetail?.outOfStock || 'Out of Stock'
                        : `${t.productDetail?.addToCart || 'Add to Cart'} • $${(product.price * quantity).toFixed(2)}`}
                  </Button>

                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`w-12 h-12 rounded-sm border bg-surface-container-low flex items-center justify-center transition-all flex-shrink-0
                      ${
                        isWishlisted
                          ? 'border-primary text-primary hover:bg-primary/5'
                          : 'border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary'
                      }`}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to Wishlist'}
                  >
                    <Icon
                      name={isWishlisted ? 'favorite' : 'favorite_border'}
                      size={20}
                      fill={isWishlisted ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-label-caps font-label-caps uppercase tracking-wider text-outline px-1 mt-2">
                  <span className="flex items-center gap-1">
                    <Icon name="local_shipping" size={15} className="text-primary" />
                    {t.productDetail?.shipping || 'Dispatches within 24 Hours'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="verified" size={15} className="text-primary" />
                    {t.productDetail?.guarantee || 'Missing Piece Guarantee'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="max-w-[1360px] mx-auto px-margin-mobile md:px-margin py-space-xl w-full">
          <Motion>
            <Reviews productId={product._id} />
          </Motion>
        </section>

        {relatedProducts.length > 0 && (
          <section className="max-w-[1360px] mx-auto px-margin-mobile md:px-margin py-space-2xl w-full border-t border-outline-variant/30">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-outline-variant/30 gap-4">
              <div>
                <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary font-semibold">
                  Curated Pairings
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
                  Companion Puzzles
                </h2>
              </div>
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="inline-flex items-center gap-2 font-label-md text-label-md uppercase tracking-wider text-primary hover:text-primary-fixed transition-colors"
              >
                {t.productDetail?.viewEntireCatalog || 'View Entire Catalog'}{' '}
                <Icon name="arrow_forward" size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {relatedProducts.map((relatedProduct, i) => (
                <Motion key={relatedProduct._id} delayMs={reducedMotion ? 0 : i * 60} className="h-full">
                  <ProductCard product={relatedProduct} />
                </Motion>
              ))}
            </div>
          </section>
        )}
      </div>

      <ZoomModal
        isOpen={zoomOpen}
        onClose={() => setZoomOpen(false)}
        imageUrl={selectedImage}
        title={product.name}
      />
    </div>
  );
}

export default ProductDetailPage;
