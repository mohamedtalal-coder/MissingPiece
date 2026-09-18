import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { User, MapPin, CheckCircle, Plus, Trash2, Edit2, AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { accountApi, type UserProfile, type Address } from './accountApi';

export function ProfilePage() {
  const { t } = useLanguage() as any;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  // Modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  
  // Address form state
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      const profile = await accountApi.getProfile();
      setUser(profile);
      setName(profile.name || '');
      setEmail(profile.email || '');
      setAddresses(profile.addresses || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveChanges({ name, email, addresses });
  };

  const saveChanges = async (data: { name?: string; email?: string; addresses?: Address[] }) => {
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const updated = await accountApi.updateProfile(data);
      setUser(updated);
      setAddresses(updated.addresses || []);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const openAddAddressModal = () => {
    if (addresses.length >= 10) {
      setError('You can only have up to 10 addresses.');
      return;
    }
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('');
    setEditingAddressIndex(null);
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (index: number) => {
    const addr = addresses[index];
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setCountry(addr.country);
    setEditingAddressIndex(index);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: Address = { street, city, state, zipCode, country };
    let newAddresses = [...addresses];
    
    if (editingAddressIndex !== null) {
      newAddresses[editingAddressIndex] = newAddr;
    } else {
      newAddresses.push(newAddr);
    }
    
    setIsAddressModalOpen(false);
    await saveChanges({ name, email, addresses: newAddresses });
  };

  const handleDeleteAddress = async (index: number) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    await saveChanges({ name, email, addresses: newAddresses });
  };

  if (loading) {
    return <div className="p-8 text-center text-white">Loading profile...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-12 font-sans space-y-8">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="w-20 h-20 rounded-md bg-background border-2 border-[#a855f7] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.5)] relative group">
          <User className="w-10 h-10 text-[#c084fc]" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">{user?.name || 'User'}</h1>
          <p className="text-xs text-[#cbd5e1]">{user?.email}</p>
          {addresses.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#c084fc] mt-1">
              <MapPin className="w-3 h-3" /> {addresses[0].city}{addresses[0].city && addresses[0].country ? ', ' : ''}{addresses[0].country}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details */}
        <div className="lg:col-span-1 bg-background border border-border p-6 rounded-md space-y-6 shadow-[0_0_20px_rgba(126,34,206,0.15)] h-fit">
          <h2 className="text-white font-serif font-bold text-base border-b border-border pb-3">{t.profile?.editDetails || "Personal Info"}</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[#e9d5ff]">{t.profile?.fullName || "Full Name"}</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surfaceElevated border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[#e9d5ff]">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surfaceElevated border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-[#7e22ce] hover:bg-[#a855f7] text-white font-semibold py-2.5 rounded-md shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-colors disabled:opacity-50 mt-4 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Update Details'}
            </button>
          </form>

          <div className="border-t border-border pt-6 mt-6 space-y-4">
            <h2 className="text-white font-serif font-bold text-base">{t.profile?.quickNavigation || "Quick Links"}</h2>
            <div className="space-y-3">
              <Link to="/orders" className="block text-center bg-[#7e22ce]/10 border border-[#7e22ce]/30 text-[#c084fc] py-2.5 rounded-md text-xs hover:bg-[#7e22ce]/20 transition-colors">
                My Orders History
              </Link>
              <Link to="/wishlist" className="block text-center bg-pink-500/10 border border-pink-500/30 text-pink-300 py-2.5 rounded-md text-xs hover:bg-pink-500/20 transition-colors">
                My Wishlist
              </Link>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="lg:col-span-2 bg-background border border-border p-6 rounded-md space-y-6 shadow-[0_0_20px_rgba(126,34,206,0.15)]">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-white font-serif font-bold text-base">Saved Addresses</h2>
            <span className="text-xs text-[#cbd5e1]">{addresses.length}/10</span>
          </div>

          {addresses.length >= 8 && addresses.length < 10 && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs p-3 rounded-md flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>You are approaching the maximum limit of 10 saved addresses.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr, idx) => (
              <div key={idx} className="bg-surfaceElevated border border-border p-4 rounded-md text-sm text-[#cbd5e1] flex flex-col justify-between relative group">
                <div className="space-y-1 mb-4">
                  <p className="text-white font-medium mb-2">Address {idx + 1}</p>
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                  <p>{addr.country}</p>
                </div>
                <div className="flex items-center gap-3 border-t border-border pt-3 mt-auto">
                  <button 
                    onClick={() => openEditAddressModal(idx)}
                    className="text-xs text-[#c084fc] hover:text-[#e9d5ff] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(idx)}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ))}
            
            {addresses.length < 10 && (
              <button 
                onClick={openAddAddressModal}
                className="bg-surfaceElevated/50 hover:bg-surfaceElevated border border-dashed border-border p-4 rounded-md flex flex-col items-center justify-center gap-2 min-h-[140px] text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-6 h-6 text-[#c084fc]" />
                <span className="text-sm font-medium">Add New Address</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-lg max-w-md w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-surfaceElevated/30">
              <h3 className="text-white font-serif font-bold text-lg">
                {editingAddressIndex !== null ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button 
                onClick={() => setIsAddressModalOpen(false)}
                className="text-[#cbd5e1] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveAddress} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="street" className="text-[#e9d5ff]">Street Address</label>
                <input 
                  id="street"
                  type="text" 
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-surfaceElevated border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-[#e9d5ff]">City</label>
                  <input 
                    id="city"
                    type="text" 
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-surfaceElevated border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="state" className="text-[#e9d5ff]">State/Province</label>
                  <input 
                    id="state"
                    type="text" 
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-surfaceElevated border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="zipCode" className="text-[#e9d5ff]">Zip/Postal Code</label>
                  <input 
                    id="zipCode"
                    type="text" 
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full bg-surfaceElevated border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="country" className="text-[#e9d5ff]">Country</label>
                  <input 
                    id="country"
                    type="text" 
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-surfaceElevated border border-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button 
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 bg-surfaceElevated text-white rounded-md hover:bg-surface border border-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#7e22ce] text-white rounded-md hover:bg-[#a855f7] transition-colors shadow-[0_0_10px_rgba(168,85,247,0.3)] cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;