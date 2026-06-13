'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const recipeFunnelData = [
  { stage: 'Recipe Views', count: 8400 },
  { stage: 'Clicked', count: 5200 },
  { stage: 'AI Parsed', count: 4800 },
  { stage: 'Added to Cart', count: 3100 },
  { stage: 'Purchased', count: 2400 },
];

const FunnelTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-luxe-900 border border-white/10 p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <p className="font-bold text-white mb-1">{payload[0].payload.stage}</p>
        <p className="text-emerald-400 font-black text-lg">
          {payload[0].value.toLocaleString()} <span className="text-sm font-medium text-gray-400">users</span>
        </p>
      </div>
    );
  }
  return null;
};

const revenueData = [
  { name: 'Mon', revenue: 12400, credipay: 4000 },
  { name: 'Tue', revenue: 15600, credipay: 6200 },
  { name: 'Wed', revenue: 11200, credipay: 3800 },
  { name: 'Thu', revenue: 18900, credipay: 8500 },
  { name: 'Fri', revenue: 23400, credipay: 12000 },
  { name: 'Sat', revenue: 31200, credipay: 16500 },
  { name: 'Sun', revenue: 28500, credipay: 14200 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-luxe-900 border border-white/10 p-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <p className="font-bold text-white mb-2">{label}</p>
        <p className="text-brand-400 font-bold text-sm">
          Total: <span className="text-white">₹{payload[0].value.toLocaleString()}</span>
        </p>
        <p className="text-blue-400 font-bold text-sm">
          CrediPay: <span className="text-white">₹{payload[1].value.toLocaleString()}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="mb-10 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-gray-400 hover:text-white text-sm font-bold flex items-center gap-2 mb-4 transition-colors">
            ← Back to Admin
          </Link>
          <h1 className="font-display font-black text-4xl text-white tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-brand-500 rounded-full"></span>
            Interactive Analytics
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Deep insights into platform revenue, recipes, and rewards</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-luxe-800 border border-white/10 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-luxe-700 transition-colors shadow-glass-sm">
            Export CSV
          </button>
          <button className="bg-brand-500 text-black font-black px-5 py-2.5 rounded-xl text-sm hover:bg-brand-400 transition-colors shadow-[0_0_15px_rgba(247,211,0,0.3)]">
            Refresh Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="skeleton h-96 rounded-3xl xl:col-span-2" />
          <div className="skeleton h-96 rounded-3xl xl:col-span-1" />
          <div className="skeleton h-96 rounded-3xl xl:col-span-3" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Part 2: Revenue Trend Area Chart */}
          <div className="bg-luxe-800/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-glass xl:col-span-2 flex flex-col min-h-[450px]">
            <h2 className="font-display font-black text-2xl text-white mb-2">7-Day Revenue Trend</h2>
            <p className="text-gray-400 text-sm font-medium mb-8">Compare total platform revenue against CrediPay usage.</p>
            
            <div className="flex-1 w-full h-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F7D300" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F7D300" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCredipay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#F7D300" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="credipay" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCredipay)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Part 4: VIP Spin & Win Rewards Distribution */}
          <div className="bg-luxe-800/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-glass min-h-[400px] flex items-center justify-center text-gray-500 font-bold border-dashed border-2">
            Part 4: Spin Wheel Distribution Pie Chart
          </div>

          {/* Part 3: Smart Recipes Funnel/Bar Chart */}
          <div className="bg-luxe-800/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-glass xl:col-span-3 flex flex-col min-h-[450px]">
            <h2 className="font-display font-black text-2xl text-white mb-2">Smart Recipe Conversion Funnel</h2>
            <p className="text-gray-400 text-sm font-medium mb-8">Tracking user progression through the new AI Recipe feature.</p>
            
            <div className="flex-1 w-full h-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recipeFunnelData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="stage" type="category" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#e5e7eb', fontSize: 13, fontWeight: 'bold' }} tickLine={false} axisLine={false} width={120} />
                  <Tooltip content={<FunnelTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
