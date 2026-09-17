import { useEffect, useState } from 'react';
import { Package, Clock } from 'lucide-react';

export function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('mp_orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch {
        setOrders([]);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0914] text-white px-6 py-12 font-serif space-y-8">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="flex items-center gap-2 text-[#c084fc]">
          <Package className="w-6 h-6" />
          <h1 className="text-2xl font-bold tracking-wide">My Orders</h1>
        </div>
        <p className="text-xs text-[#a1a1aa] font-sans">Track your puzzle shipments and order history</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-background border border-[#221738] rounded-md space-y-3 font-sans shadow-[0_0_30px_rgba(126,34,206,0.1)]">
            <Clock className="w-10 h-10 mx-auto text-[#7e22ce]" />
            <p className="text-xs text-[#a1a1aa]">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {orders.map((order: any, idx: number) => (
              <div key={order.id || idx} className="bg-background border border-[#221738] p-6 rounded-md flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-white">Order #{order.id || idx + 1}</h3>
                  <p className="text-[10px] text-[#a1a1aa]">Total: ${order.total || order.price || '0.00'}</p>
                </div>
                <span className="px-3 py-1 rounded-md text-[10px] bg-surface text-[#d8b4fe] border border-border">
                  {order.status || 'Processing'}
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