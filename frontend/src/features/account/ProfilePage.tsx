import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { useToast } from '../../shared/context/ToastContext';
import { Icon } from '../../shared/components/ui/Icon';
import { Button } from '../../shared/components/ui/Button';
import { Link } from 'react-router-dom';
import { accountApi, type UserProfile, type Address } from './accountApi';
import { useScrollLock } from '../../shared/hooks/useScrollLock';

function sanitize(value: string, max: number): string {
  return value.replace(/[<>]/g, '').trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ProfileSkeleton() {
  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg space-y-6" aria-busy="true">
      <div className="h-24 rounded-xl animate-shimmer" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 h-64 rounded-xl animate-shimmer" />
        <div className="lg:col-span-8 h-64 rounded-xl animate-shimmer" />
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { t } = useLanguage() as any;
  const { showToast } = useToast();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [addressError, setAddressError] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useScrollLock(isAddressModalOpen);

  const loadProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      const profile = await accountApi.getProfile();
      setUser(profile);
      setName(profile.name || '');
      setEmail(profile.email || '');
      setAddresses(profile.addresses || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t.profile?.loadError || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitize(name, 80);
    const cleanEmail = sanitize(email, 254).toLowerCase();
    if (cleanName.length < 2) {
      setError(t.profile?.nameLengthError || 'Name must be at least 2 characters.');
      return;
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      setError(t.profile?.emailError || 'Please enter a valid email address.');
      return;
    }
    await saveChanges({ name: cleanName, email: cleanEmail, addresses });
  };

  const saveChanges = async (data: { name?: string; email?: string; addresses?: Address[] }) => {
    setError(null);
    setSaving(true);
    try {
      const updated = await accountApi.updateProfile(data);
      setUser(updated);
      setName(updated.name || '');
      setEmail(updated.email || '');
      setAddresses(updated.addresses || []);
      showToast({ message: t.profile?.updateSuccess || 'Profile updated', type: 'success' });
    } catch (err) {
      console.error(err);
      setError(t.profile?.updateError || 'Failed to update profile');
      showToast({ message: t.profile?.updateError || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const openAddAddressModal = () => {
    if (addresses.length >= 10) {
      setError(t.profile?.maxAddresses || 'You can only have up to 10 addresses.');
      return;
    }
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('');
    setAddressError('');
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
    setAddressError('');
    setEditingAddressIndex(index);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: Address = {
      street: sanitize(street, 120),
      city: sanitize(city, 80),
      state: sanitize(state, 80),
      zipCode: sanitize(zipCode, 20),
      country: sanitize(country, 80),
    };

    if (
      newAddr.street.length < 3 ||
      newAddr.city.length < 2 ||
      newAddr.state.length < 2 ||
      newAddr.zipCode.length < 2 ||
      newAddr.country.length < 2
    ) {
      setAddressError(t.profile?.addressIncomplete || 'Please complete all address fields.');
      return;
    }

    let newAddresses = [...addresses];
    if (editingAddressIndex !== null) {
      newAddresses[editingAddressIndex] = newAddr;
    } else {
      newAddresses.push(newAddr);
    }

    setIsAddressModalOpen(false);
    await saveChanges({ name: sanitize(name, 80), email: sanitize(email, 254).toLowerCase(), addresses: newAddresses });
  };

  const handleDeleteAddress = async (index: number) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    await saveChanges({
      name: sanitize(name, 80),
      email: sanitize(email, 254).toLowerCase(),
      addresses: newAddresses,
    });
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <main className="w-full bg-surface min-h-[70vh] selection:bg-primary-container selection:text-on-primary-container">
      <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg mb-space-lg border-b border-surface-container-highest gap-space-md animate-fade-in">
          <div className="flex items-center gap-space-md">
            <div className="w-20 h-20 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden shadow-sm">
              <span className="font-headline-lg text-headline-lg text-primary uppercase">
                {user?.name?.substring(0, 2) || 'CV'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                  {t.profile?.memberProfile || 'Member Profile'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  {t.profile?.masterCollector || 'Master Collector'}
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                {user?.name || t.profile?.guest || 'Guest'}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{user?.email}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-body-sm text-on-surface-variant">
            {addresses.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Icon name="location_on" className="text-[16px] text-primary" />
                <span>
                  {addresses[0].city}, {addresses[0].country}
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div
            className="bg-error-container/20 border border-error-container/40 text-error p-space-md rounded-xl flex items-center gap-space-sm mb-space-lg shadow-sm"
            role="alert"
          >
            <Icon name="error" className="text-[20px] shrink-0" />
            <span className="font-body-sm text-body-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            <section className="bg-surface-container-low border border-outline-variant/10 p-space-lg rounded-xl shadow-sm">
              <h2 className="text-on-surface font-title-editorial text-title-editorial border-b border-outline-variant/20 pb-space-sm mb-space-md flex items-center gap-2">
                <Icon name="person" className="text-primary text-[20px]" />
                {t.profile?.editDetails || 'Personal Details'}
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-space-md font-body-sm" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="profile-name">
                    {t.profile?.fullName || 'Full Name'}
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container border border-transparent rounded-lg px-space-md py-2.5 text-on-surface focus:outline-none focus:bg-surface-container-high focus:border-outline-variant/30 transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="profile-email">
                    {t.profile?.emailAddress || 'Email Address'}
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container border border-transparent rounded-lg px-space-md py-2.5 text-on-surface focus:outline-none focus:bg-surface-container-high focus:border-outline-variant/30 transition-colors"
                    required
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" disabled={saving} isLoading={saving} className="w-full mt-2" icon="save">
                  {t.profile?.saveProfile || 'Save Profile'}
                </Button>
              </form>
            </section>

            <section className="bg-surface-container-low border border-outline-variant/10 p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <h2 className="text-on-surface font-title-editorial text-title-editorial border-b border-outline-variant/20 pb-space-sm flex items-center gap-2">
                <Icon name="link" className="text-primary text-[20px]" />
                {t.profile?.quickNavigation || 'Quick Links'}
              </h2>
              <div className="flex flex-col gap-2">
                <Link
                  to="/orders"
                  className="flex items-center gap-3 px-space-md py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors border border-transparent hover:border-outline-variant/20"
                >
                  <Icon name="receipt_long" className="text-primary text-[20px]" />
                  <span>{t.profile?.myCommissions || 'My Commissions'}</span>
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 px-space-md py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors border border-transparent hover:border-outline-variant/20"
                >
                  <Icon name="favorite" className="text-primary text-[20px]" />
                  <span>{t.profile?.curatedWishlist || 'Curated Wishlist'}</span>
                </Link>
              </div>
            </section>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <section className="bg-surface-container-low border border-outline-variant/10 p-space-lg rounded-xl shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm mb-space-md">
                <h2 className="text-on-surface font-title-editorial text-title-editorial flex items-center gap-2">
                  <Icon name="home_work" className="text-primary text-[20px]" />
                  {t.profile?.dispatchDestinations || 'Dispatch Destinations'}
                </h2>
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  {t.profile?.ofTotal ? t.profile.ofTotal.replace('{{count}}', addresses.length.toString()) : `${addresses.length} of 10`}
                </span>
              </div>

              {addresses.length >= 8 && addresses.length < 10 && (
                <div className="bg-secondary-container/20 border border-secondary-container/30 text-secondary text-body-sm p-3 rounded-md flex items-center gap-2 mb-4">
                  <Icon name="warning" className="text-[18px] shrink-0" />
                  <span>{t.profile?.limitWarning || 'You are approaching the maximum limit of 10 saved addresses.'}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {addresses.map((addr, idx) => (
                  <div
                    key={`${addr.street}-${idx}`}
                    className="bg-surface-container border border-outline-variant/10 p-space-md rounded-lg flex flex-col justify-between hover:bg-surface-container-high transition-colors group"
                  >
                    <div className="flex flex-col gap-1 mb-4 font-body-sm text-body-sm text-on-surface-variant">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-on-surface font-label-md text-label-md uppercase tracking-wider">
                          {t.profile?.destination ? t.profile.destination.replace('{{count}}', (idx + 1).toString()) : `Destination ${idx + 1}`}
                        </p>
                        {idx === 0 && (
                          <span className="bg-primary/20 text-primary font-label-caps text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                            {t.profile?.primary || 'Primary'}
                          </span>
                        )}
                      </div>
                      <p className="text-on-surface font-medium">{addr.street}</p>
                      <p>
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <p>{addr.country}</p>
                    </div>
                    <div className="flex items-center gap-4 border-t border-outline-variant/20 pt-3 mt-auto">
                      <Button
                        onClick={() => openEditAddressModal(idx)}
                        variant="ghost"
                        size="sm"
                        icon="edit"
                        className="text-primary hover:text-primary-fixed"
                      >
                        {t.profile?.edit || 'Edit'}
                      </Button>
                      <Button
                        onClick={() => handleDeleteAddress(idx)}
                        variant="ghost"
                        size="sm"
                        icon="delete"
                        className="text-error hover:text-error/80"
                        disabled={saving}
                      >
                        {t.profile?.remove || 'Remove'}
                      </Button>
                    </div>
                  </div>
                ))}

                {addresses.length < 10 && (
                  <button
                    type="button"
                    onClick={openAddAddressModal}
                    className="bg-surface-container-lowest hover:bg-surface-container border border-dashed border-outline-variant/40 p-space-lg rounded-lg flex flex-col items-center justify-center gap-2 min-h-[160px] text-on-surface-variant hover:text-primary transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-container-high group-hover:bg-primary-container text-on-surface-variant group-hover:text-primary flex items-center justify-center transition-colors">
                      <Icon name="add" className="text-[24px]" />
                    </div>
                    <span className="font-label-md text-label-md uppercase tracking-wider">{t.profile?.addDestination || 'Add New Destination'}</span>
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {isAddressModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => !saving && setIsAddressModalOpen(false)}
        >
          <div
            className="bg-surface-container-low border border-outline-variant/30 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-modal-title"
          >
            <div className="flex items-center justify-between p-space-md border-b border-outline-variant/20">
              <div>
                <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
                  {editingAddressIndex !== null ? (t.profile?.update || 'Update') : (t.profile?.new || 'New')}
                </span>
                <h3 id="address-modal-title" className="font-headline-sm text-headline-sm text-on-surface">
                  {t.profile?.dispatchAddress || 'Dispatch Address'}
                </h3>
              </div>
              <Button
                onClick={() => setIsAddressModalOpen(false)}
                variant="ghost"
                icon="close"
                aria-label="Close"
                disabled={saving}
              />
            </div>

            <form onSubmit={handleSaveAddress} className="p-space-lg space-y-space-md font-body-sm" noValidate>
              {addressError && (
                <p className="text-sm text-error" role="alert">
                  {addressError}
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="street" className="font-label-md text-label-md text-on-surface-variant">
                  {t.profile?.streetAddress || 'Street Address'} <span className="text-primary">*</span>
                </label>
                <input
                  id="street"
                  type="text"
                  required
                  maxLength={120}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full bg-surface-container rounded-lg px-space-md py-2.5 text-on-surface focus:outline-none focus:bg-surface-container-high transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="city" className="font-label-md text-label-md text-on-surface-variant">
                    {t.profile?.city || 'City'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    maxLength={80}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-surface-container rounded-lg px-space-md py-2.5 text-on-surface focus:outline-none focus:bg-surface-container-high transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="state" className="font-label-md text-label-md text-on-surface-variant">
                    {t.profile?.stateProvince || 'State/Province'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="state"
                    type="text"
                    required
                    maxLength={80}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-surface-container rounded-lg px-space-md py-2.5 text-on-surface focus:outline-none focus:bg-surface-container-high transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="zipCode" className="font-label-md text-label-md text-on-surface-variant">
                    {t.profile?.zipCode || 'Zip/Postal Code'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="zipCode"
                    type="text"
                    required
                    maxLength={20}
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full bg-surface-container rounded-lg px-space-md py-2.5 text-on-surface focus:outline-none focus:bg-surface-container-high transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="country" className="font-label-md text-label-md text-on-surface-variant">
                    {t.profile?.country || 'Country'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="country"
                    type="text"
                    required
                    maxLength={80}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-surface-container rounded-lg px-space-md py-2.5 text-on-surface focus:outline-none focus:bg-surface-container-high transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-space-md mt-space-md border-t border-outline-variant/20">
                <Button type="button" onClick={() => setIsAddressModalOpen(false)} variant="ghost" disabled={saving}>
                  {t.profile?.cancel || 'Cancel'}
                </Button>
                <Button type="submit" icon="check" isLoading={saving}>
                  {t.profile?.save || 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProfilePage;
