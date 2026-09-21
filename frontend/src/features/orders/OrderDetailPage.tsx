import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useToast } from '../../shared/context/ToastContext';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';
import { cartApi } from '../cart/cartApi';
import { ordersApi, type Order } from './ordersApi';
import {
  atelierStatusLabel,
  buildProvenanceTimeline,
  orderShortId,
  progressPercent,
  registryReference,
} from './orderStatus';
import { MissingPieceClaimModal } from './MissingPieceClaimModal';
import { Icon } from '../../shared/components/ui/Icon';
import { Button } from '../../shared/components/ui/Button';
import { PriceDisplay } from '../../shared/components/ui/PriceDisplay';
import { StatusBadge } from '../../shared/components/ui/StatusBadge';
import { useReducedMotion } from '../../shared/hooks/useReducedMotion';
import { useLanguage } from '../../shared/context/LanguageContext';

function DetailSkeleton() {
  return (
    <div className="max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg space-y-6" aria-busy="true">
      <div className="h-8 w-64 rounded animate-shimmer" />
      <div className="h-40 w-full rounded-2xl animate-shimmer" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 h-64 rounded-xl animate-shimmer" />
        <div className="lg:col-span-4 h-64 rounded-xl animate-shimmer" />
      </div>
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, formatDate } = useLanguage() as any;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { refreshCart } = useCart();
  const reducedMotion = useReducedMotion();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (!id) return;
    if (paymentStatus === 'success') {
      showToast({ message: t?.orderHistory?.details?.paymentSuccess || 'Payment successful. Your commission is registered.', type: 'success' });
      window.history.replaceState({}, '', `/orders/${id}`);
    } else if (paymentStatus === 'cancelled') {
      showToast({ message: t?.orderHistory?.details?.paymentCancelled || 'Payment cancelled.', type: 'error' });
      window.history.replaceState({}, '', `/orders/${id}`);
    }
  }, [searchParams, id, showToast]);

  const fetchOrder = useCallback(
    async (signal?: AbortSignal) => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await ordersApi.getOrderById(id);
        if (signal?.aborted) return;
        setOrder(data);
      } catch (err: unknown) {
        const e = err as { name?: string; code?: string; response?: { status?: number } };
        if (e.name === 'CanceledError' || e.name === 'AbortError' || e.code === 'ERR_CANCELED') return;
        if (e.response?.status === 403 || e.response?.status === 401) {
          setError(t?.orderHistory?.details?.permissionError || 'You do not have permission to view this order.');
        } else if (e.response?.status === 404) {
          setError(t?.orderHistory?.details?.orderNotFound || 'Order not found.');
        } else {
          setError(t?.orderHistory?.details?.loadError || 'Failed to load order details.');
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const controller = new AbortController();
    fetchOrder(controller.signal);
    const refreshTimer = window.setInterval(() => fetchOrder(), 10000);
    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
    };
  }, [fetchOrder, isAuthenticated, id]);

  const copyRegistry = async () => {
    if (!order) return;
    const ref = registryReference(order._id);
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ message: t?.orderHistory?.details?.copyError || 'Could not copy reference', type: 'error' });
    }
  };

  const handleReorderToCart = async () => {
    if (!order || reordering) return;
    setReordering(true);
    try {
      const payloads = order.items
        .map((item) => ({
          productId: String(item.productId || item.product || ''),
          quantity: Math.min(Math.max(1, item.quantity), 10),
        }))
        .filter((i) => i.productId && /^[a-f\d]{24}$/i.test(i.productId));

      if (payloads.length === 0) {
        showToast({ message: t?.orderHistory?.details?.reorderEmpty || 'Could not re-add items. Browse the catalog instead.', type: 'info' });
        navigate('/products');
        return;
      }

      const validated = await cartApi.validateCart(payloads);
      if (validated.length === 0) {
        showToast({ message: t?.orderHistory?.details?.reorderUnavailable || 'Those editions are no longer available.', type: 'error' });
        return;
      }

      for (const item of validated) {
        await cartApi.addItem(item.productId, Math.min(item.quantity, item.stock, 10));
      }

      await refreshCart();
      showToast({ message: t?.orderHistory?.details?.reorderSuccess || 'Available items added to bag', type: 'success' });
      navigate('/cart');
    } catch {
      showToast({ message: t?.orderHistory?.details?.reorderError || 'Some items could not be re-added (stock may have changed).', type: 'error' });
    } finally {
      setReordering(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || cancelling) return;
    const confirmed = window.confirm(t.orderHistory?.details?.cancelConfirm || 'Cancel this order? This cannot be undone.');
    if (!confirmed) return;

    setCancelling(true);
    try {
      const updated = await ordersApi.cancelOrder(order._id);
      setOrder(updated);
      showToast({ message: t?.orderHistory?.details?.cancelSuccess || 'Order cancelled', type: 'success' });
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      if (e.response?.status === 409) {
        showToast({ message: t?.orderHistory?.details?.cancelConflict || 'This order can no longer be cancelled.', type: 'error' });
      } else {
        showToast({ message: t?.orderHistory?.details?.cancelError || 'Failed to cancel order', type: 'error' });
      }
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading) {
    return <DetailSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: id ? `/orders/${id}` : '/orders' }} />;
  }

  if (loading) return <DetailSkeleton />;

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-margin-mobile py-space-2xl text-center animate-fade-in">
        <Icon name="error" className="text-[40px] text-error mx-auto mb-3" />
        <h1 className="font-headline-sm text-headline-sm text-on-surface mb-4">
          {error || t.orderHistory?.details?.notFound || 'Commission not found.'}
        </h1>
        <Button as="link" to="/orders" icon="arrow_back">
          {t.orderHistory?.details?.returnLedger || 'Return to Ledger'}
        </Button>
      </div>
    );
  }

  const timeline = buildProvenanceTimeline(order.status);
  const shortId = orderShortId(order._id);
  const registry = registryReference(order._id);
  const canClaim = order.status === 'delivered' || order.status === 'shipped';

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
      <div className={`mb-space-lg ${reducedMotion ? '' : 'animate-slide-up'}`}>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-space-sm"
        >
          <Icon name="arrow_back" size={16} />
          {t.orderHistory?.backToArchive || 'Back to Archive'}
        </Link>
      </div>

      {/* Provenance header */}
      <section
        className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-surface-container via-surface-container-low to-surface-container-lowest border border-outline-variant/40 shadow-2xl space-y-6 mb-space-xl ${
          reducedMotion ? '' : 'animate-fade-in'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs uppercase tracking-widest text-primary-container">
                {t.orderHistory?.details?.provenanceLedger || 'Atelier Provenance Ledger'}
              </span>
              <StatusBadge status={order.status} type="order" />
              <span className="text-xs text-on-surface-variant">{atelierStatusLabel(order.status)}</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg sm:text-display-lg-mobile text-on-surface mt-1">
              {(t.orderHistory?.details?.orderNum || 'Order #{{id}}').replace('{{id}}', shortId)}
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              {t.orderHistory?.details?.commissioned || 'Commissioned '}
              {formatDate(order.createdAt, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {order.status === 'pending' && (
              <Button
                type="button"
                variant="outline"
                icon="close"
                isLoading={cancelling}
                disabled={cancelling}
                onClick={handleCancelOrder}
              >
                {t.orderHistory?.details?.cancelOrder || 'Cancel Order'}
              </Button>
            )}
            {canClaim && (
              <Button type="button" variant="outline" icon="warning" onClick={() => setClaimOpen(true)}>
                {t.orderHistory?.details?.reportMissing || 'Report Missing Piece'}
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              icon="replay"
              isLoading={reordering}
              disabled={reordering}
              onClick={handleReorderToCart}
            >
              {t.orderHistory?.details?.readdBag || 'Re-add to Bag'}
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-on-surface-variant min-w-0">
            <Icon name="security" size={16} className="text-primary-container shrink-0" />
            <span className="text-outline shrink-0">{t.orderHistory?.details?.registryRef || 'Registry reference:'}</span>
            <span className="text-on-surface font-semibold truncate">{registry}</span>
          </div>
          <button
            type="button"
            onClick={copyRegistry}
            className="text-primary-container hover:text-primary flex items-center gap-1 transition-colors shrink-0"
          >
            <Icon name={copied ? 'check' : 'copy'} size={14} />
            {copied ? (t.orderHistory?.details?.copied || 'Copied') : (t.orderHistory?.details?.copy || 'Copy')}
          </button>
        </div>

        {/* Timeline */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline-sm text-sm text-on-surface uppercase tracking-wider">
              {t.orderHistory?.details?.stepper || 'Fulfillment stepper'}
            </h2>
            <span className="text-xs text-outline tabular-nums">{progressPercent(order.status)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-container-highest mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-container to-primary transition-all duration-700"
              style={{ width: `${progressPercent(order.status)}%` }}
            />
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {timeline.map((step, idx) => (
              <li key={step.id} className="space-y-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    step.current
                      ? 'border-primary-container bg-primary-container text-on-primary-container shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary-container)_35%,transparent)]'
                      : step.completed
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-outline-variant/40 bg-surface-container text-outline'
                  }`}
                >
                  {step.completed || (step.current && order.status === 'delivered') ? (
                    <Icon name="check" size={18} />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>
                <div>
                  <h3
                    className={`font-headline-sm text-xs font-bold ${
                      step.current ? 'text-primary' : step.completed ? 'text-on-surface' : 'text-outline'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-outline leading-relaxed mt-1">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        <div className="lg:col-span-8 space-y-space-lg">
          <section className="bg-surface-container-low rounded-xl p-space-lg border border-outline-variant/10">
            <h2 className="font-headline-sm text-title-editorial text-on-surface border-b border-outline-variant/20 pb-space-sm mb-space-md flex items-center gap-2">
              <Icon name="inventory_2" className="text-primary" size={20} />
              {t.orderHistory?.details?.archivalPieces || 'Archival pieces'}
            </h2>
            <ul className="space-y-3">
              {order.items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-space-md p-space-sm rounded-lg hover:bg-surface-container transition-colors"
                >
                  <div className="w-20 h-24 bg-surface-container-highest rounded-lg shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline">
                        <Icon name="image" size={24} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-label-caps text-label-caps text-primary uppercase">{t.orderHistory?.details?.precisionCut || 'Precision Cut'}</p>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">
                      {item.title || (t.orderHistory?.details?.masterwork || 'Masterwork')}
                    </h3>
                    <p className="text-sm text-on-surface-variant">{(t.orderHistory?.details?.qty || 'Qty {{qty}}').replace('{{qty}}', item.quantity)}</p>
                  </div>
                  <PriceDisplay
                    amount={(item.price || 0) * item.quantity}
                    size="sm"
                    className="text-primary shrink-0"
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-space-lg sticky top-28">
          <section className="bg-surface-container-low rounded-xl p-space-lg border border-outline-variant/10">
            <h2 className="font-headline-sm text-sm text-on-surface border-b border-outline-variant/20 pb-space-sm mb-space-md flex items-center gap-2">
              <Icon name="receipt_long" className="text-primary" size={18} />
              {t.orderHistory?.details?.summary || 'Ledger summary'}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>{t.orderHistory?.details?.totalPaid || 'Total paid'}</span>
                <PriceDisplay amount={order.total} size="sm" className="text-on-surface" />
              </div>
              <div className="border-t border-outline-variant/20 pt-3 flex justify-between items-baseline">
                <span className="font-label-md uppercase tracking-wider font-semibold text-on-surface">
                  {t.orderHistory?.details?.commissionTotal || 'Commission total'}
                </span>
                <PriceDisplay amount={order.total} size="lg" className="text-primary" />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low rounded-xl p-space-lg border border-outline-variant/10">
            <h2 className="font-headline-sm text-sm text-on-surface border-b border-outline-variant/20 pb-space-sm mb-space-md flex items-center gap-2">
              <Icon name="local_shipping" className="text-primary" size={18} />
              {t.orderHistory?.details?.deliveryDestination || 'Delivery destination'}
            </h2>
            <address className="not-italic text-sm text-on-surface-variant leading-relaxed">
              <p className="text-on-surface font-medium mb-1">{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </address>
          </section>
        </aside>
      </div>

      <MissingPieceClaimModal isOpen={claimOpen} onClose={() => setClaimOpen(false)} order={order} />
    </div>
  );
}

export default OrderDetailPage;
