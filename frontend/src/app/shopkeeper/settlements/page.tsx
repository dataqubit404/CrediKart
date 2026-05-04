'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function SettlementDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/shops/settlement')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="skeleton h-12 w-64 rounded-xl mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-[2.5rem]" />)}
      </div>
    </div>
  );

  const stats = [
    { 
        label: 'Credits Extended', 
        value: `₹${data?.total_credits}`, 
        desc: 'Total principal amount sold via CrediPay',
        icon: '📤',
        color: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    { 
        label: 'Collected Amount', 
        value: `₹${data?.collected_amount}`, 
        desc: 'Actually paid back by customers',
        icon: '📥',
        color: 'text-green-600',
        bg: 'bg-green-50'
    },
    { 
        label: 'Pending from Users', 
        value: `₹${data?.pending_amount}`, 
        desc: 'Outstanding dues including platform interest',
        icon: '⏳',
        color: 'text-orange-600',
        bg: 'bg-orange-50'
    },
    { 
        label: 'Withdrawable Now', 
        value: `₹${data?.withdrawable_balance}`, 
        desc: 'Funds ready for bank transfer',
        icon: '🏦',
        color: 'text-brand-700',
        bg: 'bg-brand-50'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-display font-black text-4xl text-gray-900 tracking-tight mb-2">Settlement Dashboard</h1>
        <p className="text-gray-500 font-medium">Track your earnings and manage your withdrawable balance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {stats.map(s => (
          <div key={s.label} className="card p-8 group hover:scale-[1.02] transition-all">
            <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm`}>{s.icon}</div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color} tracking-tight mb-2`}>{s.value}</p>
            <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-10 flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
                <h2 className="font-display font-black text-2xl text-gray-900 mb-2">Request Payout</h2>
                <p className="text-gray-500 font-medium mb-12 max-w-md">Your earnings are settled in real-time as customers pay. You can request a transfer to your registered bank account anytime.</p>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-1 w-full bg-gray-50 border border-gray-100 rounded-3xl p-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Balance</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{data?.withdrawable_balance}</p>
                    </div>
                    <button 
                        disabled={parseFloat(data?.withdrawable_balance) <= 0}
                        className={`flex-[1.5] w-full py-6 rounded-3xl font-black text-lg shadow-xl transition-all ${
                            parseFloat(data?.withdrawable_balance) > 0 
                            ? 'bg-brand-500 text-black hover:bg-brand-600 shadow-brand-100' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {parseFloat(data?.withdrawable_balance) > 0 ? 'Transfer to Bank 💸' : 'No Funds Available'}
                    </button>
                </div>
            </div>
            {/* Abstract Design Element */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <div className="space-y-6">
            <div className="bg-black rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-200">
                <h3 className="font-display font-black text-lg mb-6">How it works</h3>
                <div className="space-y-6">
                    {[
                        { step: '01', title: 'Customer Pays', desc: 'User clears their dues via QR or Razorpay' },
                        { step: '02', title: 'Instant Settlement', desc: 'Funds move to your withdrawable balance' },
                        { step: '03', title: 'Transfer', desc: 'Move funds to your bank in 1-2 business days' },
                    ].map(item => (
                        <div key={item.step} className="flex gap-4">
                            <span className="text-brand-500 font-black text-xs pt-1">{item.step}</span>
                            <div>
                                <p className="font-black text-sm mb-1">{item.title}</p>
                                <p className="text-gray-400 text-[11px] font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card p-8 border-brand-500/10">
                <h3 className="font-display font-black text-gray-900 text-lg mb-2">Support</h3>
                <p className="text-gray-500 text-sm font-medium mb-6">Having issues with your payout? Contact our merchant help desk.</p>
                <a href="mailto:merchants@credikart.com" className="font-black text-brand-500 text-sm hover:underline">merchants@credikart.com</a>
            </div>
        </div>
      </div>
    </div>
  );
}
