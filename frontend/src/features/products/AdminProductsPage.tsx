import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { useToast } from '../../shared/context/ToastContext';
import { productsApi, type Product, type CreateProductInput } from './productsApi';
import { Icon } from '../../shared/components/ui/Icon';
import { Button } from '../../shared/components/ui/Button';
import { PriceDisplay } from '../../shared/components/ui/PriceDisplay';
import { AdminAtelierNav } from '../../shared/components/layout/AdminAtelierNav';
import { useScrollLock } from '../../shared/hooks/useScrollLock';

function sanitize(value: string, max: number): string {
  return value.replace(/[<>]/g, '').trim().slice(0, max);
}

function TableSkeleton() {
  return (
    <div className="p-6 space-y-3" aria-busy="true" aria-label="Loading inventory">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 rounded-lg animate-shimmer" />
      ))}
    </div>
  );
}

export const AdminProductsPage: React.FC = () => {
  const { t } = useLanguage() as any;
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Jigsaw Puzzles');
  const [images, setImages] = useState<File[]>([]);
  const [isActive, setIsActive] = useState(true);

  useScrollLock(showModal);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const result = await productsApi.getAdminAll({ limit: 50 });
      setProducts(result.items);
      setError(null);
    } catch {
      setError('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const validateForm = (): CreateProductInput | null => {
    const cleanName = sanitize(name, 120);
    const cleanDesc = sanitize(description, 2000);
    const priceNum = Number(price);
    const stockNum = Math.floor(Number(stock));

    if (cleanName.length < 2) {
      setFormError('Title must be at least 2 characters.');
      return null;
    }

    if (cleanDesc.length < 10) {
      setFormError('Description must be at least 10 characters.');
      return null;
    }

    if (!Number.isFinite(priceNum) || priceNum <= 0 || priceNum > 100000) {
      setFormError('Enter a valid price greater than 0.');
      return null;
    }

    if (!Number.isFinite(stockNum) || stockNum < 0 || stockNum > 10000) {
      setFormError('Stock must be an integer between 0 and 10000.');
      return null;
    }

    if (images.length > 10) {
      setFormError('You can upload up to 10 images.');
      return null;
    }

    if (!editingProductId && images.length === 0) {
      setFormError('Please select at least one image.');
      return null;
    }

    return {
      name: cleanName,
      description: cleanDesc,
      price: priceNum,
      stock: stockNum,
      category: sanitize(category, 80) || 'Jigsaw Puzzles',
      isActive,
      images,
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > 10) {
      setFormError('You can upload up to 10 images.');
      setImages([]);
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith('image/')
    );

    if (invalidFile) {
      setFormError('Please select image files only.');
      setImages([]);
      return;
    }

    setImages(selectedFiles);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setFormError('');

    const input = validateForm();

    if (!input) return;

    setIsSubmitting(true);

    try {
      if (editingProductId) {
        const updated = await productsApi.update(editingProductId, input);

        setProducts((prev) =>
          prev.map((p) =>
            p._id === editingProductId ? updated : p
          )
        );

        showToast({
          message: 'Edition updated',
          type: 'success',
        });
      } else {
        const created = await productsApi.create(input);

        setProducts((prev) => [created, ...prev]);

        showToast({
          message: 'Edition created',
          type: 'success',
        });
      }

      setShowModal(false);
      resetForm();
    } catch {
      showToast({
        message: `Failed to ${editingProductId ? 'update' : 'create'} product`,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setCategory(product.category);
    setImages([]);
    setIsActive(product.isActive !== false);
    setEditingProductId(product._id);
    setFormError('');
    setShowModal(true);
  };

  const handleAddNewClick = () => {
    resetForm();
    setFormError('');
    setShowModal(true);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setImages([]);
    setIsActive(true);
    setEditingProductId(null);
    setCategory('Jigsaw Puzzles');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.adminProducts?.deleteConfirm || 'Delete this product?')) {
      return;
    }

    setPendingDeleteId(id);

    try {
      await productsApi.delete(id);

      setProducts((prev) =>
        prev.filter((p) => p._id !== id)
      );

      showToast({
        message: 'Edition removed',
        type: 'info',
      });
    } catch {
      showToast({
        message: 'Failed to delete product',
        type: 'error',
      });
    } finally {
      setPendingDeleteId(null);
    }
  };

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;

    const q = search.toLowerCase();

    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p._id.toLowerCase().includes(q)
    );
  });

  const totalStock = products.reduce(
    (acc, p) => acc + p.stock,
    0
  );

  const lowStock = products.filter(
    (p) => p.stock > 0 && p.stock <= 5
  ).length;

  const outOfStock = products.filter(
    (p) => p.stock === 0
  ).length;

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
      <AdminAtelierNav />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8">
        <div>
          <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
            Atelier Vault &amp; Stock
          </span>

          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
            Product Management &amp; Inventory
          </h1>

          <p className="font-body-md text-body-md text-on-surface-variant mt-1.5 max-w-2xl">
            Manage artisan puzzle editions and workshop inventory.
          </p>
        </div>

        <Button onClick={handleAddNewClick} icon="add">
          Add New Puzzle Edition
        </Button>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error/40 text-error p-4 rounded-md flex items-center justify-between gap-3 mb-6">
          <span>{error}</span>

          <Button type="button" size="sm" onClick={fetchProducts}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Editions', value: products.length },
          { label: 'Units in Vault', value: totalStock },
          { label: 'Low Stock', value: lowStock, danger: true },
          { label: 'Out of Stock', value: outOfStock },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-low p-4 rounded shadow-sm border border-outline-variant/20"
          >
            <span
              className={`font-label-caps text-label-caps uppercase tracking-wider ${
                stat.danger ? 'text-error' : 'text-outline'
              }`}
            >
              {stat.label}
            </span>

            <div
              className={`font-headline-md text-headline-md mt-2 font-medium ${
                stat.danger ? 'text-error' : 'text-on-surface'
              }`}
            >
              {isLoading ? '—' : stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-low rounded-lg p-4 mb-6 border border-outline-variant/20">
        <div className="relative max-w-md">
          <Icon
            name="search"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
            size={18}
          />

          <label
            htmlFor="admin-product-search"
            className="sr-only"
          >
            Search products
          </label>

          <input
            id="admin-product-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container text-on-surface placeholder:text-outline text-sm pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Search by title, category, or id…"
            type="search"
          />
        </div>
      </div>

      <div className="bg-surface-container-low rounded-lg shadow-md border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider border-b border-outline-variant/20">
                  <th className="py-3.5 px-4">Puzzle Edition</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">State</th>
                  <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/20">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-on-surface-variant"
                    >
                      No editions match.
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-surface-container/60 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-14 bg-surface-container-high rounded shrink-0 overflow-hidden">
                            <img
                              className="w-full h-full object-cover"
                              src={product.images?.[0] || ''}
                              alt=""
                              loading="lazy"
                            />
                          </div>

                          <div className="min-w-0">
                            <span className="font-headline-sm text-sm text-on-surface truncate block">
                              {product.name}
                            </span>

                            <span className="text-[10px] text-outline uppercase tracking-wider">
                              {product._id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-on-surface-variant">
                        {product.category}
                      </td>

                      <td className="py-4 px-4">
                        <PriceDisplay amount={product.price} size="sm" />
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={
                            product.stock <= 5
                              ? 'text-error font-medium'
                              : 'text-on-surface'
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                            product.isActive
                              ? 'bg-surface-container-highest text-primary'
                              : 'bg-surface-container-high text-outline'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>

                      <td className="py-4 pr-6 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            onClick={() => handleEditClick(product)}
                            variant="ghost"
                            size="sm"
                            icon="edit"
                            aria-label="Edit"
                          />

                          <Button
                            onClick={() => handleDelete(product._id)}
                            variant="ghost"
                            size="sm"
                            icon="delete"
                            isLoading={pendingDeleteId === product._id}
                            className="text-error"
                            aria-label="Delete"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() =>
            !isSubmitting &&
            (setShowModal(false), resetForm())
          }
        >
          <div
            className="bg-surface-container-low max-w-lg w-full rounded-lg p-6 shadow-2xl border border-outline-variant/30 animate-scale-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-product-modal-title"
          >
            <div className="flex items-start justify-between pb-4 border-b border-outline-variant/20">
              <div>
                <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
                  {editingProductId ? 'Edit' : 'Create'} Edition
                </span>

                <h2
                  id="admin-product-modal-title"
                  className="font-headline-sm text-headline-sm text-on-surface mt-1"
                >
                  {editingProductId
                    ? 'Update Puzzle Details'
                    : 'New Artisan Puzzle'}
                </h2>
              </div>

              <Button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                variant="ghost"
                icon="close"
                disabled={isSubmitting}
              />
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 py-4"
              noValidate
            >
              {formError && (
                <p
                  className="text-sm text-error"
                  role="alert"
                >
                  {formError}
                </p>
              )}

              <div>
                <label
                  className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-1.5"
                  htmlFor="ap-name"
                >
                  Puzzle Title *
                </label>

                <input
                  id="ap-name"
                  type="text"
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container text-on-surface text-sm px-3.5 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>

              <div>
                <label
                  className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-1.5"
                  htmlFor="ap-desc"
                >
                  Description *
                </label>

                <textarea
                  id="ap-desc"
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-container text-on-surface text-sm px-3.5 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-1.5"
                    htmlFor="ap-price"
                  >
                    Price ($) *
                  </label>

                  <input
                    id="ap-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="100000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-surface-container text-on-surface text-sm px-3.5 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-1.5"
                    htmlFor="ap-stock"
                  >
                    Stock *
                  </label>

                  <input
                    id="ap-stock"
                    type="number"
                    min="0"
                    max="10000"
                    step="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-surface-container text-on-surface text-sm px-3.5 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-1.5"
                  htmlFor="ap-cat"
                >
                  Category *
                </label>

                <select
                  id="ap-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-container text-on-surface text-sm px-3.5 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="Jigsaw Puzzles">Jigsaw Puzzles</option>
                  <option value="3D Puzzles">3D Architectural</option>
                  <option value="Wooden Puzzles">Wooden Puzzles</option>
                  <option value="Mystery Puzzles">Mystery Atelier</option>
                </select>
              </div>

              <div>
                <label
                  className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-1.5"
                  htmlFor="ap-images"
                >
                  Product Images *
                </label>

                <input
                  id="ap-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full bg-surface-container text-on-surface text-sm px-3.5 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-primary/40"
                />

                <p className="text-xs text-outline mt-1.5">
                  Select up to 10 images.
                </p>

                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {images.map((image, index) => (
                      <div
                        key={`${image.name}-${index}`}
                        className="aspect-square rounded overflow-hidden bg-surface-container-high"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {editingProductId && images.length === 0 && (
                  <p className="text-xs text-outline mt-2">
                    Leave empty to keep the current images.
                  </p>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary"
                />

                <span className="text-sm text-on-surface-variant">
                  Visible in public storefront
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  variant="ghost"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  {editingProductId
                    ? 'Save Changes'
                    : 'Create Edition'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;

