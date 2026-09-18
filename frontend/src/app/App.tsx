import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from '../shared/components/layout/RootLayout';
import { ScrollToTop } from '../shared/components/layout/ScrollToTop';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { ToastProvider } from '../shared/context/ToastContext';
import { CartProvider } from '../features/cart/CartContext';
import { WishlistProvider } from '../shared/WishlistContext';

import HomePage from '../features/static/HomePage';
import { AboutPage } from '../features/static/AboutPage';
import { ContactPage } from '../features/static/ContactPage';
import { AdminMessagesPage } from '../features/static/AdminMessagesPage';

import { ProductListPage } from '../features/products/ProductListPage';
import { ProductDetailPage } from '../features/products/ProductDetailPage';
import { AdminProductsPage } from '../features/products/AdminProductsPage';

import { CartPage } from '../features/cart/CartPage';
import { WishlistPage } from '../features/wishlist/WishlistPage';

import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';

import { ProfilePage } from '../features/account/ProfilePage';

import { CheckoutPage } from '../features/orders/CheckoutPage';
import { OrderHistoryPage } from '../features/orders/OrderHistoryPage';
import { OrderDetailPage } from '../features/orders/OrderDetailPage';
import { AdminOrdersPage } from '../features/orders/AdminOrdersPage';

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route element={<RootLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/account" element={<Navigate to="/profile" replace />} />

                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminProductsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/messages"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminMessagesPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
