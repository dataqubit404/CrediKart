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
        <div className="bg-luxe-800/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-[0_0_10px_rgba(247,211,0,0.2)]">Active Store</span>
            <h1 className="font-display font-black text-3xl text-white tracking-tight">{shop.name}</h1>
          </div>
          <p className="text-gray-400 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
            Store Status: <span className="font-black text-white uppercase text-xs tracking-widest">{shop.status}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/shopkeeper/register" className="bg-white/5 border border-white/10 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-white/10 transition-all shadow-glass-sm uppercase tracking-widest text-xs">
            Store Settings
          </Link>
          <Link href={`/shop/${shop.id}`} className="bg-brand-500 text-[#0B0C10] font-bold px-6 py-3.5 rounded-2xl hover:bg-brand-400 transition-all shadow-[0_0_15px_rgba(247,211,0,0.3)] uppercase tracking-widest text-xs">
            View Public Shop
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map(s => (
          <div key={s.label} className="bg-luxe-800/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 group hover:border-brand-500/30 hover:bg-luxe-700/80 transition-all duration-300 shadow-glass-sm">
            <div className="text-4xl mb-5 drop-shadow-md group-hover:scale-110 transition-transform origin-left">{s.icon}</div>
            <p className={`text-4xl font-black ${s.color.replace('text-blue-600', 'text-blue-400').replace('text-green-600', 'text-green-400').replace('text-orange-600', 'text-orange-400').replace('text-purple-600', 'text-purple-400')} tracking-tight drop-shadow-sm`}>{s.value}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {[
              { href: '/shopkeeper/products', label: 'Manage Inventory', icon: '🏷️', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
              { href: '/shopkeeper/orders', label: 'Customer Orders', icon: '📦', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { href: '/shopkeeper/receivables', label: 'Receivables', icon: '💳', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { href: '/shopkeeper/settlements', label: 'Settlements', icon: '🏦', color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="bg-luxe-800/80 backdrop-blur-md border border-white/5 rounded-3xl p-8 text-center hover:border-brand-500/50 hover:bg-luxe-700/80 transition-all duration-300 group shadow-glass-sm">
                <div className={`w-16 h-16 ${l.bg} border ${l.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform shadow-inner`}>{l.icon}</div>
                <p className="font-black text-white tracking-tight group-hover:text-brand-300 transition-colors">{l.label}</p>
              </Link>
            ))}
          </div>

          {/* Recent Orders Card */}
          <div className="bg-luxe-800/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-10 shadow-glass">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
              <h2 className="font-display font-black text-2xl text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-8 bg-brand-500 rounded-full"></span>
                Recent Activity
              </h2>
              <Link href="/shopkeeper/orders" className="text-xs font-black uppercase tracking-widest text-brand-400 hover:text-brand-300 transition-colors">Full History →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="py-16 text-center bg-luxe-900/50 rounded-3xl border border-white/5">
                <p className="text-gray-400 font-medium">No recent orders found.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentOrders.map(o => (
                  <div key={o.id} className="py-6 flex items-center justify-between group cursor-pointer hover:bg-white/[0.02] -mx-4 px-4 rounded-2xl transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-luxe-900 border border-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">📦</div>
                      <div>
                        <p className="text-base font-black text-white mb-1">Order #{o.id}</p>
                        <p className="text-xs font-medium text-gray-400">{o.customer?.name} • {o.payment_method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white mb-1">₹{Number(o.total).toFixed(2)}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                        o.status === 'DELIVERED' || o.status === 'COLLECTED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
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
          <div className="bg-gradient-to-br from-brand-400 to-brand-600 rounded-[2.5rem] p-10 text-[#0B0C10] shadow-[0_10px_40px_rgba(247,211,0,0.2)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[50px] rounded-full -mr-10 -mt-10 group-hover:bg-white/30 transition-all duration-700"></div>
            <h3 className="font-display font-black text-2xl mb-4 tracking-tight">CrediPay Benefits</h3>
            <p className="text-[#0B0C10]/80 text-sm mb-8 font-bold leading-relaxed">Shopkeepers with CrediPay enabled see a <span className="text-[#0B0C10] font-black underline">40% increase</span> in average order value.</p>
            <button className="w-full bg-[#0B0C10] text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all hover:bg-luxe-800 shadow-xl">
              Learn How it Works
            </button>
          </div>
          
          <div className="bg-luxe-800/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 shadow-glass">
            <h3 className="font-display font-black text-white text-xl mb-3 tracking-tight">Need Help?</h3>
            <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">Our elite partner support is available 24/7 to help you grow your business.</p>
            <div className="flex items-center gap-4 bg-luxe-900 border border-white/10 p-4 rounded-2xl shadow-inner">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl shadow-sm">📞</div>
              <span className="font-black text-brand-400 tracking-wider">1800-CREDIPAY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
