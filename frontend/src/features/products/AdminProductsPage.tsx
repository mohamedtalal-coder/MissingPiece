import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Edit2 } from 'lucide-react';
import { productsApi, type Product, type CreateProductInput } from './productsApi';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Jigsaw Puzzles');
  const [imageUrl, setImageUrl] = useState('');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const result = await productsApi.getAll({ limit: 50 });
      setProducts(result.items);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const input: CreateProductInput = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&auto=format&fit=crop&q=60']
      };
      
      if (editingProductId) {
        const updated = await productsApi.update(editingProductId, input);
        setProducts(products.map(p => p._id === editingProductId ? updated : p));
      } else {
        const created = await productsApi.create(input);
        setProducts([created, ...products]);
      }
      
      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(`Failed to ${editingProductId ? 'update' : 'create'} product`);
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
    setImageUrl(product.images?.[0] || '');
    
    setEditingProductId(product._id);
    setShowModal(true);
  };

  const handleAddNewClick = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setImageUrl('');
    setEditingProductId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productsApi.delete(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen bg-[#090614] text-purple-100 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-900/40 pb-4">
          <div>
            <h1 className="text-3xl font-serif text-white">Product Inventory (Admin)</h1>
            <p className="text-sm text-purple-300/70 mt-1">Manage store products and stock levels via backend API</p>
          </div>
          <button 
            onClick={handleAddNewClick}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-purple-900/40 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#120b24] border border-purple-900 p-6 rounded-3xl w-full max-w-lg space-y-6">
              <h3 className="text-xl font-serif text-white">
                {editingProductId ? 'Edit Product' : 'Create New Product'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Product Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500" 
                  required 
                />
                <textarea 
                  placeholder="Description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500" 
                  rows={3}
                  required 
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" 
                    placeholder="Price ($)" 
                    step="0.01"
                    min="0"
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500" 
                    required 
                  />
                  <input 
                    type="number" 
                    placeholder="Stock"
                    min="0"
                    value={stock} 
                    onChange={(e) => setStock(e.target.value)} 
                    className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500" 
                    required 
                  />
                </div>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Jigsaw Puzzles">Jigsaw Puzzles</option>
                  <option value="3D Puzzles">3D Puzzles</option>
                  <option value="Wooden Puzzles">Wooden Puzzles</option>
                  <option value="Mystery Puzzles">Mystery Puzzles</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Image URL (optional)" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500" 
                />

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-purple-950 border border-purple-800 text-sm text-purple-300 hover:bg-purple-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm text-white font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting 
                      ? 'Saving...' 
                      : editingProductId ? 'Update Product' : 'Save Product'
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-purple-950/20 border border-purple-900/40 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-purple-900/40 bg-purple-950/40 text-purple-300">
                    <th className="p-5 font-semibold">Product</th>
                    <th className="p-5 font-semibold">Category</th>
                    <th className="p-5 font-semibold">Price</th>
                    <th className="p-5 font-semibold">Stock</th>
                    <th className="p-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-purple-300/50">
                        No products found in the database.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} className="hover:bg-purple-900/10 transition-colors">
                        <td className="p-5 flex items-center gap-4">
                          <img 
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&auto=format&fit=crop&q=60'} 
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded-xl border border-purple-900/40" 
                          />
                          <span className="font-medium text-white">{product.name}</span>
                        </td>
                        <td className="p-5 text-purple-300/80">{product.category}</td>
                        <td className="p-5 text-purple-200 font-semibold">${product.price.toFixed(2)}</td>
                        <td className="p-5">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            product.stock > 10 ? 'bg-green-500/10 text-green-400' :
                            product.stock > 0 ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-5 text-right space-x-2 whitespace-nowrap">
                          <button 
                            onClick={() => handleEditClick(product)}
                            className="p-2.5 text-blue-400 hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product._id)}
                            className="p-2.5 text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};