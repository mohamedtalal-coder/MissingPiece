import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar } from '../shared/components/Navbar';
import HomePage from '../features/static/HomePage';
import { ProductListPage } from '../features/products/ProductListPage';
import { ProductDetailPage } from '../features/products/ProductDetailPage';
import { CartPage } from '../features/cart/CartPage';
import { AboutPage } from '../features/static/AboutPage';
import { ContactPage } from '../features/static/ContactPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { WishlistPage } from '../features/wishlist/WishlistPage';
import { OrderHistoryPage } from '../features/orders/OrderHistoryPage';
import { ProfilePage } from '../features/account/ProfilePage';
import { AdminOrdersPage } from '../features/orders/AdminOrdersPage';
import { AdminProductsPage } from '../features/products/AdminProductsPage';
import { Truck, Shield, Clock } from 'lucide-react';
import { useLanguage } from '../shared/context/LanguageContext';

import { ToastProvider } from '../shared/context/ToastContext';
import { CartProvider } from '../features/cart/CartContext';
import { WishlistProvider } from '../shared/WishlistContext';
import { ScrollToTop } from '../shared/components/layout/ScrollToTop';

export function App() {
  const { t } = useLanguage();

  return (
    <Router>
      <ScrollToTop />
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between">
              <div>
                <Navbar />

                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductListPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/orders" element={<OrderHistoryPage />} />
                    <Route path="/account" element={<ProfilePage />} />
                    <Route path="/admin/orders" element={<AdminOrdersPage />} />
                    <Route path="/admin/products" element={<AdminProductsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Routes>
                </main>
              </div>

              <footer className="w-full bg-[var(--bg-card)] border-t border-[var(--border-main)] pt-12 pb-8 px-8 font-sans shadow-[0_-4px_30px_rgba(126,34,206,0.15)] mt-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[var(--border-main)]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">🧩</span>
                      <span className="text-base font-serif font-bold text-[var(--text-main)]">
                        Missing Piece
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {t.footer.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#c084fc]">
                      {t.footer.quickLinks}
                    </h4>
                    <ul className="space-y-2 text-xs text-[var(--text-muted)]">
                      <li><Link to="/products" className="hover:text-[var(--text-main)] transition-colors">{t.footer.catalog}</Link></li>
                      <li><Link to="/wishlist" className="hover:text-[var(--text-main)] transition-colors">{t.footer.wishlist}</Link></li>
                      <li><Link to="/orders" className="hover:text-[var(--text-main)] transition-colors">{t.footer.orderHistory}</Link></li>
                      <li><Link to="/account" className="hover:text-[var(--text-main)] transition-colors">{t.footer.profile}</Link></li>
                      <li><Link to="/admin/orders" className="hover:text-[var(--text-main)] transition-colors">{t.footer.admin}</Link></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#c084fc]">
                      {t.footer.customerCare}
                    </h4>
                    <ul className="space-y-2 text-xs text-[var(--text-muted)]">
                      <li><Link to="/about" className="hover:text-[var(--text-main)] transition-colors">{t.footer.about}</Link></li>
                      <li><Link to="/contact" className="hover:text-[var(--text-main)] transition-colors">{t.footer.contact}</Link></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#c084fc]">
                      {t.footer.whyChooseUs}
                    </h4>
                    <div className="space-y-2 text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-[#c084fc]" />
                        <span>{t.footer.shipping}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-[#c084fc]" />
                        <span>{t.footer.quality}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#c084fc]" />
                        <span>{t.footer.support}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-w-7xl mx-auto pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
                  <p>{t.footer.copyright}</p>
                  <div className="flex gap-6">
                    <span className="hover:text-[var(--text-main)] cursor-pointer">{t.footer.privacy}</span>
                    <span className="hover:text-[var(--text-main)] cursor-pointer">{t.footer.terms}</span>
                  </div>
                </div>
              </footer>
            </div>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
