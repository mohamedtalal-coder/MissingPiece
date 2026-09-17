import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../../features/cart/CartContext';
import { Icon } from '../ui/Icon';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { cart } = useCart();
  const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      {/* Top Banner */}
      <div className="w-full bg-surface-container text-on-surface-variant text-center py-space-xs px-gutter font-label-md text-label-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-space-sm">
          <span>Free shipping on orders over $75</span>
          <span className="text-outline-variant">•</span>
          <span>30-day money-back guarantee</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="w-full bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-7xl mx-auto px-margin lg:px-margin-lg flex items-center justify-between gap-gutter">

          {/* Logo & Navigation */}
          <div className="flex items-center gap-space-lg">
            <Link to="/" className="flex items-center gap-space-sm group">
              <Icon name="spa" className="text-xl text-primary transition-transform group-hover:rotate-12" />
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight">Missing Piece</span>
            </Link>

            <nav className="hidden md:flex items-center gap-space-lg ml-space-md">
              <Link
                to="/"
                className={`font-label-lg text-label-lg transition-colors ${isActive('/') ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Home
              </Link>
              <Link
                to="/products"
                className={`font-label-lg text-label-lg transition-colors ${isActive('/products') ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Catalog
              </Link>
              <Link
                to="/about"
                className={`font-label-lg text-label-lg transition-colors ${isActive('/about') ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`font-label-lg text-label-lg transition-colors ${isActive('/contact') ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-space-md flex-1 max-w-md justify-end">
            <div className="relative w-full max-w-xs hidden sm:block">
              <Icon name="search" className="absolute left-space-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none" />
              <input
                type="search"
                placeholder="Search home goods, ceramics..."
                className="w-full bg-surface-container-low pl-10 pr-space-md py-space-xs rounded font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest transition-colors shadow-sm"
              />
            </div>

            <div className="flex items-center gap-space-sm">
              <Link to="/wishlist" className="relative p-space-xs rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface flex items-center justify-center">
                <Icon name="favorite" className="text-xl" />
              </Link>

              <Link to="/cart" className="relative p-space-xs rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface flex items-center justify-center">
                <Icon name="shopping_bag" className="text-xl" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-container text-on-primary-container font-label-sm text-label-sm w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              <div className="h-6 w-px bg-outline-variant mx-space-xs hidden sm:block"></div>

              <Link to="/account" className="flex items-center gap-space-xs p-space-xs rounded hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface">
                <Icon name="account_circle" className="text-2xl" />
                <span className="font-label-md text-label-md hidden lg:inline-block">Account</span>
              </Link>
            </div>
          </div>

        </div>
      </header>
    </div>
  );
};
