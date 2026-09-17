import { useState, useEffect } from 'react';
import { ShieldCheck, Package, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';

export function AdminOrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const savedOrders = JSON.parse(
      localStorage.getItem('allOrders') || '[]'
    );

    if (savedOrders.length === 0) {
      const initialOrders = [
        {
          id: 'ORD-9821',
          user: 'Salma Yehia',
          total: 155.0,
          status: 'Pending',
          date: '2026-06-12',
          address: 'Cairo, Egypt',
        },
        {
          id: 'ORD-8410',
          user: 'Ahmed Ali',
          total: 210.0,
          status: 'Delivered',
          date: '2026-05-20',
          address: 'Giza, Egypt',
        },
      ];

      localStorage.setItem(
        'allOrders',
        JSON.stringify(initialOrders)
      );

      setOrders(initialOrders);
    } else {
      setOrders(savedOrders);
    }
  }, []);

  const handleStatusChange = (
    orderId: string,
    newStatus: string
  ) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return { ...order, status: newStatus };
      }

      return order;
    });

    setOrders(updatedOrders);
    localStorage.setItem(
      'allOrders',
      JSON.stringify(updatedOrders)
    );

    alert(
      `Order ${orderId} ${t.adminOrders.statusUpdated} ${getStatusLabel(
        newStatus
      )}!`
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
    <div className="max-w-7xl mx-auto px-8 py-12 font-sans text-[var(--text-main)] space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-[var(--bg-card)] border border-border flex items-center justify-center shadow-[0_0_15px_rgba(126,34,206,0.3)]">
            <ShieldCheck className="w-6 h-6 text-[#c084fc]" />
          </div>

          <div>
            <h1 className="text-2xl font-serif font-bold text-[var(--text-main)]">
              {t.adminOrders.title}
            </h1>

            <p className="text-xs text-[var(--text-muted)]">
              {t.adminOrders.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const current = JSON.parse(
              localStorage.getItem('allOrders') || '[]'
            );

            setOrders(current);
          }}
          className="flex items-center gap-2 bg-[#7e22ce]/20 border border-border text-[#c084fc] text-xs px-4 py-2.5 rounded-md hover:bg-[#7e22ce]/30 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t.adminOrders.refresh}</span>
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-border rounded-md p-6 shadow-[0_0_20px_rgba(126,34,206,0.15)] overflow-x-auto">
        {orders.length > 0 ? (
          <table className="w-full text-left text-xs text-[var(--text-muted)]">
            <thead>
              <tr className="border-b border-border text-[var(--text-main)]">
                <th className="pb-3 px-3">{t.adminOrders.orderId}</th>
                <th className="pb-3 px-3">{t.adminOrders.customer}</th>
                <th className="pb-3 px-3">{t.adminOrders.date}</th>
                <th className="pb-3 px-3">{t.adminOrders.address}</th>
                <th className="pb-3 px-3">{t.adminOrders.total}</th>
                <th className="pb-3 px-3">{t.adminOrders.status}</th>
                <th className="pb-3 px-3 text-right">
                  {t.adminOrders.actions}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#7e22ce]/20">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[#7e22ce]/5 transition-colors"
                >
                  <td className="py-4 px-3 text-[var(--text-main)] font-bold">
                    {order.id}
                  </td>

                  <td className="py-4 px-3 font-semibold text-[var(--text-main)]">
                    {order.user || 'Salma Yehia'}
                  </td>

                  <td className="py-4 px-3">
                    {order.date}
                  </td>

                  <td className="py-4 px-3 truncate max-w-xs">
                    {order.address || 'Cairo, Egypt'}
                  </td>

                  <td className="py-4 px-3 text-[#c084fc] font-bold">
                    ${Number(order.total).toFixed(2)}
                  </td>

                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold ${
                        order.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : order.status === 'Processing'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : order.status === 'Delivered'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </td>

                  <td className="py-4 px-3 text-right space-x-2">
                    <button
                      onClick={() =>
                        handleStatusChange(order.id, 'Processing')
                      }
                      className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-md hover:bg-blue-500/20 cursor-pointer transition-colors"
                    >
                      {t.adminOrders.process}
                    </button>

                    <button
                      onClick={() =>
                        handleStatusChange(order.id, 'Delivered')
                      }
                      className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-md hover:bg-emerald-500/20 cursor-pointer transition-colors"
                    >
                      {t.adminOrders.deliver}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 space-y-3">
            <Package className="w-10 h-10 text-[#7e22ce] mx-auto opacity-50" />

            <p className="text-[var(--text-muted)] text-xs">
              {t.adminOrders.noOrders}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrdersPage;