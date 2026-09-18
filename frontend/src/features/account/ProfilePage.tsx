import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { User, MapPin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { accountApi, type UserProfile } from './accountApi';

export function ProfilePage() {
  const { t } = useLanguage() as any;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Just supporting one address to simplify UI
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await accountApi.getProfile();
      setUser(profile);
      setName(profile.name || '');
      setEmail(profile.email || '');
      if (profile.addresses && profile.addresses.length > 0) {
        const addr = profile.addresses[0];
        setStreet(addr.street || '');
        setCity(addr.city || '');
        setState(addr.state || '');
        setZipCode(addr.zipCode || '');
        setCountry(addr.country || '');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const addresses = street ? [{ street, city, state, zipCode, country }] : [];
      const updated = await accountApi.updateProfile({ name, email, addresses });
      setUser(updated);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-white">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 font-sans space-y-8">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="w-20 h-20 rounded-md bg-background border-2 border-[#a855f7] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.5)] relative group">
          <User className="w-10 h-10 text-[#c084fc]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">{user?.name || 'User'}</h1>
          <p className="text-xs text-[#cbd5e1]">{user?.email}</p>
          {(city || country) && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#c084fc] mt-1">
              <MapPin className="w-3 h-3" /> {city}{city && country ? ', ' : ''}{country}
            </span>
          )}
        </div>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-md flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs p-3 rounded-md flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-background border border-border p-6 rounded-md space-y-6 shadow-[0_0_20px_rgba(126,34,206,0.15)]">
          <h2 className="text-white font-serif font-bold text-base border-b border-border pb-3">{t.profile?.editDetails || "Edit Profile Details"}</h2>
          
          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[#e9d5ff]">{t.profile?.fullName || "Full Name"}</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0b0914] border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[#e9d5ff]">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b0914] border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>
            
            <h3 className="text-white font-medium mt-4 mb-2">Address</h3>

            <div className="space-y-1.5">
              <label className="text-[#e9d5ff]">Street</label>
              <input 
                type="text" 
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-[#0b0914] border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[#e9d5ff]">City</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#0b0914] border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[#e9d5ff]">State/Province</label>
                <input 
                  type="text" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-[#0b0914] border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[#e9d5ff]">Zip Code</label>
                <input 
                  type="text" 
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full bg-[#0b0914] border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[#e9d5ff]">Country</label>
                <input 
                  type="text" 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#0b0914] border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary from-[#7e22ce] to-[#a855f7] text-white font-semibold py-3 rounded-md shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer mt-4"
            >
              Save Changes
            </button>
          </form>
        </div>

        <div className="bg-background border border-border p-6 rounded-md space-y-6 shadow-[0_0_20px_rgba(126,34,206,0.15)] flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-white font-serif font-bold text-base border-b border-border pb-3">{t.profile?.quickNavigation || "Quick Navigation"}</h2>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Manage your orders and saved items.
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