import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProduct, type Product } from "./productsApi";
import { Button } from "../../shared/components/ui/Button";
import { Skeleton } from "../../shared/components/ui/Skeleton";
import { useCart } from "../../features/cart/CartContext";
import { useToast } from "../../shared/context/ToastContext";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getProduct(slug)
      .then(setProduct)
      .catch((err) => setError(err.message || "Failed to load product"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-md py-xl font-body">
        <Skeleton className="h-5 w-32 mb-lg" />
        <div className="flex flex-col md:flex-row gap-xl">
          <Skeleton className="md:w-1/2 aspect-square rounded-2xl" />
          <div className="md:w-1/2 flex flex-col gap-md">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-40 mt-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-4xl px-md py-xl font-body">
        <p className="text-error">{error || "Product not found"}</p>
        <Link to="/products" className="text-primary hover:underline mt-sm inline-block">
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  async function handleAddToCart() {
    if (adding || product.stock === 0) return;
    setAdding(true);
    try {
      await addItem(product._id, 1);
      showToast({ message: "Added to cart", type: "success" });
    } catch {
      showToast({ message: "Failed to add item to cart", type: "error" });
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-md py-xl font-body animate-fade-in">
      <Link to="/products" className="text-primary hover:underline mb-md inline-block">
        &larr; Back to Catalog
      </Link>

      <div className="flex flex-col md:flex-row gap-xl mt-lg animate-slide-up">
        <div className="md:w-1/2">
          <img
            src={product.images[0] ?? "/placeholder.png"}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-2xl shadow-sm"
          />
        </div>

        <div className="md:w-1/2 flex flex-col gap-md">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              {product.category}
            </span>
            <h1 className="font-headline text-4xl text-on-surface mt-xs">{product.name}</h1>
            <p className="text-2xl font-bold text-on-surface-variant mt-sm">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <p className="text-on-surface-variant leading-relaxed">
            {product.description || "No description provided."}
          </p>

          <div className="mt-auto pt-lg border-t border-outline-variant flex flex-col gap-sm">
            {product.stock > 0 ? (
              <p className="text-sm text-on-surface">
                <span className="font-semibold text-primary">{product.stock}</span> in stock
              </p>
            ) : (
              <p className="text-sm text-error font-semibold">Out of stock</p>
            )}

            <Button
              variant="primary"
              disabled={product.stock === 0 || adding}
              onClick={handleAddToCart}
              className="w-full sm:w-auto mt-sm"
            >
              {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
