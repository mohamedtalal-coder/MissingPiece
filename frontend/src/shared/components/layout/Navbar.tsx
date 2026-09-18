import { useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Layers,
  Compass,
  Menu,
  X,
  ShieldCheck,
  Sliders,
  User,
  LogOut,
  LogIn,
  Settings,
  Package,
} from 'lucide-react';
import { useCart } from '../../../features/cart/CartContext';
import { useWishlist } from '../../WishlistContext';
import { useAuth } from '../../../features/auth/AuthContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useScrollLock } from '../../hooks/useScrollLock';

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

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useClickOutside(accountRef, () => setAccountOpen(false));
  useScrollLock(mobileOpen);

  const wishlistCount = wishlistItems.length;
  const isAdminRoute = location.pathname.startsWith('/admin');
  const hasActiveOrdersPath =
    location.pathname.startsWith('/orders') && location.pathname !== '/orders';

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    closeMobile();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant/40 bg-surface/90 backdrop-blur-md">
      {/* Announcement bar */}
      <div className="border-b border-outline-variant/20 bg-surface-container-lowest px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-[11px] text-on-surface-variant">
          <div className="hidden sm:flex items-center gap-2 text-primary/90">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-container shrink-0" aria-hidden />
            <span>Lifetime Missing Piece Guarantee</span>
          </div>
          <p className="mx-auto sm:mx-0 text-center tracking-wide">
            Complimentary white-glove shipping on commissions over $80
          </p>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-outline">Copenhagen · San Francisco · Kyoto</span>
            {isAdmin && (
              <>
                <span className="h-2 w-px bg-outline-variant/50" aria-hidden />
                <Link
                  to="/admin/orders"
                  className="text-primary-container hover:text-primary transition-colors inline-flex items-center gap-1 font-medium"
                >
                  <Sliders className="w-3 h-3" aria-hidden />
                  Atelier Vault
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 group select-none shrink-0"
            onClick={closeMobile}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md border border-primary-container/40 bg-gradient-to-br from-surface-container to-surface-container-lowest flex items-center justify-center group-hover:border-primary-container transition-colors">
              <span className="font-headline-sm text-primary-container tracking-widest text-sm sm:text-base font-bold">
                MP
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-headline-sm text-lg sm:text-2xl tracking-tight text-on-surface group-hover:text-primary transition-colors">
                  MissingPiece
                </span>
                <span className="hidden xs:inline text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-surface-container text-primary-container border border-primary-container/20 font-label-caps">
                  Est. 2026
                </span>
              </div>
              <p className="hidden sm:block text-[11px] uppercase tracking-widest text-outline font-label-caps">
                Artisanal Wooden Jigsaw Atelier
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            <NavLink to="/products" className={navLinkClass}>
              <Layers className="w-4 h-4 text-primary-container" aria-hidden />
              The Collection
            </NavLink>
            <NavLink to="/orders" className={navLinkClass}>
              <Compass className="w-4 h-4 text-primary-container" aria-hidden />
              Provenance
              {hasActiveOrdersPath && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary-container/20 text-primary border border-primary-container/30 font-label-caps">
                  Active
                </span>
              )}
            </NavLink>
            <NavLink to="/wishlist" className={navLinkClass}>
              <Heart className="w-4 h-4 text-primary-container" aria-hidden />
              Wishlist
              {wishlistCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-surface-container-high text-on-surface font-label-caps">
                  {wishlistCount}
                </span>
              )}
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <Link
                to={isAdminRoute ? '/products' : '/admin/orders'}
                className={`hidden md:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                  isAdminRoute
                    ? 'border-primary-container bg-primary-container/15 text-primary'
                    : 'border-outline-variant/50 bg-surface-container-low text-on-surface-variant hover:border-outline hover:text-on-surface'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isAdminRoute ? 'bg-primary-container animate-pulse' : 'bg-outline'}`}
                  aria-hidden
                />
                {isAdminRoute ? 'Portal Active' : 'Atelier Portal'}
              </Link>
            )}

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
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold flex items-center justify-center">
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
              <span className="text-xs font-medium hidden sm:inline">Bag</span>
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
                  className="absolute right-0 mt-2 w-56 rounded-lg border border-outline-variant/40 bg-surface-container-lowest py-2 z-50 shadow-xl animate-fade-in"
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
                        Profile
                      </Link>
                      <Link
                        role="menuitem"
                        to="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      >
                        <Package className="w-3.5 h-3.5 text-primary-container" aria-hidden />
                        My Orders
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-error hover:bg-error-container/20 border-t border-outline-variant/30 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" aria-hidden />
                        Sign out
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
                        Sign in
                      </Link>
                      <Link
                        role="menuitem"
                        to="/register"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      >
                        <User className="w-3.5 h-3.5 text-primary-container" aria-hidden />
                        Create account
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
            The Collection
          </NavLink>
          <NavLink to="/orders" onClick={closeMobile} className={navLinkClass}>
            <Compass className="w-4 h-4" aria-hidden />
            Provenance & Tracker
          </NavLink>
          <NavLink to="/wishlist" onClick={closeMobile} className={navLinkClass}>
            <Heart className="w-4 h-4" aria-hidden />
            Curated Wishlist
            {wishlistCount > 0 && (
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high">
                {wishlistCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/about" onClick={closeMobile} className={navLinkClass}>
            About the Craft
          </NavLink>
          <NavLink to="/contact" onClick={closeMobile} className={navLinkClass}>
            Concierge Support
          </NavLink>

          <div className="pt-2 border-t border-outline-variant/30 space-y-1">
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" onClick={closeMobile} className={navLinkClass}>
                  <Settings className="w-4 h-4" aria-hidden />
                  Profile
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-error rounded-lg hover:bg-error-container/20"
                >
                  <LogOut className="w-4 h-4" aria-hidden />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMobile} className={navLinkClass}>
                  <LogIn className="w-4 h-4" aria-hidden />
                  Sign in
                </NavLink>
                <NavLink to="/register" onClick={closeMobile} className={navLinkClass}>
                  Create account
                </NavLink>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin/orders"
                onClick={closeMobile}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs bg-surface-container text-primary-container border border-primary-container/30"
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" aria-hidden />
                  Atelier Management
                </span>
                <span className="text-[10px] uppercase tracking-wider text-outline">Admin</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
