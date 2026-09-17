
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[var(--bg-main)] border-t border-[var(--border-main)] text-[var(--text-main)] pt-16 pb-8 px-8 mt-auto shadow-[0_-4px_25px_rgba(126,34,206,0.15)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[var(--border-main)]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[var(--bg-card)] border border-[#a855f7]/80 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <span className="text-xl">🧩</span>
            </div>

            <span className="text-lg font-serif font-bold bg-primary from-[var(--text-main)] via-[#e9d5ff] to-[#c084fc] bg-clip-text text-transparent">
              Missing Piece
            </span>
          </div>

          <p className="text-xs font-sans text-[var(--text-muted)] leading-relaxed">
            Your ultimate destination for exquisite, high-end puzzles crafted for true connoisseurs and puzzle lovers.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold tracking-wider text-[#e9d5ff] uppercase font-serif">
            Quick Links
          </h3>

          <ul className="space-y-2.5 text-xs font-sans text-[var(--text-muted)]">
            <li>
              <Link
                to="/"
                className="hover:text-[#c084fc] transition-colors"
              >
                Home Page
              </Link>
            </li>

            <li>
              <Link
                to="/products"
                className="hover:text-[#c084fc] transition-colors"
              >
                Puzzle Catalog
              </Link>
            </li>

            <li>
              <Link
                to="/about"
                className="hover:text-[#c084fc] transition-colors"
              >
                About Us
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className="hover:text-[#c084fc] transition-colors"
              >
                Contact Support
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold tracking-wider text-[#e9d5ff] uppercase font-serif">
            Customer Care
          </h3>

          <ul className="space-y-2.5 text-xs font-sans text-[var(--text-muted)]">
            <li>
              <Link
                to="/wishlist"
                className="hover:text-[#c084fc] transition-colors"
              >
                My Wishlist
              </Link>
            </li>

            <li>
              <Link
                to="/orders"
                className="hover:text-[#c084fc] transition-colors"
              >
                Track My Orders
              </Link>
            </li>

            <li>
              <span className="text-[var(--text-muted)]">
                Shipping & Returns
              </span>
            </li>

            <li>
              <span className="text-[var(--text-muted)]">
                Privacy Policy
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold tracking-wider text-[#e9d5ff] uppercase font-serif">
            Why Choose Us
          </h3>

          <ul className="space-y-3 text-xs font-sans text-[var(--text-muted)]">
            <li className="flex items-center gap-2">
              <span className="text-[#c084fc]">✓</span>
              <span>100% Secure Checkout</span>
            </li>

            <li className="flex items-center gap-2">
              <span className="text-[#c084fc]">✓</span>
              <span>Fast Global Shipping</span>
            </li>

            <li className="flex items-center gap-2">
              <span className="text-[#c084fc]">✓</span>
              <span>24/7 Dedicated Support</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col md:flex-row items-center justify-between text-xs font-sans text-[var(--text-muted)] gap-4">
        <p>© 2026 Missing Piece. All rights reserved.</p>

        <p className="flex items-center gap-1">
          Crafted with
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          for Puzzle Lovers
        </p>
      </div>
    </footer>
  );
}

export default Footer;