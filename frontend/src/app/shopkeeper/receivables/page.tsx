'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ReceivablesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    api.get('/credipay/receivables').then(r => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const confirmPayment = async (paymentId: number) => {
    try {
      await api.post(`/credipay/confirm-payment/${paymentId}`);
      toast.success('Payment confirmed!');
      fetchData();
    } catch {
      toast.error('Failed to confirm payment');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">CrediPay Receivables</h1>
      <p className="text-gray-500 mb-6">Amounts owed to you via CrediPay orders</p>

        {!loading && data && (
          <div className="card p-5 mb-6">
            <p className="text-gray-500 text-sm mb-1">Total Pending Receivables</p>
            <p className="text-3xl font-bold text-brand-600">₹{Number(data.total_receivable).toFixed(2)}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        ) : (data?.entries || []).length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">✅</div>
            <p>No pending receivables</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(data.entries || []).map((entry: any) => (
              <div key={entry.id} className={`card p-5 ${entry.status === 'OVERDUE' ? 'border-red-500/30' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{entry.ledger?.customer?.name || 'Customer'}</p>
                    <p className="text-xs text-gray-500">{entry.ledger?.customer?.phone} • Order #{entry.order_id}</p>
                    <p className="text-xs text-gray-500">Due: {new Date(entry.due_date).toLocaleDateString()}</p>
                  </div>
                  <span className={entry.status === 'OVERDUE' ? 'badge-red' : entry.status === 'PAID' ? 'badge-green' : 'badge-yellow'}>
                    {entry.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">₹{(parseFloat(entry.total_due) - parseFloat(entry.amount_paid)).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">of ₹{Number(entry.total_due).toFixed(2)}</p>
                  </div>
                  {/* Unconfirmed payments waiting for shopkeeper action */}
                  {(entry.payments || []).filter((p: any) => !p.confirmed_by_shop).map((p: any) => (
                    <div key={p.id} className="text-right">
                      <p className="text-sm text-green-600 font-medium">₹{Number(p.amount).toFixed(2)} awaiting confirmation</p>
                      <button onClick={() => confirmPayment(p.id)} className="btn-primary text-xs mt-1">Confirm Receipt</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
