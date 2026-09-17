import { useState, useEffect } from 'react';
import { ShieldCheck, Package, RefreshCw } from 'lucide-react';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    if (savedOrders.length === 0) {
      const initialOrders = [
        { id: 'ORD-9821', user: 'Salma Yehia', total: 155.00, status: 'Pending', date: '2026-06-12', address: 'Cairo, Egypt' },
        { id: 'ORD-8410', user: 'Ahmed Ali', total: 210.00, status: 'Delivered', date: '2026-05-20', address: 'Giza, Egypt' },
      ];
      localStorage.setItem('allOrders', JSON.stringify(initialOrders));
      setOrders(initialOrders);
    } else {
      setOrders(savedOrders);
    }
  }, []);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('allOrders', JSON.stringify(updatedOrders));
    alert(`Order ${orderId} status updated to ${newStatus}!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 font-sans space-y-8">
      
      <div className="flex items-center justify-between border-b border-[#7e22ce]/30 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#130e21] border border-[#7e22ce]/50 flex items-center justify-center shadow-[0_0_15px_rgba(126,34,206,0.3)]">
            <ShieldCheck className="w-6 h-6 text-[#c084fc]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">Admin Portal - Manage Orders</h1>
            <p className="text-xs text-[#cbd5e1]">Review customer orders and update shipping statuses</p>
          </div>
        </div>
        <button 
          onClick={() => {
            const current = JSON.parse(localStorage.getItem('allOrders') || '[]');
            setOrders(current);
          }}
          className="flex items-center gap-2 bg-[#7e22ce]/20 border border-[#7e22ce]/40 text-[#c084fc] text-xs px-4 py-2.5 rounded-xl hover:bg-[#7e22ce]/30 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      <div className="bg-[#130e21] border border-[#7e22ce]/40 rounded-3xl p-6 shadow-[0_0_20px_rgba(126,34,206,0.15)] overflow-x-auto">
        {orders.length > 0 ? (
          <table className="w-full text-left text-xs text-[#cbd5e1]">
            <thead>
              <tr className="border-b border-[#7e22ce]/30 text-[#e9d5ff]">
                <th className="pb-3 px-3">Order ID</th>
                <th className="pb-3 px-3">Customer</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Address</th>
                <th className="pb-3 px-3">Total</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7e22ce]/20">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#7e22ce]/5 transition-colors">
                  <td className="py-4 px-3 text-white font-bold">{order.id}</td>
                  <td className="py-4 px-3 font-semibold text-white">{order.user || 'Salma Yehia'}</td>
                  <td className="py-4 px-3">{order.date}</td>
                  <td className="py-4 px-3 truncate max-w-xs">{order.address || 'Cairo, Egypt'}</td>
                  <td className="py-4 px-3 text-[#c084fc] font-bold">${Number(order.total).toFixed(2)}</td>
                  <td className="py-4 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold ${
                      order.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      order.status === 'Processing' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      order.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right space-x-2">
                    <button 
                      onClick={() => handleStatusChange(order.id, 'Processing')}
                      className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-xl hover:bg-blue-500/20 cursor-pointer transition-colors"
                    >
                      Process
                    </button>
                    <button 
                      onClick={() => handleStatusChange(order.id, 'Delivered')}
                      className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 cursor-pointer transition-colors"
                    >
                      Deliver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 space-y-3">
            <Package className="w-10 h-10 text-[#7e22ce] mx-auto opacity-50" />
            <p className="text-[#cbd5e1] text-xs">No orders placed yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default AdminOrdersPage;