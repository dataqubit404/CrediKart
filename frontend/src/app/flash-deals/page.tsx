'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

export default function FlashDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?flash=true&limit=50')
      .then(res => setDeals(res.data.products || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getDistance = () => (Math.random() * 2 + 0.1).toFixed(1); // Mock distance

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
            <h1 className="font-display font-black text-5xl text-gray-900 tracking-tighter italic mb-4">Neighborhood Flash ⚡</h1>
            <p className="text-gray-500 font-medium text-lg">Real-time deals happening in your immediate vicinity.</p>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-80 rounded-[2.5rem]" />)}
            </div>
        ) : deals.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-200">
                <div className="text-7xl mb-6">🏜️</div>
                <p className="text-gray-400 font-black text-xl uppercase tracking-widest">No active deals right now</p>
                <p className="text-gray-400 mt-2">Check back in a few minutes!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {deals.map(p => (
                    <div key={p.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl border-2 border-transparent hover:border-red-500 transition-all group overflow-hidden relative">
                        {/* Expiry Badge */}
                        <div className="absolute top-6 left-6 z-10">
                            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                                Expiring Soon
                            </span>
                        </div>

                        {/* Shop Info */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center text-xl shadow-inner">🏪</div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Store</p>
                                    <p className="font-bold text-gray-900 leading-none">{p.shop?.name}</p>
                                </div>
                            </div>
                            <div className="bg-gray-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                <span className="text-xs">📍</span>
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{getDistance()} km away</span>
                            </div>
                        </div>

                        {/* Product Visual */}
                        <div className="aspect-video bg-gray-50 rounded-[2rem] mb-6 overflow-hidden relative">
                            <img 
                                src={p.image_url ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${p.image_url}` : 'https://placehold.co/600x400?text=Flash+Deal'} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                alt={p.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                <h3 className="text-white font-black text-xl leading-tight">{p.name}</h3>
                            </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Flash Price</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black text-red-600 tracking-tighter leading-none">₹{p.flash_price}</span>
                                    <span className="text-sm text-gray-400 line-through font-bold mb-1">₹{p.price}</span>
                                </div>
                            </div>
                            <Link 
                                href={`/shop/${p.shop_id}`}
                                className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200"
                            >
                                Get Deal
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
