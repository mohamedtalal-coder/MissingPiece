import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';

export default function HomePage() {
  const { t } = useLanguage();

  const categories = [
    { name: t.home.categories.jigsaw, icon: '🖼️', count: `5 ${t.home.items}` },
    { name: t.home.categories.threeD, icon: '🏛️', count: `5 ${t.home.items}` },
    { name: t.home.categories.wooden, icon: '🪵', count: `5 ${t.home.items}` },
    { name: t.home.categories.mystery, icon: '🔍', count: `5 ${t.home.items}` },
  ];

  const bestSellers = [
    {
      id: 1,
      name: 'Sunset Meadow Jigsaw',
      pieces: '1000 Pieces',
      price: '$350.00',
      image:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      name: 'Starry Night Galaxy',
      pieces: '1000 Pieces',
      price: '$450.00',
      image:
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      name: 'Alpine Snowy Village',
      pieces: '1000 Pieces',
      price: '$300.00',
      image:
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-serif flex flex-col justify-between space-y-16 pb-16">
      <div className="max-w-7xl mx-auto px-6 pt-10 w-full">
        <div className="bg-[var(--bg-card)] border border-[#7e22ce]/50 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-[0_0_40px_rgba(126,34,206,0.2)] backdrop-blur-md relative overflow-hidden">
          <div className="space-y-5 max-w-xl z-10">
            <span className="inline-flex items-center gap-1.5 bg-[var(--bg-main)] border border-[#a855f7]/50 text-[var(--text-main)] text-xs px-3 py-1 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-[#c084fc]" />
              {t.home.premiumCollection}
            </span>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-[var(--text-main)] drop-shadow-md">
              {t.home.heroTitle}
            </h1>

            <p className="text-xs md:text-sm font-sans text-[var(--text-muted)] leading-relaxed">
              {t.home.heroDescription}
            </p>

            <div>
              <Link
                to="/products"
                className="inline-block bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white text-xs font-sans font-semibold px-7 py-3.5 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:opacity-90 transition-opacity"
              >
                {t.home.exploreCollection}
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 h-72 bg-[var(--bg-main)] rounded-3xl flex items-center justify-center shadow-[0_0_45px_rgba(168,85,247,0.5)] border-2 border-[#a855f7] relative overflow-hidden group animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#7e22ce]/20 to-transparent"></div>

            <svg
              className="w-40 h-40 drop-shadow-[0_0_20px_rgba(168,85,247,0.9)] group-hover:scale-110 transition-transform duration-500 z-10"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M20.5 11H19V7.5C19 6.67 18.33 6 17.5 6H14V4.5C14 3.67 13.33 3 12.5 3H11.5C10.67 3 10 3.67 10 4.5V6H6.5C5.67 6 5 6.67 5 7.5V11H3.5C2.67 11 2 11.67 2 12.5V13.5C2 14.33 2.67 15 3.5 15H5V18.5C5 19.33 5.67 20 6.5 20H10V21.5C10 22.33 10.67 23 11.5 23H12.5C13.33 23 14 22.33 14 21.5V20H17.5C18.33 20 19 19.33 19 18.5V15H20.5C21.33 15 22 14.33 22 13.5V12.5C22 11.67 21.33 11 20.5 11Z"
                fill="#7e22ce"
                stroke="#0b0914"
                strokeWidth="1.2"
              />

              <path
                d="M12 3H11.5C10.67 3 10 3.67 10 4.5V6H14V4.5C14 3.67 13.33 3 12.5 3H12ZM19 7.5V11H20.5C21.33 11 22 11.67 22 12.5V13.5C22 14.33 21.33 15 20.5 15H19V18.5C19 19.33 18.33 20 17.5 20H14V21.5C14 22.33 13.33 23 12.5 23H12V12C12 10.34 13.34 9 15 9H19V7.5Z"
                fill="#e9d5ff"
                opacity="0.95"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-6 w-full">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-wide">
            {t.home.shopByCategory}
          </h2>

          <p className="text-xs text-[var(--text-muted)] font-sans">
            {t.home.categoryDescription}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              to="/products"
              key={idx}
              className="bg-[var(--bg-card)] border border-[#7e22ce]/40 p-6 rounded-2xl text-center space-y-3 hover:border-[#a855f7] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all group"
            >
              <div className="w-14 h-14 bg-[var(--bg-main)] mx-auto rounded-xl flex items-center justify-center text-2xl border border-[#7e22ce]/40 group-hover:scale-105 transition-transform">
                {cat.icon}
              </div>

              <h3 className="text-sm font-bold text-[var(--text-main)]">
                {cat.name}
              </h3>

              <p className="text-[11px] font-sans text-[#c084fc]">
                {cat.count}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-6 w-full">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-wide">
            {t.home.bestSellers}
          </h2>

          <p className="text-xs text-[var(--text-muted)] font-sans">
            {t.home.bestSellersDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bestSellers.map((product) => (
            <div
              key={product.id}
              className="bg-[var(--bg-card)] border border-[#7e22ce]/40 p-5 rounded-2xl space-y-4 shadow-xl hover:border-[#a855f7] transition-all group"
            >
              <div className="w-full h-48 bg-[var(--bg-main)] rounded-xl overflow-hidden border border-[#7e22ce]/30 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[var(--text-main)]">
                  {product.name}
                </h3>

                <p className="text-xs font-sans text-[var(--text-muted)]">
                  {product.pieces}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#7e22ce]/30">
                <span className="text-sm font-bold text-[var(--text-main)]">
                  {product.price}
                </span>

                <Link
                  to="/products"
                  className="bg-[#7e22ce]/30 border border-[#a855f7]/60 text-[var(--text-main)] text-xs px-3.5 py-2 rounded-xl hover:bg-[#7e22ce]/50 transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{t.home.addToCart}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}