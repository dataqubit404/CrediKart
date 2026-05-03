'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SubscriptionsPage() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);

  useEffect(() => {
    const type = user?.role === 'SHOPKEEPER' ? 'SHOPKEEPER' : 'CUSTOMER';
    Promise.all([
      api.get(`/subscriptions/plans?type=${type}`),
      api.get('/subscriptions/my-plan'),
    ]).then(([p, c]) => {
      setPlans(p.data || []);
      setCurrent(c.data);
    }).finally(() => setLoading(false));
  }, [user]);

  const subscribe = async (planId: number) => {
    setSubscribing(planId);
    try {
      await api.post('/subscriptions/subscribe', { plan_id: planId, billing_cycle: 'MONTHLY' });
      toast.success('Subscribed successfully!');
      const c = await api.get('/subscriptions/my-plan');
      setCurrent(c.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Subscription failed');
    } finally {
      setSubscribing(null);
    }
  };

  const cancel = async () => {
    if (!confirm('Cancel your subscription?')) return;
    try {
      await api.delete('/subscriptions/cancel');
      toast.success('Subscription cancelled');
      setCurrent(null);
    } catch { toast.error('Failed to cancel'); }
  };

  return (
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Subscription Plans</h1>
      <p className="text-gray-500 mb-8">Upgrade for better credit limits, lower interest, and more.</p>

        {/* Current plan */}
        {current?.plan && (
          <div className="card p-5 mb-8 border-brand-500/40 bg-brand-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-brand-600 font-bold text-lg">⭐ {current.plan.name}</span>
                  <span className="badge-green">Active</span>
                </div>
                <p className="text-gray-500 text-sm">Renews {new Date(current.ends_at).toLocaleDateString()}</p>
              </div>
              <button onClick={cancel} className="btn-secondary text-sm">Cancel Plan</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {plans.map(plan => {
              const benefits: string[] = Array.isArray(plan.benefits) ? plan.benefits : [];
              const isActive = current?.plan_id === plan.id;
              return (
                <div key={plan.id} className={`card p-6 flex flex-col ${isActive ? 'border-brand-500/60' : ''}`}>
                  <div className="mb-5">
                    <h3 className="font-display font-bold text-xl text-gray-900 mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-brand-600">₹{Number(plan.price_monthly).toFixed(0)}</span>
                      <span className="text-gray-500 text-sm">/month</span>
                    </div>
                    {plan.price_yearly && (
                      <p className="text-xs text-green-600 mt-1">₹{Number(plan.price_yearly).toFixed(0)}/year (save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)</p>
                    )}
                  </div>
                  <ul className="space-y-2 flex-1 mb-6">
                    {benefits.map((b: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-600 mt-0.5 shrink-0">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => !isActive && subscribe(plan.id)}
                    disabled={isActive || subscribing === plan.id}
                    className={isActive ? 'btn-secondary opacity-60 cursor-default' : 'btn-primary'}
                  >
                    {subscribing === plan.id ? 'Subscribing...' : isActive ? 'Current Plan' : `Subscribe for ₹${Number(plan.price_monthly).toFixed(0)}/mo`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
