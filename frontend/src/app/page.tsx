'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import ShopCard from '@/components/shop/ShopCard';
import ProductCard from '@/components/shop/ProductCard';
import api from '@/lib/api';

const CATEGORIES = [
  { name: 'Dairy', icon: '🥛' },
  { name: 'Bakery', icon: '🍞' },
  { name: 'Staples', icon: '🍚' },
  { name: 'Oils', icon: '🛢️' },
  { name: 'Instant Food', icon: '🍜' },
  { name: 'Beverages', icon: '🥤' },
  { name: 'Cleaning', icon: '🧹' },
  { name: 'Snacks', icon: '🍿' },
  { name: 'Fruits & Veg', icon: '🍎' },
];

export default function Home() {
  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [flashProducts, setFlashProducts] = useState<any[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/shops?limit=8'),
      api.get('/products?limit=24'),
      api.get('/products?flash=true&limit=10'),
    ]).then(([s, p, f]) => {
      setShops(s.data.shops || []);
      setProducts(p.data.products || []);
      setFlashProducts(f.data.products || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (search) params.set('q', search);
    params.set('limit', '24');
    api.get(`/products?${params}`).then(r => setProducts(r.data.products || []));
  }, [category, search]);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-100 font-sans selection:bg-brand-500/30">
      <Navbar />

      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-luxe-900 border border-white/10 min-h-[400px] flex items-center px-8 sm:px-16 shadow-[0_0_50px_rgba(247,211,0,0.15)] group">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-full h-full bg-glass-gradient pointer-events-none"></div>
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/20 blur-[120px] rounded-full group-hover:bg-brand-500/30 transition-all duration-1000"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blinkit-green/10 blur-[120px] rounded-full"></div>

          <div className="max-w-xl z-10 py-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blinkit-green animate-pulse"></span>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">CrediPay Active</span>
            </div>
            
            <h1 className="font-display font-black text-5xl sm:text-7xl text-white leading-[1.05] mb-6 tracking-tight">
              Elite <br/> Groceries in <br/> <span className="text-brand-500 inline-block drop-shadow-[0_0_15px_rgba(247,211,0,0.5)]">10 minutes.</span>
            </h1>
            <p className="text-gray-400 text-lg font-medium mb-10 leading-relaxed max-w-md">
              Experience lightning-fast delivery with the power of the CrediPay credit system. Premium goods, zero waiting.
            </p>
            <div className="flex gap-5">
              <button className="btn-primary text-sm uppercase tracking-wider">Order Now</button>
              <button className="btn-secondary text-sm uppercase tracking-wider">Learn More</button>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden lg:flex items-center justify-center pointer-events-none z-10">
            <div className="text-[12rem] drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] animate-[fadeUp_2s_ease-in-out_infinite_alternate] z-20 hover:scale-110 transition-transform">🛍️</div>
            <div className="text-7xl absolute top-20 right-32 drop-shadow-2xl animate-[fadeUp_3s_ease-in-out_infinite_alternate-reverse]">⚡</div>
            <div className="text-8xl absolute bottom-20 right-10 drop-shadow-2xl animate-[fadeUp_2.5s_ease-in-out_infinite_alternate] opacity-80">💳</div>
          </div>
        </div>
      </div>

      {/* Flash Zone - Urgency Section */}
      {flashProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mb-16">
            <div className="bg-gradient-to-br from-red-900/40 to-red-600/10 rounded-[2.5rem] p-8 sm:p-12 text-white border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-red-500/30 transition-all duration-700"></div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 relative z-10">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <span className="badge-red animate-pulse">Live Now</span>
                            <h2 className="font-display font-black text-3xl sm:text-4xl italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">⚡ Flash Zone</h2>
                        </div>
                        <p className="text-red-200/70 font-medium">Items nearing expiry at 70-90% OFF. Grab them before they vanish!</p>
                    </div>
                    <div className="flex items-center gap-4 bg-luxe-900/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Ending In</p>
                            <p className="font-mono font-black text-2xl text-white">00:45:12</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide relative z-10">
                    {flashProducts.map(p => (
                        <div key={p.id} className="min-w-[220px] bg-luxe-800/80 backdrop-blur-xl rounded-3xl p-4 text-white border border-white/10 shadow-glass flex flex-col justify-between group/card hover:-translate-y-2 hover:border-red-500/50 transition-all duration-300">
                            <div className="relative">
                                <div className="aspect-square rounded-2xl bg-luxe-900 mb-4 overflow-hidden border border-white/5">
                                    <img 
                                        src={p.image_url ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${p.image_url}` : 'https://placehold.co/400x400?text=Flash'} 
                                        className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500 opacity-90 group-hover/card:opacity-100"
                                        alt={p.name}
                                    />
                                </div>
                                <span className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-lg italic">-{Math.round(((p.price - p.flash_price)/p.price)*100)}%</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm line-clamp-1 mb-2 text-gray-200">{p.name}</h4>
                                <div className="flex items-end gap-2 mb-5">
                                    <span className="text-2xl font-black text-red-400 tracking-tighter">₹{p.flash_price}</span>
                                    <span className="text-xs text-gray-500 line-through mb-1.5 font-bold">₹{p.price}</span>
                                </div>
                                <button className="w-full bg-white/5 border border-white/10 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300">Grab Now</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {/* Categories Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-black text-3xl text-white tracking-tight">Shop by Category</h2>
            <button className="text-sm font-bold text-brand-400 hover:text-brand-300 uppercase tracking-wider transition-colors">See All</button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
            <button 
              onClick={() => setCategory('All')}
              className={`flex flex-col items-center gap-3 p-5 rounded-3xl transition-all duration-300 ${category === 'All' ? 'bg-brand-500/10 border border-brand-500/50 shadow-[0_0_20px_rgba(247,211,0,0.15)]' : 'bg-luxe-800/50 border border-white/5 hover:bg-luxe-700 hover:border-white/10'}`}
            >
              <div className="text-3xl drop-shadow-md">🏠</div>
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">All</span>
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.name}
                onClick={() => setCategory(c.name)}
                className={`flex flex-col items-center gap-3 p-5 rounded-3xl transition-all duration-300 ${category === c.name ? 'bg-brand-500/10 border border-brand-500/50 shadow-[0_0_20px_rgba(247,211,0,0.15)]' : 'bg-luxe-800/50 border border-white/5 hover:bg-luxe-700 hover:border-white/10'}`}
              >
                <div className="text-3xl drop-shadow-md">{c.icon}</div>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center">{c.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Shops */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-brand-500 rounded-full shadow-[0_0_10px_rgba(247,211,0,0.5)]"></div>
            <h2 className="font-display font-black text-3xl text-white tracking-tight">Top Shops Near You</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 rounded-3xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {shops.map(s => <ShopCard key={s.id} shop={s} />)}
            </div>
          )}
        </section>

        {/* Products Grid */}
        <section className="pb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-blinkit-green rounded-full shadow-[0_0_10px_rgba(59,177,67,0.5)]"></div>
            <h2 className="font-display font-black text-3xl text-white tracking-tight flex items-baseline gap-4">
              {category !== 'All' ? `Premium ${category}` : 'Daily Essentials'}
              <span className="text-gray-500 text-sm font-bold tracking-widest uppercase">({products.length} Items)</span>
            </h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {[...Array(12)].map((_, i) => <div key={i} className="skeleton h-72 rounded-3xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-luxe-800/30 rounded-[2.5rem] border border-white/5 py-24 text-center backdrop-blur-sm">
              <div className="text-7xl mb-6 opacity-30 drop-shadow-xl">🛒</div>
              <p className="text-white font-black text-2xl mb-3 tracking-tight">No premium goods found</p>
              <p className="text-gray-500 font-medium max-w-md mx-auto">We couldn't find any items in this elite category. Try searching for something else.</p>
              <button onClick={() => setCategory('All')} className="mt-8 btn-secondary text-sm uppercase tracking-widest">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
