import { useState, useEffect, useCallback } from 'react';
import { Package, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { ordersApi, type Order } from './ordersApi';
import { Link } from 'react-router-dom';

export function OrderHistoryPage() {
  const { t } = useLanguage() as any;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ordersApi.getMyOrders(page, limit);
      setOrders(res.items);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await ordersApi.cancelOrder(orderId);
      // Re-fetch to get updated state
      fetchOrders();
    } catch (err) {
      console.error('Failed to cancel order', err);
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'pending') return t.orderHistory?.pending || 'Pending';
    if (status === 'paid') return t.orderHistory?.paid || 'Paid';
    if (status === 'shipped') return t.orderHistory?.shipped || 'Shipped';
    if (status === 'delivered') return t.orderHistory?.delivered || 'Delivered';
    if (status === 'cancelled') return t.orderHistory?.cancelled || 'Cancelled';
    return status;
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-12 font-sans space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="w-10 h-10 rounded-md bg-background border border-border flex items-center justify-center shadow-[0_0_15px_rgba(126,34,206,0.3)]">
          <Package className="w-5 h-5 text-[#c084fc]" />
        </div>

        <div>
          <h1 className="text-2xl font-serif font-bold text-white">
            {t.orderHistory?.title || 'Order History'}
          </h1>

          <p className="text-xs text-[#cbd5e1]">
            {t.orderHistory?.subtitle || 'View and manage your recent purchases'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-[#cbd5e1] py-8">Loading orders...</div>
      ) : error ? (
        <div className="text-center text-red-400 py-8">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-[#cbd5e1] py-8">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-background border border-border rounded-md p-6 space-y-4 shadow-[0_0_20px_rgba(126,34,206,0.15)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <span className="text-xs text-[#c084fc] font-semibold">
                    {order._id}
                  </span>

                  <p className="text-[11px] text-[#cbd5e1]">
                    {t.orderHistory?.placedOn || 'Placed on'} {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 ${
                      order.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : order.status === 'delivered'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : order.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : order.status === 'paid'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {order.status === 'pending' && <Clock className="w-3 h-3" />}
                    {order.status === 'delivered' && <CheckCircle2 className="w-3 h-3" />}
                    {order.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                    {(order.status === 'paid' || order.status === 'shipped') && <Package className="w-3 h-3" />}

                    <span>{getStatusLabel(order.status)}</span>
                  </span>

                  <Link
                    to={`/orders/${order._id}`}
                    className="bg-[#7e22ce]/10 border border-[#7e22ce]/30 text-[#c084fc] text-xs px-3 py-1 rounded-md hover:bg-[#7e22ce]/20 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3 h-3" />
                    {t.orderHistory?.viewDetails || 'View Details'}
                  </Link>

                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1 rounded-md hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      {t.orderHistory?.cancelOrder || 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#cbd5e1]">
                <div className="space-y-1">
                  <p className="text-white font-bold">
                    {t.orderHistory?.shippingAddress || 'Shipping Address'}
                  </p>
                  <p>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}</p>
                </div>

                <div className="space-y-1 md:text-right">
                  <p className="text-white font-bold">
                    {t.orderHistory?.totalAmount || 'Total Amount'}
                  </p>

                  <p className="text-base text-[#c084fc] font-bold">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-border">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous Page"
                className="p-2 bg-background border border-border text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surfaceElevated transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-sm text-[#cbd5e1]">
                Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next Page"
                className="p-2 bg-background border border-border text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surfaceElevated transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;