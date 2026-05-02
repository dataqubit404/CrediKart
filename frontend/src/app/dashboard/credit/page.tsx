'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'badge-yellow', PAID: 'badge-green', OVERDUE: 'badge-red', PARTIAL: 'badge-blue',
  };
  return <span className={map[status] || 'badge-yellow'}>{status}</span>;
}

export default function CreditPage() {
  const [ledger, setLedger] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [paying, setPaying] = useState(false);

  const fetchLedger = () => {
    api.get('/credipay/ledger').then(r => setLedger(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLedger(); }, []);

  const handlePay = async () => {
    if (!payModal || !payAmount || parseFloat(payAmount) <= 0) return;
    setPaying(true);
    try {
      await api.post('/credipay/pay', {
        entry_id: payModal.id,
        amount: parseFloat(payAmount),
        method: 'QR_CASH',
      });
      toast.success('Payment recorded! Awaiting shopkeeper confirmation.');
      setPayModal(null);
      setPayAmount('');
      fetchLedger();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-2xl text-white mb-6">CrediPay Account</h1>

        {ledger && (
          <>
            {/* Summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Credit Limit', value: `₹${Number(ledger.credit_limit).toFixed(0)}`, color: 'text-white' },
                { label: 'Total Due', value: `₹${Number(ledger.total_due).toFixed(2)}`, color: 'text-red-400' },
                { label: 'Available', value: `₹${Number(ledger.available_credit).toFixed(0)}`, color: 'text-green-400' },
                { label: 'Interest Accrued', value: `₹${Number(ledger.interest_accrued).toFixed(2)}`, color: 'text-orange-400' },
              ].map(s => (
                <div key={s.label} className="card p-4">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Entries list */}
            <h2 className="font-semibold text-white mb-4">Payment Entries</h2>
            <div className="space-y-3">
              {(ledger.entries || []).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">✅</div>
                  <p>No pending dues</p>
                </div>
              ) : (
                (ledger.entries || []).map((entry: any) => (
                  <div key={entry.id} className={`card p-5 ${entry.is_overdue ? 'border-red-500/30' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-white">{entry.shop?.name || 'Shop'}</p>
                        <p className="text-xs text-gray-400">Order #{entry.order_id} • {new Date(entry.created_at).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={entry.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                      <div><p className="text-gray-500 text-xs">Principal</p><p className="text-white font-medium">₹{entry.principal}</p></div>
                      <div><p className="text-gray-500 text-xs">Platform fee</p><p className="text-orange-400 font-medium">₹{entry.platform_fee}</p></div>
                      <div><p className="text-gray-500 text-xs">Interest</p><p className="text-red-400 font-medium">₹{entry.interest_due}</p></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Balance due</p>
                        <p className="text-lg font-bold text-white">₹{entry.balance}</p>
                        <p className="text-xs text-gray-500">Due by {new Date(entry.due_date).toLocaleDateString()}</p>
                        {entry.is_overdue && (
                          <p className="text-xs text-red-400 mt-0.5">⚠ {entry.days_overdue} days overdue – interest accruing!</p>
                        )}
                      </div>
                      {entry.status !== 'PAID' && entry.balance > 0 && (
                        <button
                          onClick={() => { setPayModal(entry); setPayAmount(entry.balance.toString()); }}
                          className="btn-primary text-sm"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                    {/* Unconfirmed payments */}
                    {(entry.payments || []).filter((p: any) => !p.confirmed_by_shop).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        {(entry.payments || []).filter((p: any) => !p.confirmed_by_shop).map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between text-xs">
                            <p className="text-gray-400">Payment of <span className="text-white font-bold">₹{Number(p.amount).toFixed(2)}</span> recorded</p>
                            <span className="text-yellow-500 font-bold animate-pulse">Awaiting Shopkeeper Confirmation</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Pay Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="card p-6 w-full max-w-sm">
            <h3 className="font-display font-bold text-white text-lg mb-1">Record Payment</h3>
            <p className="text-gray-400 text-sm mb-5">Pay to {payModal.shop?.name} for Order #{payModal.order_id}</p>
            <div className="mb-5">
              <label className="label">Amount (₹)</label>
              <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                max={payModal.balance} min="1" step="0.01" className="input text-lg font-bold" />
              <p className="text-xs text-gray-500 mt-1">Balance: ₹{payModal.balance}</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 mb-5">
              Show your payment QR or pay cash to the shopkeeper. They will confirm the payment.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPayModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handlePay} disabled={paying} className="btn-primary flex-1">
                {paying ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
