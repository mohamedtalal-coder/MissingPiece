import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../shared/context/ToastContext';
import { useLanguage } from '../../shared/context/LanguageContext';
import { AdminAtelierNav } from '../../shared/components/layout/AdminAtelierNav';
import { PriceDisplay } from '../../shared/components/ui/PriceDisplay';
import { StatusBadge } from '../../shared/components/ui/StatusBadge';
import { apiClient } from '../../api/client';

interface Metrics {
  ordersToday: number;
  revenueToday: number;
  pendingReviews: number;
  unreadInquiries: number;
  totalUsers: number;
  activeProducts: number;
  ordersByStatus: Record<string, number>;
}

interface RecentOrder {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user?: { name?: string; email?: string };
}

export function AdminDashboardPage() {
  const toast = useToast();
  const { t, formatDate } = useLanguage();
  const d = t.adminPanel.dashboard;
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/admin/dashboard');
      setMetrics(data.metrics);
      setRecent(data.recentOrders ?? []);
    } catch {
      toast.showToast({ message: d.fetchError, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast, d.fetchError]);

  useEffect(() => {
    load();
  }, [load]);

  const cards = metrics
    ? [
        { label: d.ordersToday, value: String(metrics.ordersToday), to: '/admin/orders' },
        { label: d.revenueToday, value: null as string | null, amount: metrics.revenueToday, to: '/admin/orders' },
        { label: d.pendingReviews, value: String(metrics.pendingReviews), to: '/admin/reviews' },
        { label: d.unreadInquiries, value: String(metrics.unreadInquiries), to: '/admin/messages' },
        { label: d.totalUsers, value: String(metrics.totalUsers), to: '/admin/users' },
        { label: d.activeProducts, value: String(metrics.activeProducts), to: '/admin/products' },
      ]
    : [];

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
      <AdminAtelierNav />
      <div className="pb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{d.title}</h1>
        <p className="text-on-surface-variant mt-2">{d.subtitle}</p>
      </div>

      {loading || !metrics ? (
        <div className="text-on-surface-variant">{d.loading}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/20 shadow-sm hover:border-primary/40 transition-colors block"
              >
                <h3 className="font-headline-sm text-on-surface">{card.label}</h3>
                {card.amount !== undefined && card.amount !== null && card.value === null ? (
                  <p className="font-display-md text-primary mt-2">
                    <PriceDisplay amount={card.amount} size="lg" />
                  </p>
                ) : (
                  <p className="font-display-md text-primary mt-2">{card.value}</p>
                )}
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="font-headline-md text-on-surface mb-4">{d.recentOrders}</h2>
            {recent.length === 0 ? (
              <p className="text-on-surface-variant">{d.noRecent}</p>
            ) : (
              <div className="bg-surface-container-low rounded-lg border border-outline-variant/20 overflow-hidden">
                <table className="w-full text-start text-body-sm">
                  <tbody className="divide-y divide-outline-variant/20">
                    {recent.map((o) => (
                      <tr key={o._id}>
                        <td className="py-3 px-4 font-medium">{o.user?.name || '—'}</td>
                        <td className="py-3 px-4 text-on-surface-variant">{formatDate(o.createdAt)}</td>
                        <td className="py-3 px-4">
                          <PriceDisplay amount={o.totalAmount} size="sm" />
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge type="order" status={o.status as any} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
