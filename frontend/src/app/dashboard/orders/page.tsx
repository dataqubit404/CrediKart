'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'badge-yellow', CONFIRMED: 'badge-blue', PREPARING: 'badge-blue',
  OUT_FOR_DELIVERY: 'badge-blue', DELIVERED: 'badge-green', COLLECTED: 'badge-green', CANCELLED: 'badge-red', REFUNDED: 'badge-red',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">My Orders</h1>
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📦</div>
            <p>No orders yet. Start shopping!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">Order #{o.id}</p>
                    <p className="text-xs text-gray-500">{o.shop?.name} • {new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={STATUS_COLORS[o.status] || 'badge-yellow'}>{o.status}</span>
                </div>
                {o.address && o.delivery_type === 'DELIVERY' && (
                  <p className="text-xs text-gray-500 mb-2 truncate">📍 {o.address}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-400">{o.payment_method}</span>
                    <span className="text-gray-400">{o.delivery_type}</span>
                    <span className="text-gray-500">{o.items?.length || 0} items</span>
                  </div>
                  <span className="text-gray-900 font-bold">₹{Number(o.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
