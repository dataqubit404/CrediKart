'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = () => {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    api.get(`/admin/orders${params}`).then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const refund = async (id: number) => {
    const reason = prompt('Refund reason:');
    if (!reason) return;
    try {
      await api.post(`/admin/refund/${id}`, { reason });
      toast.success('Refund processed');
      fetchOrders();
    } catch { toast.error('Refund failed'); }
  };

  const STATUS_COLOR: Record<string, string> = {
    PENDING: 'badge-yellow', CONFIRMED: 'badge-blue', DELIVERED: 'badge-green',
    CANCELLED: 'badge-red', REFUNDED: 'badge-red', PREPARING: 'badge-blue', OUT_FOR_DELIVERY: 'badge-blue',
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-2xl text-white mb-6">All Orders</h1>
        <div className="flex gap-3 mb-6">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-48">
            <option value="">All Statuses</option>
            {['PENDING','CONFIRMED','PREPARING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Order</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Shop</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Method</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">Total</th>
                  <th className="text-right px-4 py-3 text-gray-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-white font-medium">#{o.id}</td>
                    <td className="px-4 py-3 text-gray-300">{o.customer?.name}</td>
                    <td className="px-4 py-3 text-gray-300">{o.shop?.name}</td>
                    <td className="px-4 py-3"><span className={o.payment_method === 'CREDIPAY' ? 'badge-yellow' : 'badge-blue'}>{o.payment_method}</span></td>
                    <td className="px-4 py-3"><span className={STATUS_COLOR[o.status] || 'badge-yellow'}>{o.status}</span></td>
                    <td className="px-4 py-3 text-right text-white font-bold">₹{Number(o.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      {['DELIVERED', 'CONFIRMED'].includes(o.status) && (
                        <button onClick={() => refund(o.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
