'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function RewardsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/loyalty/me')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const copyReferral = () => {
    navigator.clipboard.writeText(data?.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="skeleton h-12 w-64 rounded-xl mb-8" />
        <div className="skeleton h-64 rounded-[2.5rem] mb-12" />
    </div>
  );

  const tierColors: any = {
    'BRONZE': 'from-orange-400 to-orange-700',
    'SILVER': 'from-slate-300 to-slate-500',
    'GOLD': 'from-yellow-400 to-yellow-600',
    'PLATINUM': 'from-blue-400 to-indigo-600'
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
            <h1 className="font-display font-black text-5xl text-gray-900 tracking-tight mb-2 italic">Rewards Hub</h1>
            <p className="text-gray-500 font-medium">Earn points, level up, and unlock exclusive perks.</p>
        </div>
        <div className="bg-black text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4">
            <span className="text-3xl">🏆</span>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Balance</p>
                <p className="text-2xl font-black">{data?.loyalty_points} <span className="text-sm font-medium text-gray-400">Points</span></p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Tier Card */}
        <div className={`lg:col-span-2 relative overflow-hidden bg-gradient-to-br ${tierColors[data?.membership_tier]} rounded-[3rem] p-10 text-white shadow-2xl`}>
            <div className="relative z-10">
                <p className="text-sm font-black uppercase tracking-[0.2em] mb-1 opacity-80">Current Status</p>
                <h2 className="text-6xl font-black tracking-tighter mb-8 italic">{data?.membership_tier}</h2>
                
                {data?.next_tier && (
                    <div className="max-w-md">
                        <div className="flex justify-between text-sm font-black mb-3 uppercase tracking-wider">
                            <span>Progress to {data?.next_tier}</span>
                            <span>{data?.loyalty_points} / {data?.points_needed}</span>
                        </div>
                        <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
                            <div 
                                className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,255,255,0.5)]" 
                                style={{ width: `${data?.progress}%` }}
                            />
                        </div>
                        <p className="mt-4 text-xs font-bold opacity-80 uppercase tracking-widest">
                            {data?.points_needed - data?.loyalty_points} points to unlock {data?.next_tier} benefits
                        </p>
                    </div>
                )}
            </div>
            {/* Abstract Background Element */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Referral Card */}
        <div className="bg-white border-4 border-black rounded-[3rem] p-10 shadow-xl flex flex-col justify-between">
            <div>
                <h3 className="font-display font-black text-2xl mb-2">Invite Friends</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">Share your code and get ₹500 credit bonus when they make their first purchase.</p>
                
                <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-between group border-2 border-transparent hover:border-black transition-all">
                    <code className="font-black text-xl tracking-widest">{data?.referral_code}</code>
                    <button 
                        onClick={copyReferral}
                        className="bg-black text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:scale-105 active:scale-95 transition-all"
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100 italic font-black text-gray-400 text-sm">
                #CrediKartCommunity
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Activity Feed */}
        <div>
            <h3 className="font-display font-black text-2xl mb-8 flex items-center gap-3">
                <span className="w-8 h-8 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center text-sm">✨</span>
                Points Activity
            </h3>
            <div className="space-y-4">
                {data?.transactions?.map((t: any) => (
                    <div key={t.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                                t.type === 'EARNED' ? 'bg-green-50 text-green-600' : 
                                (t.type === 'REFERRAL_BONUS' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-600')
                            }`}>
                                {t.type === 'EARNED' ? '🛍️' : (t.type === 'REFERRAL_BONUS' ? '🎁' : '🔥')}
                            </div>
                            <div>
                                <p className="font-black text-gray-900 leading-none mb-1">{t.description}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(t.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <span className={`font-black text-lg ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {t.amount > 0 ? '+' : ''}{t.amount}
                        </span>
                    </div>
                ))}
                {data?.transactions?.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No activity yet</p>
                    </div>
                )}
            </div>
        </div>

        {/* Benefits Sidebar */}
        <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl">
            <h3 className="font-display font-black text-2xl mb-10 italic">Tier Benefits</h3>
            <div className="space-y-8">
                {[
                    { tier: 'BRONZE', perk: 'Standard Points', active: data?.membership_tier === 'BRONZE' },
                    { tier: 'SILVER', perk: '5% Lower Interest Rates', active: data?.membership_tier === 'SILVER' },
                    { tier: 'GOLD', perk: 'Free Delivery on Orders > ₹500', active: data?.membership_tier === 'GOLD' },
                    { tier: 'PLATINUM', perk: 'Instant Approval on High Credits', active: data?.membership_tier === 'PLATINUM' },
                ].map(item => (
                    <div key={item.tier} className={`flex items-center justify-between p-4 rounded-2xl border ${item.active ? 'border-white bg-white/10' : 'border-white/10 opacity-50'}`}>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">{item.tier}</p>
                            <p className="font-bold text-sm">{item.perk}</p>
                        </div>
                        {item.active && <span className="text-xs font-black bg-white text-black px-3 py-1 rounded-full">ACTIVE</span>}
                    </div>
                ))}
            </div>
            <div className="mt-12 bg-white/5 p-6 rounded-3xl border border-white/10">
                <p className="text-xs font-medium text-gray-400 leading-relaxed">
                    *Benefits are automatically applied at checkout based on your current tier. Tiers are calculated based on your lifetime loyalty points.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
