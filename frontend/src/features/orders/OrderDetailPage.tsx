import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, XCircle, ArrowLeft, RotateCcw, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { ordersApi, type Order } from './ordersApi';

export function OrderDetailPage() {
  const { t } = useLanguage() as any;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('You do not have permission to view this order.');
      } else if (err.response?.status === 404) {
        setError('Order not found.');
      } else {
        setError('Failed to load order details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleReorder = async () => {
    if (!order) return;
    try {
      setReordering(true);
      setReorderError(null);
      // Create new order with past items (backend computes prices)
      const newOrderData = {
        items: order.items.map(item => ({
          product: item.productId || item.product,
          quantity: item.quantity
        })),
        shippingAddress: order.shippingAddress
      };
      
      const newOrder = await ordersApi.createOrder(newOrderData as any);
      
      // Navigate to the newly created order
      navigate(`/orders/${newOrder._id}`);
    } catch (err: any) {
      console.error('Reorder failed', err);
      // Show error if items are out of stock or price changed (if backend validates this)
      setReorderError(err.response?.data?.message || 'Failed to reorder. Some items may be out of stock.');
    } finally {
      setReordering(false);
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

  if (loading) {
    return <div className="p-8 text-center text-[#cbd5e1]">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-12 text-center space-y-4">
        <div className="text-red-400 p-6 bg-red-500/10 border border-red-500/30 rounded-md">
          {error || 'Order not found.'}
        </div>
        <Link to="/orders" className="inline-flex items-center gap-2 text-[#c084fc] hover:text-[#e9d5ff] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-12 font-sans space-y-8 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-2 text-[#cbd5e1] hover:text-white transition-colors mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </Link>
          <h1 className="text-2xl font-serif font-bold">
            Order <span className="text-[#c084fc]">#{order._id}</span>
          </h1>
          <p className="text-xs text-[#cbd5e1] mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <span
            className={`text-sm px-4 py-1.5 rounded-md font-semibold flex items-center gap-2 ${
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
            {order.status === 'pending' && <Clock className="w-4 h-4" />}
            {order.status === 'delivered' && <CheckCircle2 className="w-4 h-4" />}
            {order.status === 'cancelled' && <XCircle className="w-4 h-4" />}
            {(order.status === 'paid' || order.status === 'shipped') && <Package className="w-4 h-4" />}
            <span>{getStatusLabel(order.status)}</span>
          </span>
          
          <button
            onClick={handleReorder}
            disabled={reordering}
            className="flex items-center gap-2 bg-[#7e22ce] hover:bg-[#a855f7] text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            {reordering ? 'Processing...' : 'Reorder Items'}
          </button>
        </div>
      </div>

      {reorderError && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm p-4 rounded-md flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{reorderError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background border border-border rounded-md shadow-[0_0_20px_rgba(126,34,206,0.15)] overflow-hidden">
            <h2 className="text-base font-serif font-bold p-4 border-b border-border bg-surfaceElevated/30">Order Items</h2>
            <div className="divide-y divide-border">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 p-4">
                  <div className="w-20 h-20 bg-surfaceElevated rounded-md border border-border flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#cbd5e1]">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate text-white">{item.title || 'Product'}</h3>
                    <p className="text-xs text-[#cbd5e1] mt-1">Qty: {item.quantity}</p>
                    <p className="text-sm text-[#c084fc] font-bold mt-2">${item.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-background border border-border rounded-md shadow-[0_0_20px_rgba(126,34,206,0.15)] p-5">
            <h2 className="text-base font-serif font-bold border-b border-border pb-3 mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#cbd5e1]">
                <span>Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#cbd5e1]">
                <span>Shipping</span>
                <span>$0.00</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg text-white">
                <span>Total</span>
                <span className="text-[#c084fc]">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-md shadow-[0_0_20px_rgba(126,34,206,0.15)] p-5">
            <h2 className="text-base font-serif font-bold border-b border-border pb-3 mb-4">Shipping Address</h2>
            <div className="text-sm text-[#cbd5e1] leading-relaxed space-y-1">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;
