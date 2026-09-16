import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar } from '../shared/components/Navbar';
import HomePage from '../features/static/HomePage';
import ProductListPage from '../features/products/ProductListPage';
import ProductDetailPage from '../features/products/ProductDetailPage';
import CartPage from '../features/cart/CartPage';
import { AboutPage } from '../features/static/AboutPage';
import { ContactPage } from '../features/static/ContactPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { WishlistPage } from '../features/wishlist/WishlistPage';
import { OrderHistoryPage } from '../features/orders/OrderHistoryPage';
import { ProfilePage } from '../features/account/ProfilePage';
import { AdminOrdersPage } from '../features/orders/AdminOrdersPage';
import { Truck, Shield, Clock } from 'lucide-react';

export function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0b0914] text-white flex flex-col justify-between">
        <div>
          <Navbar />
          
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/orders" element={<OrderHistoryPage />} />
              <Route path="/account" element={<ProfilePage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>
        </div>

        {/* الفوتر العام */}
        <footer className="w-full bg-[#130e21] border-t border-[#7e22ce]/50 pt-12 pb-8 px-8 font-sans shadow-[0_-4px_30px_rgba(126,34,206,0.15)] mt-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#7e22ce]/30">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🧩</span>
                <span className="text-base font-serif font-bold text-white">Missing Piece</span>
              </div>
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                Your premier destination for exquisite, high-end puzzles crafted for true connoisseurs.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#c084fc]">Quick Links</h4>
              <ul className="space-y-2 text-xs text-[#cbd5e1]">
                <li><Link to="/products" className="hover:text-white transition-colors">Catalog Collection</Link></li>
                <li><Link to="/wishlist" className="hover:text-white transition-colors">My Wishlist</Link></li>
                <li><Link to="/orders" className="hover:text-white transition-colors">Order History</Link></li>
                <li><Link to="/account" className="hover:text-white transition-colors">My Profile</Link></li>
                <li><Link to="/admin/orders" className="hover:text-white transition-colors">Admin Portal</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#c084fc]">Customer Care</h4>
              <ul className="space-y-2 text-xs text-[#cbd5e1]">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#c084fc]">Why Choose Us</h4>
              <div className="space-y-2 text-xs text-[#cbd5e1]">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#c084fc]" />
                  <span>Fast & Secure Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#c084fc]" />
                  <span>100% Quality Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#c084fc]" />
                  <span>24/7 Customer Support</span>
                </div>
              </div>
            </div>

          </div>

          <div className="max-w-7xl mx-auto pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#94a3b8] gap-4">
            <p>© 2026 Missing Piece. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
}

export default App; // 👈 ده السطر اللي كان ناقص وحل الإيرور نهائياً