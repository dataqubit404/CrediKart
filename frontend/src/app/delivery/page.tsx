'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function DeliveryDashboard() {
  const { user, fetchMe } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<any>({ assignments: [], total_earned: '0' });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/delivery/available-orders'),
      api.get('/delivery/my-deliveries'),
    ]).then(([a, m]) => {
      setOrders(a.data || []);
      setMyDeliveries(m.data);
    }).finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      await api.put('/delivery/availability');
      await fetchMe();
      toast.success('Availability updated');
    } catch { toast.error('Failed'); } finally { setToggling(false); }
  };

  const acceptOrder = async (orderId: number) => {
    try {
      await api.post(`/delivery/accept/${orderId}`);
      toast.success('Order accepted!');
      setOrders(o => o.filter(x => x.id !== orderId));
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Failed'); }
  };

  const updateStatus = async (assignmentId: number, status: string) => {
    try {
      await api.put(`/delivery/assignment/${assignmentId}/status`, { status });
      toast.success(`Status updated: ${status}`);
      const r = await api.get('/delivery/my-deliveries');
      setMyDeliveries(r.data);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Delivery Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Total Earned: <span className="text-green-600 font-bold text-lg">₹{myDeliveries.total_earned}</span></p>
        </div>
        <button onClick={toggleAvailability} disabled={toggling}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            user?.is_available !== false
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}>
          {toggling ? '...' : user?.is_available !== false ? '🟢 Online' : '🔴 Offline'}
        </button>
      </div>

      {/* Available orders */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Available Orders ({orders.length})</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="card p-6 text-center text-gray-400">No orders available right now</div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="card p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Order #{o.id}</p>
                  <p className="text-sm text-gray-500">{o.shop?.name}</p>
                  <p className="text-xs text-gray-400">📍 {o.shop?.address}</p>
                  <p className="text-sm font-bold text-brand-600 mt-1">₹{Number(o.total).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-600 font-bold text-sm mb-2">Earn ₹30</p>
                  <button onClick={() => acceptOrder(o.id)} className="btn-primary text-sm">Accept</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active deliveries */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-4">My Deliveries</h2>
        <div className="space-y-3">
          {(myDeliveries.assignments || []).slice(0, 10).map((a: any) => (
            <div key={a.id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">Order #{a.order_id}</p>
                  <p className="text-sm text-gray-500">{a.order?.shop?.name}</p>
                </div>
                <span className={a.status === 'DELIVERED' ? 'badge-green' : a.status === 'FAILED' ? 'badge-red' : a.status === 'YELLOW' ? 'badge-yellow' : 'badge-yellow'}>{a.status}</span>
              </div>
              {a.status === 'ASSIGNED' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => updateStatus(a.id, 'PICKED_UP')} className="btn-secondary text-sm flex-1">Picked Up</button>
                  <button onClick={() => updateStatus(a.id, 'DELIVERED')} className="btn-primary text-sm flex-1">Delivered ✓</button>
                </div>
              )}
              {a.status === 'PICKED_UP' && (
                <button onClick={() => updateStatus(a.id, 'DELIVERED')} className="btn-primary text-sm w-full mt-3">Mark Delivered ✓</button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
