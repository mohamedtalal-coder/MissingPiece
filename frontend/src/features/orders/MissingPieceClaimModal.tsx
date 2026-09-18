import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from '../../shared/components/ui/Icon';
import { Button } from '../../shared/components/ui/Button';
import { useScrollLock } from '../../shared/hooks/useScrollLock';
import { staticApi } from '../static/staticApi';
import type { Order } from './ordersApi';
import { orderShortId } from './orderStatus';
import { useAuth } from '../auth/AuthContext';

interface MissingPieceClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

function sanitize(value: string, max: number): string {
  return value.replace(/[<>]/g, '').trim().slice(0, max);
}

export function MissingPieceClaimModal({ isOpen, onClose, order }: MissingPieceClaimModalProps) {
  const { user } = useAuth();
  const [productIndex, setProductIndex] = useState(0);
  const [pieceCode, setPieceCode] = useState('');
  const [coordinate, setCoordinate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    setProductIndex(0);
    setPieceCode('');
    setCoordinate('');
    setDescription('');
    setErrors({});
    setSubmitted(false);
    setSubmitError('');
  }, [isOpen, order._id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, submitting]);

  if (!isOpen) return null;

  const items = order.items || [];
  const selected = items[productIndex] || items[0];

  const validate = () => {
    const next: Record<string, string> = {};
    if (!selected) next.product = 'Select an edition.';
    if (sanitize(pieceCode, 40).length < 2) next.pieceCode = 'Enter a piece code (min 2 characters).';
    if (sanitize(coordinate, 80).length < 3) next.coordinate = 'Enter a matrix coordinate.';
    if (sanitize(description, 800).length < 10) next.description = 'Describe the missing piece (min 10 characters).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting || !selected) return;

    const name = sanitize(user?.name || 'Collector', 100);
    const email = sanitize(user?.email || '', 100);
    if (!email) {
      setSubmitError('Your account email is required to file a claim.');
      return;
    }

    const puzzleName = sanitize(selected.title || 'Edition', 100);
    const code = sanitize(pieceCode, 40);
    const coord = sanitize(coordinate, 80);
    const desc = sanitize(description, 800);
    const orderRef = orderShortId(order._id);

    setSubmitting(true);
    setSubmitError('');
    try {
      await staticApi.sendMessage({
        name,
        email,
        subject: `Missing Piece Claim · Order #${orderRef}`.slice(0, 150),
        message: [
          `Lost piece claim for order #${orderRef}.`,
          `Edition: ${puzzleName}`,
          `Piece code: ${code}`,
          `Matrix coordinate: ${coord}`,
          `Details: ${desc}`,
        ].join('\n').slice(0, 1000),
      });
      setSubmitted(true);
      window.setTimeout(() => onClose(), 2200);
    } catch {
      setSubmitError('Could not register the claim. Please try again or use Contact.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={() => !submitting && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-modal-title"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-surface-container border border-outline-variant/40 shadow-2xl p-6 sm:p-8 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-surface-container-high text-primary-container">
              <Icon name="security" size={20} />
            </div>
            <div>
              <h2 id="claim-modal-title" className="font-headline-sm text-lg text-on-surface">
                Register Lost Piece Claim
              </h2>
              <p className="text-[11px] text-outline">Lifetime free replacement for registered editions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Close"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 border border-primary/40 text-primary flex items-center justify-center">
              <Icon name="check" size={28} />
            </div>
            <h3 className="font-headline-sm text-xl text-on-surface">Claim registered</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              Our atelier has received your vector request. A replacement will be cut and dispatched in an archival
              envelope once verified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="claim-edition" className="text-xs text-on-surface-variant">
                Edition from this order
              </label>
              <select
                id="claim-edition"
                value={productIndex}
                onChange={(e) => setProductIndex(Number(e.target.value))}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {items.map((item, i) => (
                  <option key={i} value={i}>
                    {item.title || 'Edition'} ×{item.quantity}
                  </option>
                ))}
              </select>
              {errors.product && <p className="text-[11px] text-error">{errors.product}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="claim-code" className="text-xs text-on-surface-variant">
                Piece code
              </label>
              <input
                id="claim-code"
                value={pieceCode}
                maxLength={40}
                onChange={(e) => setPieceCode(e.target.value)}
                placeholder="e.g. P-142"
                className={`w-full bg-surface-container-low border rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                  errors.pieceCode ? 'border-error' : 'border-outline-variant/40'
                }`}
              />
              {errors.pieceCode && <p className="text-[11px] text-error">{errors.pieceCode}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="claim-coord" className="text-xs text-on-surface-variant">
                Matrix coordinate
              </label>
              <input
                id="claim-coord"
                value={coordinate}
                maxLength={80}
                onChange={(e) => setCoordinate(e.target.value)}
                placeholder="e.g. Sector C, Row 14"
                className={`w-full bg-surface-container-low border rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                  errors.coordinate ? 'border-error' : 'border-outline-variant/40'
                }`}
              />
              {errors.coordinate && <p className="text-[11px] text-error">{errors.coordinate}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="claim-desc" className="text-xs text-on-surface-variant">
                Description
              </label>
              <textarea
                id="claim-desc"
                value={description}
                maxLength={800}
                rows={4}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Where was the piece last seen? Any markings on the box or certificate?"
                className={`w-full bg-surface-container-low border rounded-lg px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y min-h-[96px] ${
                  errors.description ? 'border-error' : 'border-outline-variant/40'
                }`}
              />
              {errors.description && <p className="text-[11px] text-error">{errors.description}</p>}
            </div>

            {submitError && (
              <p className="text-[11px] text-error" role="alert">
                {submitError}
              </p>
            )}

            <Button type="submit" disabled={submitting} isLoading={submitting} className="w-full" size="lg" icon="security">
              {submitting ? 'Submitting…' : 'Submit Claim'}
            </Button>
            <p className="text-[10px] text-outline text-center">
              Claims are reviewed by the atelier. Abuse may result in claim denial.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
