import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { useToast } from '../../shared/context/ToastContext';
import { Icon } from '../../shared/components/ui/Icon';
import { Button } from '../../shared/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { accountApi, type UserProfile, type Address } from './accountApi';
import { useAuth } from '../auth/AuthContext';
import { useScrollLock } from '../../shared/hooks/useScrollLock';

// ── All countries list (shared with CheckoutPage) ──────────────────────────
const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' }, { code: 'AL', name: 'Albania' }, { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' }, { code: 'AO', name: 'Angola' }, { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' }, { code: 'AM', name: 'Armenia' }, { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' }, { code: 'AZ', name: 'Azerbaijan' }, { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' }, { code: 'BD', name: 'Bangladesh' }, { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' }, { code: 'BE', name: 'Belgium' }, { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' }, { code: 'BT', name: 'Bhutan' }, { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' }, { code: 'BW', name: 'Botswana' }, { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' }, { code: 'BG', name: 'Bulgaria' }, { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' }, { code: 'CV', name: 'Cabo Verde' }, { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' }, { code: 'CA', name: 'Canada' }, { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' }, { code: 'CL', name: 'Chile' }, { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' }, { code: 'KM', name: 'Comoros' }, { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' }, { code: 'HR', name: 'Croatia' }, { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' }, { code: 'CZ', name: 'Czech Republic' }, { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' }, { code: 'DM', name: 'Dominica' }, { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' }, { code: 'EG', name: 'Egypt' }, { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' }, { code: 'ER', name: 'Eritrea' }, { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' }, { code: 'ET', name: 'Ethiopia' }, { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' }, { code: 'FR', name: 'France' }, { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' }, { code: 'GE', name: 'Georgia' }, { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' }, { code: 'GR', name: 'Greece' }, { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' }, { code: 'GN', name: 'Guinea' }, { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' }, { code: 'HT', name: 'Haiti' }, { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' }, { code: 'IS', name: 'Iceland' }, { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' }, { code: 'IR', name: 'Iran' }, { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' }, { code: 'IL', name: 'Israel' }, { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' }, { code: 'JP', name: 'Japan' }, { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' }, { code: 'KE', name: 'Kenya' }, { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' }, { code: 'KG', name: 'Kyrgyzstan' }, { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' }, { code: 'LB', name: 'Lebanon' }, { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' }, { code: 'LY', name: 'Libya' }, { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' }, { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' }, { code: 'MY', name: 'Malaysia' }, { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' }, { code: 'MT', name: 'Malta' }, { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' }, { code: 'MU', name: 'Mauritius' }, { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' }, { code: 'MD', name: 'Moldova' }, { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' }, { code: 'ME', name: 'Montenegro' }, { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' }, { code: 'MM', name: 'Myanmar' }, { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' }, { code: 'NP', name: 'Nepal' }, { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' }, { code: 'NI', name: 'Nicaragua' }, { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' }, { code: 'NO', name: 'Norway' }, { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' }, { code: 'PW', name: 'Palau' }, { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' }, { code: 'PY', name: 'Paraguay' }, { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' }, { code: 'PL', name: 'Poland' }, { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' }, { code: 'RO', name: 'Romania' }, { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' }, { code: 'KN', name: 'Saint Kitts and Nevis' }, { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' }, { code: 'WS', name: 'Samoa' }, { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' }, { code: 'SA', name: 'Saudi Arabia' }, { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' }, { code: 'SC', name: 'Seychelles' }, { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' }, { code: 'SK', name: 'Slovakia' }, { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' }, { code: 'SO', name: 'Somalia' }, { code: 'ZA', name: 'South Africa' },
  { code: 'SS', name: 'South Sudan' }, { code: 'ES', name: 'Spain' }, { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' }, { code: 'SR', name: 'Suriname' }, { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' }, { code: 'SY', name: 'Syria' }, { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' }, { code: 'TZ', name: 'Tanzania' }, { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' }, { code: 'TG', name: 'Togo' }, { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' }, { code: 'TN', name: 'Tunisia' }, { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' }, { code: 'TV', name: 'Tuvalu' }, { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' }, { code: 'AE', name: 'United Arab Emirates' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' }, { code: 'UY', name: 'Uruguay' }, { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' }, { code: 'VE', name: 'Venezuela' }, { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' }, { code: 'ZM', name: 'Zambia' }, { code: 'ZW', name: 'Zimbabwe' },
];

const ZIP_RE = /^[a-zA-Z0-9\s-]{3,20}$/;

function sanitize(value: string, max: number): string {
  return value.replace(/[<>]/g, '').trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-field address error state
interface AddressFieldErrors {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

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
  const { updateUser: updateAuthUser, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // We keep the FULL address list (including soft-deleted ones) locally
  // so the server can persist deletedAt. The UI only shows non-deleted ones.
  const [allAddresses, setAllAddresses] = useState<Address[]>([]);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Address form fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('US');
  const [addrErrors, setAddrErrors] = useState<AddressFieldErrors>({});

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useScrollLock(isAddressModalOpen);

  // Active (non-deleted) addresses for display
  const activeAddresses = allAddresses.filter((a) => !a.deletedAt);

  const loadProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      const profile = await accountApi.getProfile();
      setUser(profile);
      setName(profile.name || '');
      setEmail(profile.email || '');
      // getProfile already filters deleted ones via backend,
      // but we keep full list locally for soft-delete mutations.
      setAllAddresses(profile.addresses || []);
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
    await saveChanges({ name: cleanName, email: cleanEmail, addresses: allAddresses });
  };

  const saveChanges = async (data: { name?: string; email?: string; addresses?: Address[] }) => {
    setError(null);
    setSaving(true);
    try {
      const updated = await accountApi.updateProfile(data);
      setUser(updated);
      setName(updated.name || '');
      setEmail(updated.email || '');
      setAllAddresses(updated.addresses || []);
      showToast({ message: t.profile?.updateSuccess || 'Profile updated', type: 'success' });
    } catch (err: any) {
      console.error(err);
      const serverErrors = err?.response?.data?.errors;
      const message = (serverErrors && Array.isArray(serverErrors) && serverErrors.length > 0)
        ? serverErrors[0].message
        : err?.response?.data?.message || t.profile?.updateError || 'Failed to update profile';
      setError(message);
      showToast({ message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const validateAddressFields = (): boolean => {
    const next: AddressFieldErrors = {};
    const cleanStreet = sanitize(street, 200);
    const cleanCity = sanitize(city, 100);
    const cleanState = sanitize(state, 100);
    const cleanZip = sanitize(zipCode, 20);
    const cleanCountry = sanitize(country, 100);

    if (cleanStreet.length < 5)
      next.street = t?.profile?.errStreetLength || 'Street address must be at least 5 characters.';
    if (cleanCity.length < 2)
      next.city = t?.profile?.errCityLength || 'City must be at least 2 characters.';
    else if (!/^[a-zA-Z\u00C0-\u024F\s\-']+$/.test(cleanCity))
      next.city = t?.profile?.errCityInvalid || 'City should contain only letters, spaces, hyphens, or apostrophes.';
    if (cleanState.length < 2)
      next.state = t?.profile?.errStateLength || 'State / Province must be at least 2 characters.';
    if (!ZIP_RE.test(cleanZip))
      next.zipCode = t?.profile?.errZipInvalid || 'Enter a valid postal code (letters, digits, spaces, hyphens).';
    if (!cleanCountry)
      next.country = t?.profile?.errCountryReq || 'Country is required.';

    setAddrErrors(next);
    return Object.keys(next).length === 0;
  };

  const openAddAddressModal = () => {
    if (activeAddresses.length >= 10) {
      showToast({ message: t?.profile?.maxAddressesReached || 'You have reached the maximum of 10 saved addresses. Remove one first.', type: 'error' });
      return;
    }
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('US');
    setAddrErrors({});
    setEditingAddressId(null);
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: Address) => {
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setCountry(addr.country);
    setAddrErrors({});
    setEditingAddressId(addr._id || null);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddressFields()) return;

    const newAddr: Address = {
      street: sanitize(street, 200),
      city: sanitize(city, 100),
      state: sanitize(state, 100),
      zipCode: sanitize(zipCode, 20),
      country: sanitize(country, 100),
    };

    let updatedAddresses: Address[];
    if (editingAddressId) {
      // Replace the edited entry
      updatedAddresses = allAddresses.map((a) =>
        a._id === editingAddressId ? { ...a, ...newAddr } : a
      );
    } else {
      updatedAddresses = [...allAddresses, newAddr];
    }

    setIsAddressModalOpen(false);
    await saveChanges({
      name: sanitize(name, 80),
      email: sanitize(email, 254).toLowerCase(),
      addresses: updatedAddresses,
    });
  };

  // Soft-delete: set deletedAt instead of removing from array
  const handleDeleteAddress = async (addr: Address) => {
    const updatedAddresses = allAddresses.map((a) =>
      a._id === addr._id ? { ...a, deletedAt: new Date().toISOString() } : a
    );
    await saveChanges({
      name: sanitize(name, 80),
      email: sanitize(email, 254).toLowerCase(),
      addresses: updatedAddresses,
    });
  };

  const handleAvatarPick = () => {
    if (avatarUploading) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({ message: t?.profile?.imageRequired || 'Please choose an image file.', type: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast({ message: t?.profile?.imageSize || 'Image must be smaller than 5MB.', type: 'error' });
      return;
    }

    setAvatarUploading(true);
    try {
      const updated = await accountApi.uploadAvatar(file);
      setUser(updated);
      updateAuthUser({ avatarUrl: updated.avatarUrl });
      showToast({ message: t?.profile?.imageUploadSuccess || 'Profile picture updated', type: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ message: t?.profile?.imageUploadError || 'Failed to upload profile picture', type: 'error' });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError(t?.profile?.currentPasswordReq || 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t?.profile?.newPasswordMin || 'New password must be at least 8 characters.');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setPasswordError(t?.profile?.newPasswordLow || 'New password must contain at least one lowercase letter.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError(t?.profile?.newPasswordUp || 'New password must contain at least one uppercase letter.');
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      setPasswordError(t?.profile?.newPasswordSpec || 'New password must contain at least one special character (e.g. !, @, #).');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError(t?.profile?.newPasswordMatch || 'New passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError(t?.profile?.newPasswordDiff || 'New password must be different from the current password.');
      return;
    }

    setChangingPassword(true);
    try {
      await accountApi.changePassword({ currentPassword, newPassword });
      showToast({ message: t?.profile?.passwordSuccess || 'Password updated. Please sign in again.', type: 'success' });
      logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      const serverErrors = err?.response?.data?.errors;
      setPasswordError(
        (serverErrors && Array.isArray(serverErrors) && serverErrors.length > 0)
          ? serverErrors[0].message
          : err.response?.data?.message || t?.profile?.passwordChangeFailed || 'Failed to change password.'
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  const fieldClass = (hasError?: boolean) =>
    `w-full bg-surface-container border ${hasError ? 'border-error/60 ring-2 ring-error/20' : 'border-transparent'} rounded-lg px-space-md py-2.5 text-on-surface focus:outline-none focus:bg-surface-container-high focus:border-outline-variant/30 transition-colors`;

  return (
    <main className="w-full bg-surface min-h-[70vh] selection:bg-primary-container selection:text-on-primary-container">
      <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg mb-space-lg border-b border-surface-container-highest gap-space-md animate-fade-in">
          <div className="flex items-center gap-space-md">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden shadow-sm">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-headline-lg text-headline-lg text-primary uppercase">
                    {user?.name?.substring(0, 2) || 'CV'}
                  </span>
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 rounded-full bg-surface-container-lowest/70 flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleAvatarPick}
                disabled={avatarUploading}
                aria-label={t?.common?.changeProfilePicture || "Change profile picture"}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center border-2 border-surface shadow-sm hover:bg-primary transition-colors disabled:opacity-50"
              >
                <Icon name="edit" size={14} />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
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
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2 flex-wrap">
                <span>{user?.email}</span>
                {user && (
                  user.isEmailVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Icon name="check_circle" size={12} /> Verified
                    </span>
                  ) : (
                    <Link
                      to="/verify-email"
                      state={{ email: user.email, from: '/profile' }}
                      className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-error bg-error-container/20 px-2 py-0.5 rounded-full hover:bg-error-container/30 transition-colors"
                    >
                      <Icon name="warning" size={12} /> Unverified — Verify now
                    </Link>
                  )
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-body-sm text-on-surface-variant">
            {activeAddresses.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Icon name="location_on" className="text-[16px] text-primary" />
                <span>
                  {activeAddresses[0].city}, {activeAddresses[0].country}
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
            {/* Personal Details */}
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

            {/* Change Password */}
            <section className="bg-surface-container-low border border-outline-variant/10 p-space-lg rounded-xl shadow-sm">
              <h2 className="text-on-surface font-title-editorial text-title-editorial border-b border-outline-variant/20 pb-space-sm mb-space-md flex items-center gap-2">
                <Icon name="lock" className="text-primary text-[20px]" />
                {t?.profile?.changePassword || 'Change Password'}
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-space-md font-body-sm" noValidate>
                {passwordError && (
                  <p className="text-sm text-error" role="alert">
                    {passwordError}
                  </p>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="current-password">
                    {t?.profile?.currentPassword || 'Current Password'}
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-surface-container border border-transparent rounded-lg px-space-md py-2.5 text-on-surface focus:outline-none focus:bg-surface-container-high focus:border-outline-variant/30 transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="new-password">
                    {t?.profile?.newPassword || 'New Password'}
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-surface-container border border-transparent rounded-lg px-space-md py-2.5 text-on-surface focus:outline-none focus:bg-surface-container-high focus:border-outline-variant/30 transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="confirm-new-password">
                    {t?.profile?.confirmNewPassword || 'Confirm New Password'}
                  </label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-surface-container border border-transparent rounded-lg px-space-md py-2.5 text-on-surface focus:outline-none focus:bg-surface-container-high focus:border-outline-variant/30 transition-colors"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={changingPassword}
                  isLoading={changingPassword}
                  className="w-full mt-2"
                  icon="lock"
                  variant="secondary"
                >
                  {t?.profile?.updatePassword || 'Update Password'}
                </Button>
              </form>
            </section>

            {/* Quick Links */}
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

          {/* Dispatch Destinations */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <section className="bg-surface-container-low border border-outline-variant/10 p-space-lg rounded-xl shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm mb-space-md">
                <h2 className="text-on-surface font-title-editorial text-title-editorial flex items-center gap-2">
                  <Icon name="home_work" className="text-primary text-[20px]" />
                  {t.profile?.dispatchDestinations || 'Dispatch Destinations'}
                </h2>
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  {t.profile?.ofTotal
                    ? t.profile.ofTotal.replace('{{count}}', activeAddresses.length.toString())
                    : `${activeAddresses.length} of 10`}
                </span>
              </div>

              {activeAddresses.length >= 8 && activeAddresses.length < 10 && (
                <div className="bg-secondary-container/20 border border-secondary-container/30 text-secondary text-body-sm p-3 rounded-md flex items-center gap-2 mb-4">
                  <Icon name="warning" className="text-[18px] shrink-0" />
                  <span>{t.profile?.limitWarning || 'You are approaching the maximum limit of 10 saved addresses.'}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {activeAddresses.map((addr, idx) => (
                  <div
                    key={addr._id || `${addr.street}-${idx}`}
                    className="bg-surface-container border border-outline-variant/10 p-space-md rounded-lg flex flex-col justify-between hover:bg-surface-container-high transition-colors group"
                  >
                    <div className="flex flex-col gap-1 mb-4 font-body-sm text-body-sm text-on-surface-variant">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-on-surface font-label-md text-label-md uppercase tracking-wider">
                          {t.profile?.destination
                            ? t.profile.destination.replace('{{count}}', (idx + 1).toString())
                            : `Destination ${idx + 1}`}
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
                        onClick={() => openEditAddressModal(addr)}
                        variant="ghost"
                        size="sm"
                        icon="edit"
                        className="text-primary hover:text-primary-fixed"
                      >
                        {t.profile?.edit || 'Edit'}
                      </Button>
                      <Button
                        onClick={() => handleDeleteAddress(addr)}
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

                {activeAddresses.length < 10 && (
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

      {/* Address Modal */}
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
                  {editingAddressId ? (t.profile?.update || 'Update') : (t.profile?.new || 'New')}
                </span>
                <h3 id="address-modal-title" className="font-headline-sm text-headline-sm text-on-surface">
                  {t.profile?.dispatchAddress || 'Dispatch Address'}
                </h3>
              </div>
              <Button
                onClick={() => setIsAddressModalOpen(false)}
                variant="ghost"
                icon="close"
                aria-label={t?.common?.closeModal || "Close"}
                disabled={saving}
              />
            </div>

            <form onSubmit={handleSaveAddress} className="p-space-lg space-y-space-md font-body-sm" noValidate>
              {/* Street */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="addr-street" className="font-label-md text-label-md text-on-surface-variant">
                  {t.profile?.streetAddress || 'Street Address'} <span className="text-primary">*</span>
                </label>
                <input
                  id="addr-street"
                  type="text"
                  required
                  maxLength={200}
                  value={street}
                  onChange={(e) => { setStreet(e.target.value); if (addrErrors.street) setAddrErrors((p) => ({ ...p, street: undefined })); }}
                  className={fieldClass(Boolean(addrErrors.street))}
                />
                {addrErrors.street && <p className="text-[11px] text-error" role="alert">{addrErrors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-space-md">
                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="addr-city" className="font-label-md text-label-md text-on-surface-variant">
                    {t.profile?.city || 'City'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="addr-city"
                    type="text"
                    required
                    maxLength={100}
                    value={city}
                    onChange={(e) => { setCity(e.target.value); if (addrErrors.city) setAddrErrors((p) => ({ ...p, city: undefined })); }}
                    className={fieldClass(Boolean(addrErrors.city))}
                  />
                  {addrErrors.city && <p className="text-[11px] text-error" role="alert">{addrErrors.city}</p>}
                </div>
                {/* State */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="addr-state" className="font-label-md text-label-md text-on-surface-variant">
                    {t.profile?.stateProvince || 'State/Province'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="addr-state"
                    type="text"
                    required
                    maxLength={100}
                    value={state}
                    onChange={(e) => { setState(e.target.value); if (addrErrors.state) setAddrErrors((p) => ({ ...p, state: undefined })); }}
                    className={fieldClass(Boolean(addrErrors.state))}
                  />
                  {addrErrors.state && <p className="text-[11px] text-error" role="alert">{addrErrors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-md">
                {/* Zip */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="addr-zip" className="font-label-md text-label-md text-on-surface-variant">
                    {t.profile?.zipCode || 'Zip/Postal Code'} <span className="text-primary">*</span>
                  </label>
                  <input
                    id="addr-zip"
                    type="text"
                    required
                    maxLength={20}
                    value={zipCode}
                    onChange={(e) => { setZipCode(e.target.value); if (addrErrors.zipCode) setAddrErrors((p) => ({ ...p, zipCode: undefined })); }}
                    className={fieldClass(Boolean(addrErrors.zipCode))}
                  />
                  {addrErrors.zipCode && <p className="text-[11px] text-error" role="alert">{addrErrors.zipCode}</p>}
                </div>
                {/* Country */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="addr-country" className="font-label-md text-label-md text-on-surface-variant">
                    {t.profile?.country || 'Country'} <span className="text-primary">*</span>
                  </label>
                  <select
                    id="addr-country"
                    required
                    value={country}
                    onChange={(e) => { setCountry(e.target.value); if (addrErrors.country) setAddrErrors((p) => ({ ...p, country: undefined })); }}
                    className={fieldClass(Boolean(addrErrors.country))}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {addrErrors.country && <p className="text-[11px] text-error" role="alert">{addrErrors.country}</p>}
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
