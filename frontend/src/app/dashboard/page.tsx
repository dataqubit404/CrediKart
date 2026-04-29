'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import CreditMeter from '@/components/credipay/CreditMeter';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else if (user.role !== 'CUSTOMER') router.push('/');
  }, [user]);

  if (!user) return null;

  const cards = [
    { label: 'My Orders', href: '/dashboard/orders', icon: '📦', desc: 'Track and manage orders' },
    { label: 'CrediPay Dues', href: '/dashboard/credit', icon: '💳', desc: 'View and pay dues' },
    { label: 'Subscriptions', href: '/dashboard/subscriptions', icon: '⭐', desc: 'Manage your plan' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-white">Hello, {user.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-400 mt-1">Manage your orders and CrediPay account</p>
          {!user.is_verified && (
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
              ⚠ Please upload your ID proof to enable CrediPay and full access.{' '}
              <Link href="/dashboard/verify" className="underline">Verify now</Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <CreditMeter />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map(c => (
              <Link key={c.href} href={c.href} className="card p-5 hover:border-gray-600 transition-all group">
                <div className="text-3xl mb-3">{c.icon}</div>
                <p className="font-semibold text-white group-hover:text-brand-500 transition-colors">{c.label}</p>
                <p className="text-gray-400 text-xs mt-1">{c.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
