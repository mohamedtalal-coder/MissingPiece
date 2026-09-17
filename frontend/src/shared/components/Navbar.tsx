import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Settings,
  Package,
  Sun,
  Moon,
  Languages,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../../features/auth/AuthContext';

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, isArabic } = useLanguage();


  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const translations = {
    home: isArabic ? 'الرئيسية' : 'Home',
    catalog: isArabic ? 'المنتجات' : 'Catalog',
    wishlist: isArabic ? 'المفضلة' : 'Wishlist',
    orders: isArabic ? 'طلباتي' : 'My Orders',
    admin: isArabic ? 'لوحة الإدارة' : 'Admin Portal',
    cart: isArabic ? 'السلة' : 'Cart',
    profile: isArabic ? 'إدارة الحساب' : 'Manage Profile & Avatar',
    myWishlist: isArabic ? 'قائمتي المفضلة' : 'My Wishlist',
    logout: isArabic ? 'تسجيل الخروج' : 'Logout',
    createAccount: isArabic ? 'إنشاء حساب' : 'Create Account',
    signIn: isArabic ? 'تسجيل الدخول' : 'Sign In',
  };

  return (
    <nav
      className={`w-full px-8 py-4 sticky top-0 z-50  font-sans border-b transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#0b0914]/95 border-[#221738] shadow-[0_4px_25px_rgba(126,34,206,0.2)]'
          : 'bg-white/95 border-border shadow-[0_4px_20px_rgba(126,34,206,0.12)]'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        <Link
          to="/"
          className={`text-xl font-serif font-extrabold tracking-wider bg-clip-text text-transparent shrink-0 ${
            theme === 'dark'
              ? 'bg-primary from-white via-[#e9d5ff] to-[#c084fc]'
              : 'bg-primary from-primary via-purple-500 to-fuchsia-500'
          }`}
        >
          Missing Piece
        </Link>

        <div
          className={`hidden lg:flex items-center gap-6 text-xs font-semibold ${
            theme === 'dark' ? 'text-[#cbd5e1]' : 'text-gray-700'
          }`}
        >
          <Link
            to="/"
            className="hover:text-primary transition-colors"
          >
            {translations.home}
          </Link>

          <Link
            to="/products"
            className="hover:text-primary transition-colors"
          >
            {translations.catalog}
          </Link>

          <Link
            to="/wishlist"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span>{translations.wishlist}</span>
          </Link>

          <Link
            to="/orders"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Package className="w-3.5 h-3.5 text-primary" />
            <span>{translations.orders}</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin/orders"
              className="hover:text-primary transition-colors"
            >
              {translations.admin}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 relative">

          <button
            onClick={toggleTheme}
            className={`w-9 h-9 rounded-md border flex items-center justify-center transition-all ${
              theme === 'dark'
                ? 'bg-background border-border text-[#c084fc] hover:border-[#c084fc]'
                : 'bg-surface border-border text-primary hover:border-border'
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={toggleLanguage}
            className={`h-9 px-3 rounded-md border flex items-center gap-1.5 transition-all text-xs font-semibold ${
              theme === 'dark'
                ? 'bg-background border-border text-[#c084fc] hover:border-[#c084fc]'
                : 'bg-surface border-border text-primary hover:border-border'
            }`}
            aria-label="Change language"
          >
            <Languages className="w-4 h-4" />
            <span>{language === 'en' ? 'AR' : 'EN'}</span>
          </button>

          <Link
            to="/cart"
            className="bg-primary from-[#7e22ce] to-[#a855f7] text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{translations.cart}</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-10 h-10 rounded-md border flex items-center justify-center cursor-pointer overflow-hidden transition-all ${
                theme === 'dark'
                  ? 'bg-background border-[#a855f7]/60 text-[#e9d5ff] hover:border-[#c084fc]'
                  : 'bg-surface border-border text-primary hover:border-border'
              }`}
            >
              {(user as any)?.avatar ? (
                <img
                  src={(user as any).avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </button>

            {isDropdownOpen && (
              <div
                className={`absolute ${
                  isArabic ? 'left-0' : 'right-0'
                } mt-3 w-56 rounded-md border py-2 z-50 text-xs shadow-[0_0_25px_rgba(126,34,206,0.3)] ${
                  theme === 'dark'
                    ? 'bg-background border-border'
                    : 'bg-white border-border'
                }`}
              >
                {user ? (
                  <>
                    <div
                      className={`px-4 py-3 border-b ${
                        theme === 'dark'
                          ? 'border-border'
                          : 'border-border'
                      }`}
                    >
                      <p
                        className={`font-bold ${
                          theme === 'dark'
                            ? 'text-white'
                            : 'text-gray-900'
                        }`}
                      >
                        {user.name}
                      </p>

                      <p
                        className={`text-[10px] truncate ${
                          theme === 'dark'
                            ? 'text-[#cbd5e1]'
                            : 'text-gray-500'
                        }`}
                      >
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/account"
                        onClick={() => setIsDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-[#cbd5e1] hover:bg-[#7e22ce]/20 hover:text-white'
                            : 'text-gray-700 hover:bg-surface hover:text-primary'
                        }`}
                      >
                        <Settings className="w-3.5 h-3.5 text-primary" />
                        <span>{translations.profile}</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setIsDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors ${
                          theme === 'dark'
                            ? 'text-[#cbd5e1] hover:bg-[#7e22ce]/20 hover:text-white'
                            : 'text-gray-700 hover:bg-surface hover:text-primary'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 text-pink-400" />
                        <span>{translations.myWishlist}</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors border-t border-border mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{translations.logout}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-1">
                    <Link
                      to="/register"
                      onClick={() => setIsDropdownOpen(false)}
                      className={`block px-4 py-2.5 transition-colors ${
                        theme === 'dark'
                          ? 'text-[#cbd5e1] hover:bg-[#7e22ce]/20 hover:text-white'
                          : 'text-gray-700 hover:bg-surface hover:text-primary'
                      }`}
                    >
                      {translations.createAccount}
                    </Link>

                    <Link
                      to="/login"
                      onClick={() => setIsDropdownOpen(false)}
                      className={`block px-4 py-2.5 transition-colors ${
                        theme === 'dark'
                          ? 'text-[#cbd5e1] hover:bg-[#7e22ce]/20 hover:text-white'
                          : 'text-gray-700 hover:bg-surface hover:text-primary'
                      }`}
                    >
                      {translations.signIn}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;