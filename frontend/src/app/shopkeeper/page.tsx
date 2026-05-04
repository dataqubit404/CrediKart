'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function ShopkeeperDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/shops/my'),
      api.get('/shops/analytics'),
      api.get('/orders?limit=5'),
    ]).then(([s, a, o]) => {
      setShop(s.data);
      setAnalytics(a.data);
      setRecentOrders(o.data.orders || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="skeleton h-10 w-64 rounded-xl mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}
        </div>
    </div>
  );

  if (!shop) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-gray-200 border border-gray-100 flex flex-col items-center text-center max-w-md">
          <div className="text-7xl mb-6">🏪</div>
          <h2 className="font-display font-black text-3xl text-gray-900 mb-2">Welcome Aboard!</h2>
          <p className="text-gray-500 font-medium mb-10">You haven't registered your shop yet. Let's get your products online.</p>
          <Link href="/shopkeeper/register" className="w-full bg-blinkit-green hover:bg-green-700 text-white font-black py-4 rounded-2xl text-lg shadow-xl shadow-green-100 transition-all">
            Launch My Shop 🚀
          </Link>
        </div>
    </div>
  );

  const stats = [
    { label: "Today's Orders", value: analytics?.today_orders || 0, color: 'text-blue-600', bg: 'bg-blue-50', icon: '📦' },
    { label: 'Total Revenue', value: `₹${Number(analytics?.total_revenue || 0).toFixed(0)}`, color: 'text-green-600', bg: 'bg-green-50', icon: '💰' },
    { label: 'CrediPay Pending', value: `₹${Number(analytics?.credipay_receivables || 0).toFixed(0)}`, color: 'text-orange-600', bg: 'bg-orange-50', icon: '🪙' },
    { label: 'Total Orders', value: analytics?.total_orders || 0, color: 'text-purple-600', bg: 'bg-purple-50', icon: '🛒' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-brand-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Active Store</span>
            <h1 className="font-display font-black text-3xl text-gray-900 tracking-tight">{shop.name}</h1>
          </div>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Store Status: <span className="font-black text-gray-700 uppercase text-xs tracking-widest">{shop.status}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/shopkeeper/register" className="bg-white border border-gray-200 text-gray-700 font-bold px-6 py-3 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
            Store Settings
          </Link>
          <Link href={`/shop/${shop.id}`} className="bg-brand-500 text-black font-bold px-6 py-3 rounded-2xl hover:bg-brand-600 transition-all shadow-sm">
            View Public Shop
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map(s => (
          <div key={s.label} className="card p-8 group transition-all">
            <div className="text-3xl mb-4">{s.icon}</div>
            <p className={`text-3xl font-black ${s.color} tracking-tight`}>{s.value}</p>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {[
              { href: '/shopkeeper/products', label: 'Manage Inventory', icon: '🏷️', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { href: '/shopkeeper/orders', label: 'Customer Orders', icon: '📦', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { href: '/shopkeeper/receivables', label: 'Receivables', icon: '💳', color: 'text-amber-600', bg: 'bg-amber-50' },
              { href: '/shopkeeper/settlements', label: 'Settlements', icon: '🏦', color: 'text-brand-700', bg: 'bg-brand-50' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="card p-8 text-center hover:border-brand-500/50 transition-all group">
                <div className={`w-16 h-16 ${l.bg} ${l.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>{l.icon}</div>
                <p className="font-black text-gray-900 tracking-tight">{l.label}</p>
              </Link>
            ))}
          </div>

          {/* Recent Orders Card */}
          <div className="card p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display font-black text-xl text-gray-900 tracking-tight">Recent Activity</h2>
              <Link href="/shopkeeper/orders" className="text-sm font-black text-brand-500 hover:underline">Full History →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-400 font-medium">No recent orders found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map(o => (
                  <div key={o.id} className="py-6 flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl">📦</div>
                      <div>
                        <p className="text-sm font-black text-gray-900">Order #{o.id}</p>
                        <p className="text-xs font-medium text-gray-500">{o.customer?.name} • {o.payment_method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">₹{Number(o.total).toFixed(2)}</p>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        o.status === 'DELIVERED' || o.status === 'COLLECTED' ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Quick Info */}
        <div className="space-y-8">
          <div className="bg-brand-500 rounded-[2.5rem] p-8 text-black shadow-xl shadow-brand-100">
            <h3 className="font-display font-black text-lg mb-4">CrediPay Benefits</h3>
            <p className="text-black/70 text-sm mb-6 font-medium leading-relaxed">Shopkeepers with CrediPay enabled see a <span className="text-black font-black underline">40% increase</span> in average order value.</p>
            <button className="w-full bg-black text-white font-black py-4 rounded-2xl text-sm transition-all hover:bg-gray-900 shadow-lg">
              Learn How it Works
            </button>
          </div>
          
          <div className="card p-8 border-brand-500/10">
            <h3 className="font-display font-black text-gray-900 text-lg mb-2">Need Help?</h3>
            <p className="text-gray-500 text-sm font-medium mb-6">Our partner support is available 24/7 to help you grow.</p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-lg shadow-sm">📞</div>
              <span className="font-black text-gray-900">+91 1800-CREDIPAY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
