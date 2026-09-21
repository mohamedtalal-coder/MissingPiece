import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../shared/context/ToastContext';
import { Button } from '../../shared/components/ui/Button';
import { StatusBadge } from '../../shared/components/ui/StatusBadge';
import { PriceDisplay } from '../../shared/components/ui/PriceDisplay';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { AdminAtelierNav } from '../../shared/components/layout/AdminAtelierNav';
import { ordersApi, type Order } from './ordersApi';
import { useLanguage } from '../../shared/context/LanguageContext';

function TableSkeleton() {
  return (
    <div className="p-6 space-y-3" aria-busy="true" aria-label="Loading orders">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 rounded-lg animate-shimmer" />
      ))}
    </div>
  );
}

export function AdminOrdersPage() {
  const toast = useToast();
  const { t, formatDate } = useLanguage() as any;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const limit = 10;

  const fetchOrders = useCallback(
    async (currentPage: number) => {
      try {
        setLoading(true);
        const data = await ordersApi.getAdminOrders(currentPage, limit);
        setOrders(data.items);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error('Failed to fetch orders', err);
        toast.showToast({ message: t?.adminOrders?.fetchError || 'Failed to fetch orders', type: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchOrders(page);
  }, [page, fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (pendingId) return;
    setPendingId(orderId);
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus);
      toast.showToast({ message: `${t?.adminOrders?.statusUpdated || 'Order status updated to'} ${newStatus}`, type: 'success' });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus as Order['status'] } : order,
        ),
      );
    } catch (err) {
      console.error('Failed to update status', err);
      toast.showToast({ message: t?.adminOrders?.updateError || 'Failed to update status', type: 'error' });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-margin-mobile lg:px-margin py-space-lg pb-space-2xl">
      <AdminAtelierNav />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8">
        <div>
          <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
            {t?.adminOrders?.dispatchFulfillment || 'Dispatch & Fulfillment'}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
            {t?.adminOrders?.orderManagement || 'Order Management'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1.5 max-w-2xl">
            {t?.adminOrders?.trackCommissions || 'Track commissions, process shipments, and manage white-glove deliveries.'}
          </p>
        </div>
        <Button onClick={() => fetchOrders(page)} variant="secondary" icon="refresh" disabled={loading}>
          {t?.adminOrders?.syncLedgers || 'Sync Ledgers'}
        </Button>
      </div>

      <div className="bg-surface-container-low rounded-lg shadow-md border border-outline-variant/20 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton />
          ) : orders.length > 0 ? (
            <table className="w-full text-left text-body-sm font-body-sm border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider border-b border-outline-variant/20">
                  <th className="py-3.5 px-4" scope="col">
                    {t?.adminOrders?.commissionId || 'Commission ID'}
                  </th>
                  <th className="py-3.5 px-4" scope="col">
                    {t?.adminOrders?.customer || 'Collector'}
                  </th>
                  <th className="py-3.5 px-4" scope="col">
                    {t?.adminOrders?.date || 'Date'}
                  </th>
                  <th className="py-3.5 px-4" scope="col">
                    {t?.adminOrders?.destination || 'Destination'}
                  </th>
                  <th className="py-3.5 px-4" scope="col">
                    {t?.adminOrders?.total || 'Total Value'}
                  </th>
                  <th className="py-3.5 px-4" scope="col">
                    {t?.adminOrders?.dispatchStatus || 'Dispatch Status'}
                  </th>
                  <th className="py-3.5 pe-6 ps-4 text-right" scope="col">
                    {t?.adminOrders?.actions || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-surface-container/60 transition-colors group">
                    <td className="py-4 px-4 font-headline-sm text-body-md font-semibold">
                      {order._id.substring(order._id.length - 8).toUpperCase()}
                    </td>
                    <td className="py-4 px-4 font-medium text-on-surface">
                      {(order as Order & { user?: { name?: string } }).user?.name || t?.adminOrders?.unknown || 'Unknown'}
                    </td>
                    <td className="py-4 px-4 text-on-surface-variant">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-4 px-4 truncate max-w-[200px] text-on-surface-variant">
                      {order.shippingAddress?.city}, {order.shippingAddress?.country}
                    </td>
                    <td className="py-4 px-4">
                      <PriceDisplay amount={order.total} size="sm" className="font-medium" />
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge type="order" status={order.status} />
                    </td>
                    <td className="py-4 pe-6 ps-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'paid' && (
                          <Button
                            onClick={() => handleStatusChange(order._id, 'shipped')}
                            variant="secondary"
                            size="sm"
                            isLoading={pendingId === order._id}
                            disabled={!!pendingId}
                          >
                            {t?.adminOrders?.process || 'Process'}
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button
                            onClick={() => handleStatusChange(order._id, 'delivered')}
                            size="sm"
                            isLoading={pendingId === order._id}
                            disabled={!!pendingId}
                          >
                            {t?.adminOrders?.deliver || 'Deliver'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 text-center bg-surface-container-lowest/30">
              <EmptyState
                icon="package_2"
                title={t?.adminPanel?.orders?.empty || "No commissions in the ledger"}
                description={t?.adminPanel?.orders?.emptyDesc || "There are currently no orders to display."}
              />
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-4 border-t border-outline-variant/20">
            <Button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              variant="secondary"
            >
              Previous
            </Button>
            <span className="font-label-md text-label-md text-on-surface-variant">
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page === totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              variant="secondary"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrdersPage;
