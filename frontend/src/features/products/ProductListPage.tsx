import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Heart,
  ShoppingBag,
  ArrowUpDown,
} from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';

type Category = 'jigsaw' | 'threeD' | 'wooden' | 'mystery';

type ProductName =
  | 'mysticNebula'
  | 'emeraldForest'
  | 'sunsetMeadow'
  | 'starryNight'
  | 'oceanDeep'
  | 'cyberpunkTokyo'
  | 'medievalCastle'
  | 'eiffelTower'
  | 'spaceShuttle'
  | 'pyramids'
  | 'worldMap'
  | 'clockwork'
  | 'wildlifeSafari'
  | 'mandala'
  | 'pirateShip'
  | 'holmes'
  | 'escapeManor'
  | 'crimeScene'
  | 'secretAgent'
  | 'pharaohVault';

type Product = {
  id: number;
  name: ProductName;
  category: Category;
  price: number;
  image: string;
  inStock: boolean;
};

export function ProductListPage() {
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | Category
  >('all');
  const [maxPrice, setMaxPrice] = useState(120);
  const [sortBy, setSortBy] = useState('default');
  const [wishlist, setWishlist] = useState<number[]>([]);

  const products: Product[] = [
    {
      id: 1,
      name: 'mysticNebula',
      category: 'jigsaw',
      price: 45,
      image:
        'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
    {
      id: 2,
      name: 'emeraldForest',
      category: 'jigsaw',
      price: 50,
      image:
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop&q=80',
      inStock: false,
    },
    {
      id: 3,
      name: 'sunsetMeadow',
      category: 'jigsaw',
      price: 35,
      image:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
    {
      id: 4,
      name: 'starryNight',
      category: 'jigsaw',
      price: 55,
      image:
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
    {
      id: 5,
      name: 'oceanDeep',
      category: 'jigsaw',
      price: 40,
      image:
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },

    {
      id: 6,
      name: 'cyberpunkTokyo',
      category: 'threeD',
      price: 85,
      image:
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
    {
      id: 7,
      name: 'medievalCastle',
      category: 'threeD',
      price: 95,
      image:
        'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
    {
      id: 8,
      name: 'eiffelTower',
      category: 'threeD',
      price: 75,
      image:
        'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&auto=format&fit=crop&q=80',
      inStock: false,
    },
    {
      id: 9,
      name: 'spaceShuttle',
      category: 'threeD',
      price: 90,
      image:
        'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
    {
      id: 10,
      name: 'pyramids',
      category: 'threeD',
      price: 80,
      image:
        'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },

    {
      id: 11,
      name: 'worldMap',
      category: 'wooden',
      price: 65,
      image:
        'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
    {
      id: 12,
      name: 'clockwork',
      category: 'wooden',
      price: 70,
      image:
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
    {
      id: 13,
      name: 'wildlifeSafari',
      category: 'wooden',
      price: 60,
      image:
        'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
    {
      id: 14,
      name: 'mandala',
      category: 'wooden',
      price: 55,
      image:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80',
      inStock: false,
    },
    {
      id: 15,
      name: 'pirateShip',
      category: 'wooden',
      price: 80,
      image:
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },

    {
      id: 16,
      name: 'holmes',
      category: 'mystery',
      price: 50,
      image:
        'https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
    {
      id: 17,
      name: 'escapeManor',
      category: 'mystery',
      price: 65,
      image:
        'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
    {
      id: 18,
      name: 'crimeScene',
      category: 'mystery',
      price: 55,
      image:
        'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
    {
      id: 19,
      name: 'secretAgent',
      category: 'mystery',
      price: 45,
      image:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
      inStock: false,
    },
    {
      id: 20,
      name: 'pharaohVault',
      category: 'mystery',
      price: 70,
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
      inStock: true,
    },
  ];

  const toggleWishlist = (id: number) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const productName = t.productList.products[product.name];
      const productCategory = product.category;

      const matchesSearch = productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        productCategory === selectedCategory;

      const matchesPrice = product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'low-high') {
        return a.price - b.price;
      }

      if (sortBy === 'high-low') {
        return b.price - a.price;
      }

      return 0;
    });

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] px-8 py-10 font-sans space-y-8">
      <div className="max-w-7xl mx-auto space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--text-main)] tracking-wide">
          {t.productList.title}
        </h1>

        <p className="text-xs md:text-sm text-[var(--text-muted)]">
          {t.productList.description} ({filteredProducts.length}{' '}
          {t.productList.items})
        </p>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--bg-card)] border border-[#7e22ce]/40 p-5 rounded-2xl shadow-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#c084fc]" />

          <input
            type="text"
            placeholder={t.productList.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-main)] border border-[#7e22ce]/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--text-main)] placeholder-[#94a3b8] focus:outline-none focus:border-[#a855f7]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#c084fc]" />

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as 'all' | Category)
              }
              className="bg-[var(--bg-main)] border border-[#7e22ce]/40 rounded-xl px-3 py-2.5 text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:border-[#a855f7]"
            >
              <option value="all">
                {t.productList.allCategories}
              </option>

              <option value="jigsaw">
                {t.productList.categories.jigsaw}
              </option>

              <option value="threeD">
                {t.productList.categories.threeD}
              </option>

              <option value="wooden">
                {t.productList.categories.wooden}
              </option>

              <option value="mystery">
                {t.productList.categories.mystery}
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#c084fc]" />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[var(--bg-main)] border border-[#7e22ce]/40 rounded-xl px-3 py-2.5 text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:border-[#a855f7]"
            >
              <option value="default">
                {t.productList.sortByPrice}
              </option>

              <option value="low-high">
                {t.productList.lowToHigh}
              </option>

              <option value="high-low">
                {t.productList.highToLow}
              </option>
            </select>
          </div>

          <div className="flex items-center gap-3 bg-[var(--bg-main)] border border-[#7e22ce]/40 px-4 py-2 rounded-xl">
            <span className="text-xs text-[var(--text-muted)]">
              {t.productList.maxPrice}: ${maxPrice}
            </span>

            <input
              type="range"
              min="30"
              max="120"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-[#a855f7] cursor-pointer w-20"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-card)] border border-[#7e22ce]/30 rounded-3xl space-y-2">
            <p className="text-sm font-medium text-[var(--text-muted)]">
              {t.productList.noProducts}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-[var(--bg-card)] border border-[#7e22ce]/40 rounded-2xl p-4 space-y-4 shadow-xl hover:border-[#a855f7] transition-all relative group overflow-hidden"
                >
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`absolute top-6 right-6 w-8 h-8 rounded-full border flex items-center justify-center transition-colors z-10 ${
                      isWishlisted
                        ? 'bg-pink-950/80 border-pink-500 text-pink-400'
                        : 'bg-[var(--bg-main)]/80 border-[#7e22ce]/40 text-[var(--text-main)] hover:text-pink-400'
                    }`}
                    title={
                      isWishlisted
                        ? t.common.remove
                        : t.productDetail.addToWishlist
                    }
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted ? 'fill-current' : ''
                      }`}
                    />
                  </button>

                  <Link
                    to={`/products/${product.id}`}
                    className="block"
                  >
                    <div className="w-full h-48 bg-[var(--bg-main)] rounded-xl overflow-hidden border border-[#7e22ce]/30 relative">
                      <img
                        src={product.image}
                        alt={t.productList.products[product.name]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {!product.inStock && (
                        <div className="absolute bottom-2 left-2 bg-red-950/90 border border-red-600/50 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          {t.productList.outOfStock}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="space-y-1">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-xs font-bold text-[var(--text-main)] truncate hover:text-[#c084fc] transition-colors">
                        {t.productList.products[product.name]}
                      </h3>
                    </Link>

                    <p className="text-[11px] text-[var(--text-muted)] font-sans">
                      {t.productList.categories[product.category]}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#7e22ce]/30">
                    <span className="text-sm font-bold text-[var(--text-main)]">
                      ${product.price}.00
                    </span>

                    <button
                      disabled={!product.inStock}
                      className="bg-[#7e22ce]/30 border border-[#a855f7]/60 text-[var(--text-main)] text-xs px-3 py-1.5 rounded-lg hover:bg-[#7e22ce]/50 transition-colors disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />

                      <span>{t.productList.add}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductListPage;