'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreditMeter from '@/components/credipay/CreditMeter';
import OrderRadar from '@/components/dashboard/OrderRadar';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user) return null;

  const cards = [
    { label: 'My Orders', href: '/dashboard/orders', icon: '📦', desc: 'Track and manage orders' },
    { label: 'CrediPay Dues', href: '/dashboard/credit', icon: '💳', desc: 'View and pay dues' },
    { label: 'VIP Rewards', href: '/dashboard/rewards', icon: '🎡', desc: 'Daily Spin & Winnings' },
    { label: 'Smart Recipes', href: '/recipes', icon: '🪄', desc: 'AI-powered meal builder' },
    { label: 'CK Discover', href: '/discover', icon: '🎬', desc: 'Watch & shop vertical feed' },
    { label: 'Subscriptions', href: '/dashboard/subscriptions', icon: '⭐', desc: 'Manage your plan' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Live Order Radar (Demo Integration) */}
      <div className="mb-10">
        <OrderRadar />
      </div>

      <div className="mb-10 bg-luxe-800/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-glass">
        <h1 className="font-display font-black text-3xl text-white tracking-tight">Hello, {user.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-400 mt-2 text-sm font-medium">Manage your elite orders and CrediPay account</p>
        {!user.is_verified && (
          <div className="mt-5 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm flex items-center gap-3">
            <span className="text-xl">⚠</span> 
            <div>
              <p className="font-bold mb-0.5">Verification Required</p>
              <p className="opacity-80">Please upload your ID proof to enable CrediPay and full access. <Link href="/dashboard/verify" className="underline font-bold hover:text-yellow-300 transition-colors">Verify now</Link></p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <CreditMeter />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map(c => (
            <Link key={c.href} href={c.href} className="bg-luxe-800/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 hover:border-brand-500/50 hover:bg-luxe-700/80 hover:shadow-[0_10px_30px_rgba(247,211,0,0.15)] transition-all duration-300 group">
              <div className="text-4xl mb-4 drop-shadow-md group-hover:scale-110 transition-transform origin-left">{c.icon}</div>
              <p className="font-black text-lg text-white group-hover:text-brand-400 transition-colors tracking-tight">{c.label}</p>
              <p className="text-gray-400 text-xs mt-1.5 font-medium">{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Meal of the Day Promo Banner */}
      <Link href="/recipes" className="block mt-10 group">
        <div className="bg-gradient-to-r from-emerald-900/60 to-luxe-800/80 backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-8 shadow-glass relative overflow-hidden hover:border-emerald-500/40 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)]">
          {/* Ambient glow */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl group-hover:bg-emerald-500/25 transition-colors duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">🪄 Meal of the Day</p>
              <h3 className="font-display font-black text-2xl text-white tracking-tight italic">Artisan Avocado Toast</h3>
              <p className="text-gray-400 text-sm font-medium mt-1">5 ingredients · 10 min · Let AI auto-add to your cart</p>
            </div>
            <div className="px-6 py-3 bg-emerald-500 text-white font-black uppercase tracking-widest text-sm rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">
              Cook Now →
            </div>
          </div>
        </div>
      </Link>

      {/* Trending on Discover Promo Banner */}
      <Link href="/discover" className="block mt-6 group">
        <div className="bg-gradient-to-r from-purple-950/60 to-luxe-800/80 backdrop-blur-xl border border-purple-500/20 rounded-[2rem] p-8 shadow-glass relative overflow-hidden hover:border-purple-500/40 transition-all duration-500 hover:shadow-[0_10px_40px_rgba(147,51,234,0.15)]">
          {/* Ambient glow */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl group-hover:bg-purple-500/25 transition-colors duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 hidden sm:block relative">
                <img 
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=150&auto=format&fit=crop" 
                  alt="Trending Wagyu" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-1 left-1 bg-red-500 text-white font-black text-[8px] px-1 rounded">LIVE</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-2">🔥 Trending on Discover</p>
                <h3 className="font-display font-black text-2xl text-white tracking-tight italic">Premium Japanese Wagyu A5</h3>
                <p className="text-gray-400 text-sm font-medium mt-1">Watch video highlights · Slide to Buy instant-adds to cart</p>
              </div>
            </div>
            <div className="px-6 py-3 bg-purple-600 text-white font-black uppercase tracking-widest text-sm rounded-full shadow-[0_0_20px_rgba(147,51,234,0.4)] group-hover:scale-105 transition-transform">
              Watch Feed 🎬
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
