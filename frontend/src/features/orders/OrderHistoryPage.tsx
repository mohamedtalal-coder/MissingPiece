import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../shared/context/LanguageContext';
import { ordersApi, type Order } from './ordersApi';
import {
  atelierStatusLabel,
  isActiveOrder,
  orderShortId,
  progressPercent,
} from './orderStatus';
import { Icon } from '../../shared/components/ui/Icon';
import { Button } from '../../shared/components/ui/Button';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { PriceDisplay } from '../../shared/components/ui/PriceDisplay';
import { Motion } from '../../shared/components/ui/Motion';
import { StatusBadge } from '../../shared/components/ui/StatusBadge';
import { useAuth } from '../auth/AuthContext';
import { useReducedMotion } from '../../shared/hooks/useReducedMotion';

function OrderListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading orders">
      <div className="rounded-xl bg-surface-container p-space-lg space-y-4">
        <div className="h-6 w-48 rounded animate-shimmer" />
        <div className="h-3 w-full rounded-full animate-shimmer" />
        <div className="h-20 w-full rounded animate-shimmer" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-surface-container-low p-space-md h-20 animate-shimmer" />
      ))}
    </div>
  );
}

export function OrderHistoryPage() {
  const { t, formatDate } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchOrders = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);
        const res = await ordersApi.getMyOrders(page, limit);
        if (signal?.aborted) return;
        setOrders(res.items);
        setTotalPages(res.totalPages || 1);
      } catch (err: unknown) {
        const e = err as { name?: string; code?: string };
        if (e.name === 'CanceledError' || e.name === 'AbortError' || e.code === 'ERR_CANCELED') return;
        setError(t.orderHistory?.loadError || 'Failed to load orders');
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page]
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [fetchOrders, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/orders' }} />;
  }

  const activeOrders = orders.filter((o) => isActiveOrder(o.status));
  const archivalOrders = orders.filter((o) => !isActiveOrder(o.status));
  const featured = activeOrders[0];

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
      <div
        className={`flex flex-col md:flex-row md:items-end justify-between pb-space-lg mb-space-lg border-b border-outline-variant/30 gap-space-md ${
          reducedMotion ? '' : 'animate-slide-up'
        }`}
      >
        <div className="flex flex-col gap-space-xs">
          <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
            {t.orderHistory?.clientArchive || 'Client Archive & Dispatch'}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            {t.orderHistory?.orderArchive || 'Order Archive & Provenance'}
          </h1>
        </div>
        <div className="flex items-center gap-space-md text-body-sm">
          <div className="flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-low rounded-xl">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden />
            <span className="font-label-md text-label-md text-on-surface">
              {activeOrders.length} {t.orderHistory?.inProgress || 'In Progress'}
            </span>
          </div>
          <div className="flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-low rounded-xl">
            <span className="w-2 h-2 rounded-full bg-outline" aria-hidden />
            <span className="font-label-md text-label-md text-on-surface-variant">
              {archivalOrders.length} {t.orderHistory?.archived || 'Archived'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        <aside className="lg:col-span-3 flex flex-col gap-space-md">
          <div className="p-space-md bg-surface-container-low rounded-xl flex items-center gap-space-md">
            <div className="w-11 h-11 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-headline-sm uppercase shrink-0">
              {(user?.name || 'MP').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="font-headline-sm text-sm text-on-surface truncate">{user?.name}</p>
              <p className="font-label-caps text-label-caps text-outline truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-col space-y-1 bg-surface-container-low p-space-xs rounded-xl" aria-label="Account">
            <Link
              to="/orders"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg bg-surface-container-high text-primary font-label-md text-label-md"
            >
              <Icon name="package_2" size={18} />
              {t.orderHistory?.myOrders || 'My Orders'}
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md"
            >
              <Icon name="favorite" size={18} />
              {t.orderHistory?.wishlist || 'Wishlist'}
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md"
            >
              <Icon name="person" size={18} />
              {t.orderHistory?.profile || 'Profile'}
            </Link>
          </nav>

          <div className="p-space-md bg-surface-container-lowest rounded-xl border border-outline-variant/20 space-y-2">
            <div className="flex items-center gap-space-xs text-primary">
              <Icon name="verified" size={18} />
              <span className="font-label-caps text-label-caps uppercase tracking-wider">
                {t.orderHistory?.guarantee || 'Missing Piece Guarantee'}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {t.orderHistory?.guaranteeDesc || 'Open any delivered order to register a lost-piece claim for free archival replacement.'}
            </p>
          </div>
        </aside>

        <div className="lg:col-span-9 flex flex-col gap-space-xl">
          {loading ? (
            <OrderListSkeleton />
          ) : error ? (
            <div className="py-12 text-center bg-error-container/20 border border-error/30 rounded-xl space-y-4 animate-fade-in">
              <p className="text-error">{error}</p>
              <Button type="button" onClick={() => fetchOrders()}>
                {t.orderHistory?.tryAgain || 'Try Again'}
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon="inventory_2"
              title={t.orderHistory?.emptyTitle || 'No commissions yet'}
              description={t.orderHistory?.emptyDesc || "You haven't commissioned any masterworks yet."}
              actionText={t.orderHistory?.explore || 'Explore the Catalog'}
              onAction={() => navigate('/products')}
            />
          ) : (
            <>
              {featured && (
                <Motion>
                  <section className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/20 shadow-xl">
                    <div className="p-space-lg bg-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                      <div>
                        <div className="flex items-center gap-space-sm flex-wrap">
                          <h2 className="font-headline-md text-headline-md text-on-surface">
                            {t.orderHistory?.orderNumber || 'Order #'} {orderShortId(featured._id)}
                          </h2>
                          <StatusBadge status={featured.status} type="order" />
                          <span className="text-xs text-on-surface-variant">
                            {atelierStatusLabel(featured.status)}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant mt-1">
                          {formatDate(featured.createdAt, {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          · {featured.items.length} {t.orderHistory?.artifacts || 'artifact(s)'} ·{' '}
                          <PriceDisplay amount={featured.total} size="sm" className="inline" />
                        </p>
                      </div>
                      <Button as="link" to={`/orders/${featured._id}`} icon="visibility">
                        {t.orderHistory?.openProvenance || 'Open Provenance'}
                      </Button>
                    </div>

                    <div className="p-space-lg space-y-space-lg">
                      <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
                            {t.orderHistory?.fulfillmentJourney || 'Fulfillment journey'}
                          </span>
                          <span className="text-xs text-on-surface-variant tabular-nums">
                            {progressPercent(featured.status)}%
                          </span>
                        </div>
                        <div
                          className="h-2 rounded-full bg-surface-container-highest overflow-hidden"
                          role="progressbar"
                          aria-valuenow={progressPercent(featured.status)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-primary-container to-primary transition-all duration-700 ease-out"
                            style={{ width: `${progressPercent(featured.status)}%` }}
                          />
                        </div>
                      </div>

                      <ul className="space-y-3">
                        {featured.items.slice(0, 3).map((item, idx) => (
                          <li
                            key={idx}
                            className="p-space-md bg-surface-container-low rounded-xl flex items-center gap-space-md"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-highest shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-outline">
                                  <Icon name="inventory_2" size={20} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-headline-sm text-sm text-on-surface truncate">
                                {item.title || t.orderHistory?.edition || 'Edition'}
                              </p>
                              <p className="text-xs text-on-surface-variant">{t.orderHistory?.qty || 'Qty'} {item.quantity}</p>
                            </div>
                            <PriceDisplay
                              amount={(item.price || 0) * item.quantity}
                              size="sm"
                              className="text-primary shrink-0"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                </Motion>
              )}

              {archivalOrders.length > 0 && (
                <section className="space-y-space-md">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        {t.orderHistory?.archivedCommissions || 'Archived commissions'}
                      </h2>
                      <p className="text-sm text-on-surface-variant">{t.orderHistory?.pastMasterworks || 'Past masterworks safely homed'}</p>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {archivalOrders.map((order, i) => {
                      const reviewableItem = order.items.find((item) => item.productSlug || item.slug || item.productId || (typeof item.product === 'object' && item.product && 'slug' in item.product));
                      const reviewLink = reviewableItem
                        ? (() => {
                            const productSlug = reviewableItem.productSlug || reviewableItem.slug || (typeof reviewableItem.product === 'object' && reviewableItem.product && 'slug' in reviewableItem.product ? reviewableItem.product.slug : undefined);
                            return productSlug ? `/products/${productSlug}#reviews` : undefined;
                          })()
                        : undefined;

                      return (
                        <Motion key={order._id} delayMs={reducedMotion ? 0 : i * 40}>
                          <li className="bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md border border-outline-variant/10">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-headline-sm text-sm text-on-surface font-semibold">
                                  {t.orderHistory?.orderNumber || 'Order #'} {orderShortId(order._id)}
                                </span>
                                <StatusBadge status={order.status} type="order" />
                              </div>
                              <p className="text-xs text-on-surface-variant mt-1">
                                {order.items.length} {t.orderHistory?.items || 'item(s)'} ·{' '}
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-space-md">
                              <PriceDisplay amount={order.total} size="md" />
                              {order.status === 'delivered' && reviewLink && (
                                <Button as="link" to={reviewLink} variant="ghost" size="sm" icon="star_rate">
                                  Review item
                                </Button>
                              )}
                              <Button as="link" to={`/orders/${order._id}`} variant="ghost" size="sm" icon="receipt_long">
                                {t.orderHistory?.provenance || 'Provenance'}
                              </Button>
                            </div>
                          </li>
                        </Motion>
                      );
                    })}
                  </ul>
                </section>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center pt-space-md gap-space-md">
                  <Button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="secondary"
                  >
                    {t.orderHistory?.previous || 'Previous'}
                  </Button>
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    {t.orderHistory?.pageOf ? t.orderHistory.pageOf.replace('{{page}}', page.toString()).replace('{{totalPages}}', totalPages.toString()) : `Page ${page} of ${totalPages}`}
                  </span>
                  <Button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    variant="secondary"
                  >
                    {t.orderHistory?.next || 'Next'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderHistoryPage;
