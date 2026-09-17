import React, { useState } from 'react';
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';

export function OrderHistoryPage() {
  const { t } = useLanguage();

  const [orders, setOrders] = useState([
    {
      id: 'ORD-9821',
      date: '2026-06-12',
      status: 'Pending',
      total: 155.0,
      address: '123 Nile Street, Cairo, Egypt',
      items: [
        {
          title: 'Midnight Nebula Luxury Puzzle',
          qty: 1,
          price: 129.0,
        },
      ],
    },
    {
      id: 'ORD-8410',
      date: '2026-05-20',
      status: 'Delivered',
      total: 210.0,
      address: '45 Tahrir Square, Cairo, Egypt',
      items: [
        {
          title: 'Golden Cosmos Masterpiece',
          qty: 1,
          price: 210.0,
        },
      ],
    },
  ]);

  const handleCancelOrder = (orderId: string) => {
    setOrders(
      orders.map((order) => {
        if (
          order.id === orderId &&
          order.status === 'Pending'
        ) {
          return { ...order, status: 'Cancelled' };
        }

        return order;
      })
    );
  };

  const getStatusLabel = (status: string) => {
    if (status === 'Pending') return t.orderHistory.pending;
    if (status === 'Processing') return t.orderHistory.processing;
    if (status === 'Delivered') return t.orderHistory.delivered;
    if (status === 'Cancelled') return t.orderHistory.cancelled;

    return status;
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-12 font-sans text-[var(--text-main)] space-y-8">
      <div className="flex items-center gap-3 border-b border-[#7e22ce]/30 pb-6">
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[#7e22ce]/50 flex items-center justify-center shadow-[0_0_15px_rgba(126,34,206,0.3)]">
          <Package className="w-5 h-5 text-[#c084fc]" />
        </div>

        <div>
          <h1 className="text-2xl font-serif font-bold text-[var(--text-main)]">
            {t.orderHistory.title}
          </h1>

          <p className="text-xs text-[var(--text-muted)]">
            {t.orderHistory.subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-[var(--bg-card)] border border-[#7e22ce]/40 rounded-2xl p-6 space-y-4 shadow-[0_0_20px_rgba(126,34,206,0.15)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#7e22ce]/20 pb-4">
              <div>
                <span className="text-xs text-[#c084fc] font-semibold">
                  {order.id}
                </span>

                <p className="text-[11px] text-[var(--text-muted)]">
                  {t.orderHistory.placedOn} {order.date}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
                    order.status === 'Pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : order.status === 'Delivered'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {order.status === 'Pending' && (
                    <Clock className="w-3 h-3" />
                  )}

                  {order.status === 'Delivered' && (
                    <CheckCircle2 className="w-3 h-3" />
                  )}

                  {order.status === 'Cancelled' && (
                    <XCircle className="w-3 h-3" />
                  )}

                  <span>{getStatusLabel(order.status)}</span>
                </span>

                {order.status === 'Pending' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1 rounded-xl hover:bg-red-500/20 transition-colors cursor-pointer"
                  >
                    {t.orderHistory.cancelOrder}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[var(--text-muted)]">
              <div className="space-y-1">
                <p className="text-[var(--text-main)] font-bold">
                  {t.orderHistory.shippingAddress}
                </p>

                <p>{order.address}</p>
              </div>

              <div className="space-y-1 md:text-right">
                <p className="text-[var(--text-main)] font-bold">
                  {t.orderHistory.totalAmount}
                </p>

                <p className="text-base text-[#c084fc] font-bold">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderHistoryPage;