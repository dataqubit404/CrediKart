'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function CreditMeter() {
  const [ledger, setLedger] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/credipay/ledger').then(r => setLedger(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="card p-6">
      <div className="skeleton h-4 w-32 mb-4 rounded" />
      <div className="skeleton h-3 w-full rounded mb-3" />
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-16 rounded-xl" />
        <div className="skeleton h-16 rounded-xl" />
      </div>
    </div>
  );

  if (!ledger) return null;

  const pct = Math.min(100, parseFloat(ledger.utilization_pct));
  const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981';
  const overdueCount = ledger.entries?.filter((e: any) => e.is_overdue).length || 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-white text-lg">CrediPay</h3>
        <span className="badge-green">Active</span>
      </div>

      {/* Credit bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Used ₹{ledger.total_due.toFixed(0)}</span>
          <span>Limit ₹{ledger.credit_limit.toFixed(0)}</span>
        </div>
        <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{pct}% utilised</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Available</p>
          <p className="text-lg font-bold text-green-400">₹{ledger.available_credit.toFixed(0)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Interest Accrued</p>
          <p className="text-lg font-bold text-red-400">₹{ledger.interest_accrued.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Total Due</p>
          <p className="text-lg font-bold text-white">₹{ledger.total_due.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Total Paid</p>
          <p className="text-lg font-bold text-white">₹{(ledger.total_paid || 0).toFixed(2)}</p>
        </div>
      </div>

      {overdueCount > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm font-semibold">⚠ {overdueCount} overdue payment{overdueCount > 1 ? 's' : ''}</p>
          <p className="text-red-300/70 text-xs mt-0.5">Interest is accruing. Pay now to stop charges.</p>
        </div>
      )}

      <Link href="/dashboard/credit" className="block mt-4 text-center text-sm text-brand-500 hover:text-brand-400 font-medium transition-colors">
        View all dues →
      </Link>
    </div>
  );
}
