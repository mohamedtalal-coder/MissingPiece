import React, { useEffect, useState } from 'react';
import { useLanguage } from './context/LanguageContext';
import { Package, Clock, Loader2 } from 'lucide-react';
import { ordersApi, type Order } from '../features/orders/ordersApi';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from './context/ToastContext';

export function MyOrdersPage() {
  const { t } = useLanguage() as any;
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getMyOrders();
      setOrders(res.items);
    } catch (err) {
      console.error(err);
      showToast({ message: 'Failed to load orders', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadOrders();
  }, [isAuthenticated, loadOrders]);

  
  return (
    <div className="min-h-screen bg-[#0b0914] text-white px-6 py-12 font-serif space-y-8">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="flex items-center gap-2 text-[#c084fc]">
          <Package className="w-6 h-6" />
          <h1 className="text-2xl font-bold tracking-wide">{t.orders?.myOrders || "My Orders"}</h1>
        </div>
        <p className="text-xs text-[#a1a1aa] font-sans">{t.orders?.trackHistory || "Track your puzzle shipments and order history"}</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7e22ce]" />
          </div>
        ) : !isAuthenticated ? (
          <div className="text-center py-20 bg-background border border-[#221738] rounded-md space-y-3 font-sans shadow-[0_0_30px_rgba(126,34,206,0.1)]">
            <p className="text-xs text-[#a1a1aa]">Please sign in to view your orders.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-background border border-[#221738] rounded-md space-y-3 font-sans shadow-[0_0_30px_rgba(126,34,206,0.1)]">
            <Clock className="w-10 h-10 mx-auto text-[#7e22ce]" />
            <p className="text-xs text-[#a1a1aa]">{t.orders?.noOrders || "You haven't placed any orders yet."}</p>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {orders.map((order: Order) => (
              <div key={order._id || order.id} className="bg-background border border-[#221738] p-6 rounded-md flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-white">Order #{order._id || order.id}</h3>
                  <p className="text-[10px] text-[#a1a1aa]">Total: ${order.total || '0.00'}</p>
                </div>
                <span className="px-3 py-1 rounded-md text-[10px] bg-surface text-[#d8b4fe] border border-border uppercase">
                  {order.status || 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;