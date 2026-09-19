import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import App from '../../app/App';
import { ThemeProvider } from '../../shared/context/ThemeContext';
import { LanguageProvider } from '../../shared/context/LanguageContext';

vi.mock('../../features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

vi.mock('../../features/cart/CartContext', () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => children,
  useCart: () => ({ cart: [], isLoading: false }),
}));

vi.mock('../../shared/WishlistContext', () => ({
  WishlistProvider: ({ children }: { children: React.ReactNode }) => children,
  useWishlist: () => ({ wishlist: [], wishlistItems: [], isLoading: false }),
}));

describe('Application routing', () => {
  it('renders the public home route without throwing', () => {
    window.history.pushState({}, '', '/');
    render(<LanguageProvider><ThemeProvider><App /></ThemeProvider></LanguageProvider>);

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('redirects a protected route to login when unauthenticated', () => {
    window.history.pushState({}, '', '/profile');
    render(<LanguageProvider><ThemeProvider><App /></ThemeProvider></LanguageProvider>);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });
});
