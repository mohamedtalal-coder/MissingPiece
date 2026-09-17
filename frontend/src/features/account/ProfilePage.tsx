import React, { useState, useEffect } from 'react';
import { User, MapPin, CheckCircle, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const [user, setUser] = useState({ name: '', email: '', location: '', avatar: '' });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (savedUser.name) {
      setUser(savedUser);
    }
  }, []);

  // دالة التعامل مع رفع الصورة من جهاز الكمبيوتر
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUser(prev => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // تحديث البيانات أيضاً في قائمة المستخدمين المسجلين عشان الـ Login يقرأها صح
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = registeredUsers.map((u: any) => u.email === user.email ? user : u);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

    // إرسال حدث لـ النافبار عشان تحدث صورتها فوراً
    window.dispatchEvent(new Event('storage'));

    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 font-sans space-y-8">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="w-20 h-20 rounded-md bg-background border-2 border-[#a855f7] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.5)] relative group">
          {user.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-[#c084fc]" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">{user.name || 'Salma Yehia'}</h1>
          <p className="text-xs text-[#cbd5e1]">{user.email || 'salma@example.com'}</p>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#c084fc] mt-1">
            <MapPin className="w-3 h-3" /> {user.location || 'Cairo, Egypt'}
          </span>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-md flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-background border border-border p-6 rounded-md space-y-6 shadow-[0_0_20px_rgba(126,34,206,0.15)]">
          <h2 className="text-white font-serif font-bold text-base border-b border-border pb-3">Edit Profile Details</h2>
          
          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[#e9d5ff]">Upload Profile Picture from Device</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 bg-[#7e22ce]/20 border border-border text-[#c084fc] hover:bg-[#7e22ce]/30 py-2.5 px-4 rounded-md text-center cursor-pointer transition-colors flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Choose Image File</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[#e9d5ff]">Full Name</label>
              <input 
                type="text" 
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full bg-[#0b0914] border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#e9d5ff]">Location / Region</label>
              <input 
                type="text" 
                value={user.location}
                onChange={(e) => setUser({ ...user, location: e.target.value })}
                className="w-full bg-[#0b0914] border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary from-[#7e22ce] to-[#a855f7] text-white font-semibold py-3 rounded-md shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        </div>

        <div className="bg-background border border-border p-6 rounded-md space-y-6 shadow-[0_0_20px_rgba(126,34,206,0.15)] flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-white font-serif font-bold text-base border-b border-border pb-3">Quick Navigation</h2>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              You can now upload any picture from your PC as your profile avatar! It will update instantly across the entire website navbar.
            </p>
          </div>
          <div className="space-y-3">
            <Link to="/orders" className="block text-center bg-[#7e22ce]/20 border border-border text-[#c084fc] py-3 rounded-md text-xs hover:bg-[#7e22ce]/30 transition-colors">
              View My Orders History
            </Link>
            <Link to="/wishlist" className="block text-center bg-pink-500/10 border border-pink-500/30 text-pink-300 py-3 rounded-md text-xs hover:bg-pink-500/20 transition-colors">
              View My Wishlist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;