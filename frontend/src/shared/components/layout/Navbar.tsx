import { useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Layers,
  Menu,
  X,
  User,
  LogOut,
  LogIn,
  Settings,
  Package,
  Sun,
  Moon,
  Globe,
  LayoutDashboard,
} from 'lucide-react';
import { useCart } from '../../../features/cart/CartContext';
import { useWishlist } from '../../WishlistContext';
import { useAuth } from '../../../features/auth/AuthContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import logo from '../../../assets/Logo.png';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative px-3.5 py-2 text-sm font-medium transition-all rounded-lg flex items-center gap-2 ${
    isActive
      ? 'text-on-surface bg-surface-container border border-outline-variant/50'
      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
  }`;

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, language, toggleLanguage } = useLanguage() as any;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useClickOutside(accountRef, () => setAccountOpen(false));
  useScrollLock(mobileOpen);

  const wishlistCount = wishlistItems.length;

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    closeMobile();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant/40 bg-surface/90 backdrop-blur-md">

      {/* Main row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          <Link
            to="/"
            className="flex items-center group select-none shrink-0"
            onClick={closeMobile}
          >
            <img
              src={logo}
              alt="MissingPiece"
              className="h-16 sm:h-20 w-auto max-w-[190px] sm:max-w-[240px] object-contain object-left transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label={t?.common?.primaryNav || "Primary Navigation"}>
            <NavLink to="/products" className={navLinkClass}>
              <Layers className="w-4 h-4 text-primary-container" aria-hidden />
              {t.nav?.collection || 'The Collection'}
            </NavLink>
            <NavLink to="/bespoke" className={navLinkClass}>
              {t.nav?.bespoke || 'Bespoke'}
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              {t.nav?.about || 'About Us'}
            </NavLink>
            <NavLink to="/faq" className={navLinkClass}>
              {t.nav?.faq || 'FAQ'}
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              {t.nav?.contact || 'Contact'}
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">

            <Link
              to="/wishlist"
              aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ''}`}
              className={`relative p-2 sm:p-2.5 rounded-lg border transition-all ${
                location.pathname === '/wishlist'
                  ? 'border-primary-container/60 bg-surface-container text-primary'
                  : 'border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:border-outline'
              }`}
            >
              <Heart className="w-5 h-5" aria-hidden />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -end-1 min-w-4 h-4 px-0.5 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              aria-label={`Cart${cartItemCount ? `, ${cartItemCount} items` : ''}`}
              className={`flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg border transition-all ${
                location.pathname === '/cart'
                  ? 'border-primary-container bg-primary-container/10 text-primary'
                  : 'border-outline-variant/40 bg-surface-container-low text-on-surface hover:border-primary-container/50'
              }`}
            >
              <ShoppingBag className="w-5 h-5 text-primary-container" aria-hidden />
              <span className="text-xs font-medium hidden sm:inline">{t.nav?.bag || 'Bag'}</span>
              <span
                className={`min-w-5 h-5 px-1 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  cartItemCount > 0
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-outline'
                }`}
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            </Link>

            <button
              type="button"
              onClick={toggleLanguage}
              className="hidden sm:flex relative p-2 sm:p-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:border-outline transition-all items-center justify-center gap-1.5"
              aria-label={`Switch to ${language === 'en' ? 'Arabic' : 'English'}`}
            >
              <Globe className="w-5 h-5" aria-hidden />
              <span className="text-[10px] font-bold uppercase leading-none">{language}</span>
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={theme === 'dark'}
              onClick={toggleTheme}
              className="hidden sm:flex relative p-2 sm:p-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:border-outline transition-all items-center justify-center"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" aria-hidden /> : <Moon className="w-5 h-5" aria-hidden />}
            </button>

            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                type="button"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-controls={menuId}
                onClick={() => setAccountOpen((o) => !o)}
                className="w-10 h-10 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:border-outline flex items-center justify-center transition-colors"
              >
                <User className="w-4 h-4" aria-hidden />
              </button>
              {accountOpen && (
                <div
                  id={menuId}
                  role="menu"
                  className="absolute end-0 mt-2 w-56 rounded-lg border border-outline-variant/40 bg-surface-container-lowest py-2 z-50 shadow-xl animate-fade-in"
                >
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-3 border-b border-outline-variant/30">
                        <p className="font-medium text-on-surface text-sm truncate">{user.name}</p>
                        <p className="text-[11px] text-outline truncate">{user.email}</p>
                      </div>
                      <Link
                        role="menuitem"
                        to="/profile"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      >
                        <Settings className="w-3.5 h-3.5 text-primary-container" aria-hidden />
                        {t.nav?.profile || 'Profile'}
                      </Link>
                      <Link
                        role="menuitem"
                        to="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      >
                        <Package className="w-3.5 h-3.5 text-primary-container" aria-hidden />
                        {t.nav?.myOrders || 'My Orders'}
                      </Link>
                      {isAdmin && (
                        <Link
                          role="menuitem"
                          to="/admin/orders"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-t border-outline-variant/20"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-primary-container" aria-hidden />
                          {t.nav?.adminPanel || 'Admin Panel'}
                        </Link>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error-container/20 border-t border-outline-variant/30 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" aria-hidden />
                        {t.nav?.signOut || 'Sign out'}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        role="menuitem"
                        to="/login"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      >
                        <LogIn className="w-3.5 h-3.5 text-primary-container" aria-hidden />
                        {t.nav?.signIn || 'Sign in'}
                      </Link>
                      <Link
                        role="menuitem"
                        to="/register"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      >
                        <User className="w-3.5 h-3.5 text-primary-container" aria-hidden />
                        {t.nav?.createAccount || 'Create account'}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              className="lg:hidden p-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface-variant"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden border-t border-outline-variant/30 bg-surface-container-low px-4 pt-3 pb-5 space-y-1 animate-slide-down"
        >
          <NavLink to="/products" onClick={closeMobile} className={navLinkClass}>
            <Layers className="w-4 h-4" aria-hidden />
            {t.nav?.collection || 'The Collection'}
          </NavLink>
          <NavLink to="/bespoke" onClick={closeMobile} className={navLinkClass}>
            {t.nav?.bespoke || 'Bespoke'}
          </NavLink>
          <NavLink to="/about" onClick={closeMobile} className={navLinkClass}>
            {t.nav?.about || 'About Us'}
          </NavLink>
          <NavLink to="/faq" onClick={closeMobile} className={navLinkClass}>
            {t.nav?.faq || 'FAQ'}
          </NavLink>
          <NavLink to="/contact" onClick={closeMobile} className={navLinkClass}>
            {t.nav?.conciergeSupport || 'Concierge Support'}
          </NavLink>

          <div className="pt-2 border-t border-outline-variant/30 space-y-1">
            <button
              type="button"
              onClick={toggleLanguage}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" aria-hidden />
              {language === 'en' ? 'العربية (Arabic)' : 'English'}
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={theme === 'dark'}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden /> : <Moon className="w-4 h-4" aria-hidden />}
              {theme === 'dark' ? (t.nav?.lightMode || 'Light Mode') : (t.nav?.darkMode || 'Dark Mode')}
            </button>
            
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" onClick={closeMobile} className={navLinkClass}>
                  <Settings className="w-4 h-4" aria-hidden />
                  {t.nav?.profile || 'Profile'}
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-error rounded-lg hover:bg-error-container/20"
                >
                  <LogOut className="w-4 h-4" aria-hidden />
                  {t.nav?.signOut || 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMobile} className={navLinkClass}>
                  <LogIn className="w-4 h-4" aria-hidden />
                  {t.nav?.signIn || 'Sign in'}
                </NavLink>
                <NavLink to="/register" onClick={closeMobile} className={navLinkClass}>
                  {t.nav?.createAccount || 'Create account'}
                </NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink
                to="/admin/orders"
                onClick={closeMobile}
                className={navLinkClass}
              >
                <LayoutDashboard className="w-4 h-4 text-primary-container" aria-hidden />
                {t.nav?.adminPanel || 'Admin Panel'}
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
