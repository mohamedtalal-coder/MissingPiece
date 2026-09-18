import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Compass, Award, Sparkles, ArrowUpRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../../features/auth/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function sanitizeEmail(value: string): string {
  return value.trim().toLowerCase().slice(0, 254);
}

export function Footer() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizeEmail(email);

    if (!cleaned) {
      setError('Please enter your email.');
      return;
    }
    if (!EMAIL_RE.test(cleaned)) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    setSubmitting(true);
    // Client-only subscribe for now — no PII sent until a backend endpoint exists
    window.setTimeout(() => {
      showToast({
        message: 'You are on the Atelier Dispatch list.',
        type: 'success',
      });
      setEmail('');
      setSubmitting(false);
    }, 300);
  };

  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant mt-auto">
      <div className="border-b border-outline-variant/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30">
            <div className="p-2.5 rounded-lg bg-surface-container-high text-primary-container shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-headline-sm text-sm text-on-surface">Lifetime Lost Piece Guarantee</h2>
              <p className="text-xs text-outline mt-1 leading-relaxed">
                If a wooden piece goes missing, we re-laser the exact vector from your registered edition matrix.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30">
            <div className="p-2.5 rounded-lg bg-surface-container-high text-primary-container shrink-0">
              <Award className="w-5 h-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-headline-sm text-sm text-on-surface">4.2mm Nordic Birch Hardwood</h2>
              <p className="text-xs text-outline mt-1 leading-relaxed">
                FSC-certified Scandinavian timber with a soft-touch matte finish. Zero plastic; archival grade.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container/60 border border-outline-variant/30">
            <div className="p-2.5 rounded-lg bg-surface-container-high text-primary-container shrink-0">
              <Compass className="w-5 h-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-headline-sm text-sm text-on-surface">Bespoke Whimsical Tessellations</h2>
              <p className="text-xs text-outline mt-1 leading-relaxed">
                Each edition includes thematic silhouette pieces designed for the illustration&apos;s narrative.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded border border-primary-container/50 bg-surface-container flex items-center justify-center font-headline-sm text-primary-container font-bold text-sm">
                MP
              </div>
              <span className="font-headline-sm text-lg text-on-surface tracking-tight">MissingPiece</span>
            </div>
            <p className="text-xs text-outline leading-relaxed max-w-xs">
              Quiet craftsmanship and enigmatic precision. Designed in our Nordic and Pacific workshops for
              collectors of tactile art.
            </p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-surface-container border border-outline-variant/40 text-primary-container">
              <Sparkles className="w-3 h-3" aria-hidden />
              Est. 2026 Atelier
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="font-headline-sm text-xs text-on-surface uppercase tracking-wider">
              Curated Editions
            </h2>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-primary-container transition-colors">
                  Full Collection
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=jigsaw"
                  className="hover:text-primary-container transition-colors"
                >
                  Classic Jigsaws
                </Link>
              </li>
              <li>
                <Link to="/products?category=3d" className="hover:text-primary-container transition-colors">
                  Architectural 3D
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=wooden"
                  className="hover:text-primary-container transition-colors"
                >
                  Heirloom Wooden
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-headline-sm text-xs text-on-surface uppercase tracking-wider">
              Collector Services
            </h2>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/orders"
                  className="hover:text-primary-container transition-colors inline-flex items-center gap-1"
                >
                  Track Provenance &amp; Order
                  <ArrowUpRight className="w-3 h-3 text-outline" aria-hidden />
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-primary-container transition-colors">
                  Concierge Wishlist
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-container transition-colors">
                  Missing Piece Registration
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-container transition-colors">
                  About the Craft
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    to="/admin/orders"
                    className="hover:text-primary transition-colors inline-flex items-center gap-1 text-primary-container"
                  >
                    Atelier Management
                    <span className="text-[9px] px-1 py-0.5 bg-primary-container/20 rounded">Admin</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-headline-sm text-xs text-on-surface uppercase tracking-wider">
              Atelier Dispatches
            </h2>
            <p className="text-xs text-outline">
              Private invitations for numbered preview cuts and limited archival releases.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2" noValidate>
              <div
                className={`flex rounded-lg overflow-hidden border transition-colors ${
                  error ? 'border-error' : 'border-outline-variant/50 focus-within:border-primary-container'
                }`}
              >
                <label htmlFor="footer-dispatch-email" className="sr-only">
                  Email for Atelier Dispatch
                </label>
                <input
                  id="footer-dispatch-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  placeholder="collector@domain.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'footer-dispatch-error' : 'footer-dispatch-hint'}
                  className="w-full bg-surface-container px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-container hover:bg-primary text-on-primary-container px-3 py-2 text-xs font-semibold transition-colors shrink-0 disabled:opacity-60"
                >
                  {submitting ? '…' : 'Join'}
                </button>
              </div>
              {error ? (
                <p id="footer-dispatch-error" className="text-[10px] text-error" role="alert">
                  {error}
                </p>
              ) : (
                <p id="footer-dispatch-hint" className="text-[10px] text-outline">
                  Never commercialized. Unsubscribe anytime.
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-outline">
          <p>© {new Date().getFullYear()} MissingPiece Atelier Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/contact" className="hover:text-on-surface-variant transition-colors">
              Privacy &amp; Support
            </Link>
            <span className="h-1 w-1 rounded-full bg-outline-variant" aria-hidden />
            <Link to="/about" className="hover:text-on-surface-variant transition-colors">
              Artisan Terms
            </Link>
            <span className="h-1 w-1 rounded-full bg-outline-variant" aria-hidden />
            <Link to="/about" className="hover:text-on-surface-variant transition-colors">
              Provenance &amp; Sustainability
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
