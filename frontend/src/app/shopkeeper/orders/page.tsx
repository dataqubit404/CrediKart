'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUSES = ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COLLECTED', 'CANCELLED'];
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'badge-yellow', CONFIRMED: 'badge-blue', PREPARING: 'badge-blue',
  OUT_FOR_DELIVERY: 'badge-blue', DELIVERED: 'badge-green', COLLECTED: 'badge-green', CANCELLED: 'badge-red'
};

export default function ShopOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = () => {
    const p = filter ? `?status=${filter}` : '';
    api.get(`/orders${p}`).then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success(`Order ${status}`);
      fetchOrders();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">Orders</h1>
        <div className="flex gap-2 mb-5 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!filter ? 'bg-brand-500 text-black' : 'bg-white border border-gray-200 text-gray-600'}`}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === s ? 'bg-brand-500 text-black' : 'bg-white border border-gray-200 text-gray-600'}`}>{s}</button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl"/>)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-500"><div className="text-5xl mb-4">📦</div><p>No orders</p></div>
        ) : (
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">Order #{o.id} — {o.customer?.name}</p>
                    <p className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString()} • {o.payment_method} • {o.delivery_type}</p>
                    {o.address && <p className="text-xs text-gray-400 mt-0.5">📍 {o.address}</p>}
                  </div>
                  <div className="text-right">
                    <span className={STATUS_COLOR[o.status]||'badge-yellow'}>{o.status}</span>
                    <p className="text-gray-900 font-bold mt-1">₹{Number(o.total).toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {(o.items||[]).map((i:any) => `${i.product_name||'Item'} ×${i.qty}`).join(', ')}
                </div>
                {['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERED'].includes(o.status) && (
                  <div className="flex gap-2 flex-wrap">
                    {o.status === 'PENDING' && <button onClick={() => updateStatus(o.id, 'CONFIRMED')} className="btn-primary text-xs">Confirm</button>}
                    {o.status === 'CONFIRMED' && <button onClick={() => updateStatus(o.id, 'PREPARING')} className="btn-primary text-xs">Start Preparing</button>}
                    
                    {o.status === 'PREPARING' && (
                      <>
                        {o.delivery_type === 'DELIVERY' ? (
                          <button onClick={() => updateStatus(o.id, 'OUT_FOR_DELIVERY')} className="btn-primary text-xs">Out for Delivery</button>
                        ) : (
                          <button onClick={() => updateStatus(o.id, 'DELIVERED')} className="btn-primary text-xs">Mark Collected</button>
                        )}
                      </>
                    )}

                    {o.status === 'DELIVERED' && (
                      <button onClick={() => updateStatus(o.id, 'COLLECTED')} className="btn-primary text-xs">Mark Collected</button>
                    )}

                    {['PENDING', 'CONFIRMED', 'PREPARING'].includes(o.status) && (
                      <button onClick={() => updateStatus(o.id, 'CANCELLED')} className="btn-danger text-xs">Cancel</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
