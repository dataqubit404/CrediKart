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
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in text-white">
      
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="font-display font-black text-4xl text-white tracking-tight flex items-center justify-center md:justify-start gap-3 italic">
            <span className="text-brand-500 animate-pulse-glow">🏆</span> VIP Rewards Hub
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Earn points, maintain your streak, and spin for daily rewards.</p>
        </div>
        <div className="bg-luxe-800/80 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl shadow-glass flex items-center gap-4">
            <span className="text-3xl drop-shadow-md">💎</span>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Balance</p>
                <p className="text-2xl font-black text-white">{data?.loyalty_points} <span className="text-sm font-medium text-brand-400">Points</span></p>
            </div>
        </div>
      </div>

      {/* Main Glassmorphism Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Progress & Spin Wheel */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Part 2: VIP Tier Progress Bar */}
          <div className="bg-luxe-800/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 shadow-glass relative overflow-hidden group">
            {/* Ambient Background Element */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-colors duration-700" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] mb-1 text-gray-500">Current Status</p>
                    <h2 className="text-5xl font-display font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">{data?.membership_tier}</h2>
                  </div>
                  {data?.next_tier && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Next Tier</p>
                      <p className="text-xl font-black text-white italic">{data?.next_tier}</p>
                    </div>
                  )}
                </div>
                
                {data?.next_tier && (
                    <div className="max-w-full">
                        <div className="flex justify-between text-xs font-black mb-3 uppercase tracking-wider text-gray-400">
                            <span>{data?.progress}% Completed</span>
                            <span className="text-brand-400">{data?.loyalty_points} / {data?.points_needed} PTS</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                            <div 
                                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-1000 ease-out relative" 
                                style={{ width: `${data?.progress}%` }}
                            >
                                {/* Glowing Head */}
                                <div className="absolute top-0 right-0 w-4 h-full bg-white blur-sm opacity-50 rounded-full"></div>
                            </div>
                        </div>
                        <p className="mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <span className="text-white">{data?.points_needed - data?.loyalty_points} points</span> to unlock {data?.next_tier} benefits
                        </p>
                    </div>
                )}
            </div>
          </div>

          {/* Wheel Container Shell */}
          <div className="bg-luxe-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md max-h-md bg-brand-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
            
            {/* Part 4: Spin Wheel Foundation & SVG Shell */}
            <div className="relative z-10 w-full max-w-[320px] aspect-square">
              
              {/* Outer Glowing Ring */}
              <div className="absolute inset-0 rounded-full border-[8px] border-luxe-800 shadow-[0_0_30px_rgba(247,211,0,0.2)] bg-luxe-800"></div>

              {/* The Wheel (SVG) */}
              <div className="absolute inset-2 rounded-full overflow-hidden border-[4px] border-white/5">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Wheel Slices - We will make this dynamic in Part 6, static for now to build foundation */}
                  <path d="M50 50 L100 50 A50 50 0 0 1 75 93.3 Z" fill="#F7D300" className="opacity-90"/>
                  <path d="M50 50 L75 93.3 A50 50 0 0 1 25 93.3 Z" fill="#15171F" />
                  <path d="M50 50 L25 93.3 A50 50 0 0 1 0 50 Z" fill="#2A2E3D" />
                  <path d="M50 50 L0 50 A50 50 0 0 1 25 6.7 Z" fill="#15171F" />
                  <path d="M50 50 L25 6.7 A50 50 0 0 1 75 6.7 Z" fill="#2A2E3D" />
                  <path d="M50 50 L75 6.7 A50 50 0 0 1 100 50 Z" fill="#15171F" />
                </svg>
              </div>

              {/* Center Hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full border-4 border-luxe-900 shadow-[0_0_20px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-white/30 bg-black/20"></div>
              </div>

              {/* Pointer */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 40L0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16L16 40Z" fill="#F7D300"/>
                  <path d="M16 35L4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16L16 35Z" fill="#c27803"/>
                </svg>
              </div>
            </div>

            {/* Spin Button */}
            <button className="mt-12 z-20 relative px-10 py-4 bg-brand-500 hover:bg-brand-400 text-black font-black text-xl rounded-full shadow-[0_0_30px_rgba(247,211,0,0.4)] transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
              Spin Now
            </button>
          </div>
        </div>

        {/* Right Column: Streak & History */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Part 3: Daily Login Streak Tracker */}
          <div className="bg-gradient-to-b from-luxe-800/90 to-luxe-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-glass relative">
            <h3 className="font-display font-black text-xl mb-1 text-white flex items-center justify-between">
              Login Streak
              <span className="text-brand-400 text-sm flex items-center gap-1 animate-pulse"><span className="text-lg">🔥</span> 4 Days</span>
            </h3>
            <p className="text-gray-400 text-xs font-medium mb-6">Login 7 days in a row for a mega spin!</p>
            
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-500 ${
                    day <= 4 
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400 shadow-[0_0_15px_rgba(247,211,0,0.3)] scale-110' 
                      : 'bg-white/5 border-white/10 text-gray-600'
                  }`}>
                    {day <= 4 ? '✓' : day}
                  </div>
                  <span className={`text-[9px] font-bold uppercase ${day <= 4 ? 'text-brand-500' : 'text-gray-600'}`}>D{day}</span>
                </div>
              ))}
            </div>
            
            {/* Progress line behind pills */}
            <div className="absolute bottom-[42px] left-[32px] right-[32px] h-0.5 bg-white/10 -z-10 rounded-full">
               <div className="h-full bg-brand-500/50 w-[50%] rounded-full shadow-[0_0_10px_rgba(247,211,0,0.5)]"></div>
            </div>
          </div>

          {/* Part 8: Rewards History Activity Log (Using Existing Logic) */}
          <div className="bg-luxe-800/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col shadow-glass min-h-[300px]">
             <h3 className="font-display font-black text-xl mb-4 text-white">Points Activity</h3>
             <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] scrollbar-hide pr-2">
                {data?.transactions?.map((t: any) => (
                    <div key={t.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                                t.type === 'EARNED' ? 'bg-green-500/20 text-green-400' : 
                                (t.type === 'REFERRAL_BONUS' ? 'bg-brand-500/20 text-brand-400' : 'bg-red-500/20 text-red-400')
                            }`}>
                                {t.type === 'EARNED' ? '🛍️' : (t.type === 'REFERRAL_BONUS' ? '🎁' : '🔥')}
                            </div>
                            <div>
                                <p className="font-bold text-gray-200 text-sm leading-none mb-1">{t.description}</p>
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{new Date(t.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <span className={`font-black text-sm ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {t.amount > 0 ? '+' : ''}{t.amount}
                        </span>
                    </div>
                ))}
                {data?.transactions?.length === 0 && (
                    <div className="text-center py-8 opacity-50">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No activity yet</p>
                    </div>
                )}
             </div>
          </div>

          {/* Referral Card (Migrated) */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-glass">
            <h3 className="font-display font-black text-lg mb-1 text-white">Invite Friends</h3>
            <p className="text-gray-400 text-xs font-medium mb-4">Share code for ₹500 credit bonus.</p>
            <div className="bg-luxe-900 rounded-xl p-3 flex items-center justify-between border border-white/10">
                <code className="font-black text-brand-400 tracking-widest">{data?.referral_code}</code>
                <button 
                    onClick={copyReferral}
                    className="bg-white text-black px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-gray-200 transition-colors"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
