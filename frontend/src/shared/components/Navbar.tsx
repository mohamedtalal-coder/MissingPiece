import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, LogOut, Settings, Package } from 'lucide-react';

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const navigate = useNavigate();

  // تحديث بيانات المستخدم فوراً من localStorage
  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setIsDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="w-full bg-[#0b0914] border-b border-[#221738] px-8 py-4 sticky top-0 z-50 shadow-[0_4px_25px_rgba(126,34,206,0.2)] backdrop-blur-md font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* اللوجو */}
        <div className="flex items-center gap-3.5">
          <Link to="/" className="text-xl font-serif font-extrabold tracking-wider bg-gradient-to-r from-white via-[#e9d5ff] to-[#c084fc] bg-clip-text text-transparent">
            Missing Piece
          </Link>
        </div>

        {/* الروابط الأساسية */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#cbd5e1]">
          <Link to="/" className="hover:text-[#c084fc] transition-colors">Home</Link>
          <Link to="/products" className="hover:text-[#c084fc] transition-colors">Catalog</Link>
          <Link to="/wishlist" className="hover:text-[#c084fc] transition-colors flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span>Wishlist</span>
          </Link>
          <Link to="/orders" className="hover:text-[#c084fc] transition-colors flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-[#c084fc]" />
            <span>My Orders</span>
          </Link>
          <Link to="/admin/orders" className="hover:text-[#c084fc] transition-colors">Admin Portal</Link>
        </div>

        {/* اليمين: السلة والبروفايل */}
        <div className="flex items-center gap-4 relative">
          <Link to="/cart" className="bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cart</span>
          </Link>

          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 rounded-full bg-[#130e21] border border-[#a855f7]/60 flex items-center justify-center text-[#e9d5ff] hover:border-[#c084fc] shadow-[0_0_10px_rgba(168,85,247,0.3)] cursor-pointer overflow-hidden"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-[#c084fc]" />
              )}
            </button>

            {/* القائمة المنسدلة */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#130e21] border border-[#7e22ce]/50 rounded-2xl shadow-[0_0_25px_rgba(126,34,206,0.3)] py-2 z-50 text-xs">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-[#7e22ce]/30">
                      <p className="text-white font-bold">{user.name}</p>
                      <p className="text-[10px] text-[#cbd5e1] truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {/* زرار الانتقال لصفحة البروفايل وتعديل البيانات والصورة */}
                      <Link 
                        to="/account" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[#cbd5e1] hover:bg-[#7e22ce]/20 hover:text-white transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#c084fc]" />
                        <span>Manage Profile & Avatar</span>
                      </Link>

                      <Link 
                        to="/wishlist" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[#cbd5e1] hover:bg-[#7e22ce]/20 hover:text-white transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-pink-400" />
                        <span>My Wishlist</span>
                      </Link>

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer border-t border-[#7e22ce]/20 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-1">
                    <Link 
                      to="/register" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2.5 text-[#cbd5e1] hover:bg-[#7e22ce]/20 hover:text-white"
                    >
                      Create Account
                    </Link>
                    <Link 
                      to="/login" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2.5 text-[#cbd5e1] hover:bg-[#7e22ce]/20 hover:text-white"
                    >
                      Sign In
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