'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreditMeter from '@/components/credipay/CreditMeter';
import { useAuthStore } from '@/store/authStore';
import { ShoppingBag, CreditCard, Trophy, Star, AlertCircle, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user) return null;

  const quickActions = [
    { label: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag, desc: 'Track your packages', color: 'bg-brand-500' },
    { label: 'CrediPay', href: '/dashboard/credit', icon: CreditCard, desc: 'Manage your credit', color: 'bg-indigo-500' },
    { label: 'Rewards', href: '/dashboard/rewards', icon: Trophy, desc: 'Points and Perks', color: 'bg-luxury-gold' },
    { label: 'Subscriptions', href: '/dashboard/subscriptions', icon: Star, desc: 'Your membership', color: 'bg-luxury-rose' },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-display font-black text-4xl text-gray-900 dark:text-white tracking-tight">
            Welcome back, <span className="bg-clip-text text-transparent bg-premium-gradient">{user.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Here's what's happening with your CrediKart account today.</p>
        </div>
        
        {!user.is_verified && (
          <Link href="/dashboard/verify" className="flex items-center gap-4 p-4 rounded-3xl bg-luxury-rose/10 border border-luxury-rose/20 group hover:bg-luxury-rose/20 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-luxury-rose flex items-center justify-center text-white">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-luxury-rose uppercase tracking-widest">Verification Pending</p>
              <p className="text-xs text-luxury-rose/60 font-bold">Complete KYC to unlock CrediPay</p>
            </div>
            <ChevronRight className="w-5 h-5 text-luxury-rose ml-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Credit Meter (Left) */}
        <div className="xl:col-span-1">
          <div className="card-premium h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Credit Status</h3>
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <CreditMeter />
          </div>
        </div>

        {/* Quick Actions (Right) */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="card-premium group">
                  <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-display font-black text-xl text-gray-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors">{item.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="card-premium">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-white/10" />
          </div>
          <p className="text-gray-900 dark:text-white font-black text-xl mb-2">No recent activity</p>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Start shopping to see your orders and transactions here.</p>
          <Link href="/" className="btn-premium mt-8">Explore Products</Link>
        </div>
      </div>
    </div>
  );
}
