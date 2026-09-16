import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Product {
  id: string | number;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

const fallbackProducts: Product[] = [
  {
    id: '1',
    title: 'The Mystery Manor 1000-Piece Jigsaw',
    description: 'An immersive mystery puzzle where you solve a crime as you build.',
    price: 34.99,
    stock: 15,
    category: 'Mystery Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&auto=format&fit=crop&q=60'
  },
  {
    id: '2',
    title: 'Wooden 3D Mechanical Globe',
    description: 'A stunning intricate wooden gear model that actually rotates.',
    price: 49.99,
    stock: 8,
    category: 'Wooden Puzzles',
    imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&auto=format&fit=crop&q=60'
  }
];

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Jigsaw Puzzles');
  const [imageUrl, setImageUrl] = useState('');

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Date.now(),
      title,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&auto=format&fit=crop&q=60'
    };
    setProducts([newProduct, ...products]);
    setShowModal(false);
    setTitle('');
    setDescription('');
    setPrice('');
    setStock('');
    setImageUrl('');
  };

  const handleDelete = (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#090614] text-purple-100 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-900/40 pb-4">
          <div>
            <h1 className="text-3xl font-serif text-white">Product Inventory (Admin)</h1>
            <p className="text-xs text-purple-300/70 mt-1">Manage store products and stock levels</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all flex items-center gap-2 shadow-lg shadow-purple-900/40"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#120b24] border border-purple-900 p-6 rounded-3xl w-full max-w-lg space-y-6">
              <h3 className="text-lg font-serif text-white">Create New Product</h3>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Product Title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500" 
                  required 
                />
                <textarea 
                  placeholder="Description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500" 
                  rows={3}
                  required 
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" 
                    placeholder="Price ($)" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500" 
                    required 
                  />
                  <input 
                    type="number" 
                    placeholder="Stock" 
                    value={stock} 
                    onChange={(e) => setStock(e.target.value)} 
                    className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500" 
                    required 
                  />
                </div>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
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
                  className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500" 
                />

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-purple-950 border border-purple-800 text-xs text-purple-300 hover:bg-purple-900"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs text-white font-medium"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-purple-950/20 border border-purple-900/40 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-purple-900/40 bg-purple-950/40 text-purple-300">
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/30">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-purple-900/10 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={product.imageUrl} alt={product.title} className="w-10 h-10 object-cover rounded-lg border border-purple-900/40" />
                      <span className="font-medium text-white">{product.title}</span>
                    </td>
                    <td className="p-4 text-purple-300/80">{product.category}</td>
                    <td className="p-4 text-purple-200 font-semibold">${product.price}</td>
                    <td className="p-4 text-purple-300/80">{product.stock}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};