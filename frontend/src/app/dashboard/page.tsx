'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreditMeter from '@/components/credipay/CreditMeter';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user) return null;

  const cards = [
    { label: 'My Orders', href: '/dashboard/orders', icon: '📦', desc: 'Track and manage orders' },
    { label: 'CrediPay Dues', href: '/dashboard/credit', icon: '💳', desc: 'View and pay dues' },
    { label: 'Rewards Hub', href: '/dashboard/rewards', icon: '🏆', desc: 'Points and Perks' },
    { label: 'Subscriptions', href: '/dashboard/subscriptions', icon: '⭐', desc: 'Manage your plan' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
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
    </div>
  );
}
