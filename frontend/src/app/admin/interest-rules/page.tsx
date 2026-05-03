'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function InterestRulesPage() {
  const [rules, setRules] = useState<any>(null);
  const [form, setForm] = useState({ free_days: 7, overdue_rate: 0.005, interval_days: 7, max_rate: 0.3 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/credipay/rules').then(r => {
      const rule = r.data?.[0];
      if (rule) {
        setRules(rule);
        setForm({
          free_days: rule.free_days,
          overdue_rate: parseFloat(rule.overdue_rate),
          interval_days: rule.interval_days,
          max_rate: parseFloat(rule.max_rate),
        });
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/credipay/rules', form);
      toast.success('Interest rules updated');
    } catch { toast.error('Failed to update rules'); }
    finally { setSaving(false); }
  };

  const triggerCalc = async () => {
    try {
      const { data } = await api.post('/credipay/calculate-interest');
      toast.success(`Interest calculated on ${data.processed} entries`);
    } catch { toast.error('Failed to run calculation'); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl text-white mb-2">CrediPay Interest Rules</h1>
        <p className="text-gray-400 mb-8">Configure how interest is calculated on overdue CrediPay balances.</p>

        {/* Explainer */}
        <div className="card p-5 mb-6 border-brand-500/30">
          <h3 className="font-semibold text-white mb-3">How Interest Works</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>1. Customer places order with <strong className="text-brand-500">CrediPay</strong></p>
            <p>2. <strong className="text-white">2.8% platform fee</strong> is added immediately (non-refundable)</p>
            <p>3. Customer has <strong className="text-white">{form.free_days} days</strong> to pay with no extra interest</p>
            <p>4. After grace period: <strong className="text-red-400">+{(form.overdue_rate * 100).toFixed(2)}%</strong> added every <strong className="text-white">{form.interval_days} days</strong></p>
            <p>5. Interest is capped at <strong className="text-white">{(form.max_rate * 100).toFixed(0)}%</strong> total</p>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-white mb-5">Edit Rules</h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="label">Free Days (Grace Period)</label>
              <input
                type="number" min="1" max="30"
                value={form.free_days}
                onChange={e => setForm(f => ({ ...f, free_days: parseInt(e.target.value) }))}
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">Days before interest starts accruing</p>
            </div>
            <div>
              <label className="label">Overdue Rate (per interval)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number" min="0.001" max="0.05" step="0.001"
                  value={form.overdue_rate}
                  onChange={e => setForm(f => ({ ...f, overdue_rate: parseFloat(e.target.value) }))}
                  className="input"
                />
                <span className="text-gray-400 shrink-0">{(form.overdue_rate * 100).toFixed(2)}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Interest rate charged per interval (e.g. 0.005 = 0.5%)</p>
            </div>
            <div>
              <label className="label">Interval Days</label>
              <input
                type="number" min="1" max="30"
                value={form.interval_days}
                onChange={e => setForm(f => ({ ...f, interval_days: parseInt(e.target.value) }))}
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">How often overdue rate is applied</p>
            </div>
            <div>
              <label className="label">Maximum Total Rate (cap)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number" min="0.05" max="0.5" step="0.01"
                  value={form.max_rate}
                  onChange={e => setForm(f => ({ ...f, max_rate: parseFloat(e.target.value) }))}
                  className="input"
                />
                <span className="text-gray-400 shrink-0">{(form.max_rate * 100).toFixed(0)}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Interest will not exceed this % of the principal</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full py-3">
              {saving ? 'Saving...' : 'Save Rules'}
            </button>
          </form>
        </div>

        {/* Manual trigger */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-2">Manual Interest Calculation</h3>
          <p className="text-gray-400 text-sm mb-4">Interest auto-accrues daily at midnight via cron. Use this to trigger it manually for testing.</p>
          <button onClick={triggerCalc} className="btn-secondary w-full">
            ⚡ Run Interest Calculation Now
          </button>
        </div>
      </div>
    </div>
  );
}
