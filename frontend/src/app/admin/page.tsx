'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.users, icon: '👥', color: 'text-blue-400', sub: `${stats.pending_customers} pending verification` },
    { label: 'Active Shops', value: stats.shops, icon: '🏪', color: 'text-green-400', sub: `${stats.pending_shops} pending approval` },
    { label: 'Total Orders', value: stats.orders, icon: '📦', color: 'text-purple-400', sub: `₹${Number(stats.today_revenue || 0).toFixed(0)} today` },
    { label: 'Platform Earnings', value: `₹${Number(stats.platform_earnings || 0).toFixed(0)}`, icon: '💰', color: 'text-brand-500', sub: `₹${Number(stats.credipay_earnings || 0).toFixed(0)} from CrediPay` },
    { label: 'Active Subscriptions', value: stats.active_subscriptions, icon: '⭐', color: 'text-yellow-400', sub: 'Across all plans' },
    { label: 'Total Revenue', value: `₹${Number(stats.total_revenue || 0).toFixed(0)}`, icon: '📈', color: 'text-emerald-400', sub: 'All time' },
  ] : [];

  const navLinks = [
    { href: '/admin/approvals', label: 'Approvals', icon: '✅', badge: stats ? (stats.pending_shops + stats.pending_customers) : 0 },
    { href: '/admin/users', label: 'Users', icon: '👥', badge: 0 },
    { href: '/admin/orders', label: 'Orders', icon: '📦', badge: 0 },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: '⭐', badge: 0 },
    { href: '/admin/interest-rules', label: 'Interest Rules', icon: '⚙️', badge: 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Platform overview and controls</p>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
        {navLinks.map(l => (
          <Link key={l.href} href={l.href} className="card p-4 text-center hover:border-gray-600 transition-all relative group">
            {l.badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{l.badge}</span>
            )}
            <div className="text-2xl mb-1">{l.icon}</div>
            <p className="text-xs font-medium text-white">{l.label}</p>
          </Link>
        ))}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map(s => (
            <div key={s.label} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl">{s.icon}</div>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-white font-medium mt-1">{s.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
