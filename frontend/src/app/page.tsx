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
    <div className="min-h-screen bg-[#FDFDFD]">
      <Navbar />

      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative rounded-[2rem] overflow-hidden bg-[#F7D300] min-h-[300px] flex items-center px-8 sm:px-16 shadow-2xl shadow-yellow-100">
          <div className="max-w-lg z-10 py-10">
            <h1 className="font-display font-black text-4xl sm:text-6xl text-gray-900 leading-[1.1] mb-4">
              Groceries <br/> delivered in <br/> <span className="text-white bg-gray-900 px-3 py-1 rounded-2xl rotate-2 inline-block">10 minutes</span>
            </h1>
            <p className="text-gray-800 text-lg font-medium opacity-80 mb-8">
              Experience the magic of lightning fast delivery with CrediPay credit system.
            </p>
            <div className="flex gap-4">
              <button className="bg-gray-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-black transition-all">Order Now</button>
              <button className="bg-white/50 text-gray-900 font-bold px-8 py-4 rounded-2xl border border-gray-900/10 hover:bg-white transition-all">Learn More</button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden lg:flex items-center justify-center pointer-events-none">
            <div className="text-[15rem] drop-shadow-2xl opacity-90 animate-bounce delay-150">🍎</div>
            <div className="text-8xl absolute top-10 right-20 drop-shadow-xl animate-pulse">🥛</div>
            <div className="text-9xl absolute bottom-10 right-40 drop-shadow-xl animate-pulse">🍿</div>
          </div>
        </div>
      </div>

      {/* Flash Zone - Urgency Section */}
      {flashProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mb-12">
            <div className="bg-red-600 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl overflow-hidden relative group">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-white/30 transition-all duration-700"></div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">Live Now</span>
                            <h2 className="font-display font-black text-3xl sm:text-4xl italic tracking-tighter">⚡ Flash Zone</h2>
                        </div>
                        <p className="text-red-100 font-medium">Items nearing expiry at 70-90% OFF. Grab them before they vanish!</p>
                    </div>
                    <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-200">Ending In</p>
                            <p className="font-mono font-black text-xl">00:45:12</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar relative z-10">
                    {flashProducts.map(p => (
                        <div key={p.id} className="min-w-[200px] bg-white rounded-3xl p-4 text-gray-900 shadow-xl flex flex-col justify-between group/card hover:-translate-y-2 transition-all">
                            <div className="relative">
                                <div className="aspect-square rounded-2xl bg-gray-50 mb-4 overflow-hidden">
                                    <img 
                                        src={p.image_url ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${p.image_url}` : 'https://placehold.co/400x400?text=Flash'} 
                                        className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                                        alt={p.name}
                                    />
                                </div>
                                <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg italic">-{Math.round(((p.price - p.flash_price)/p.price)*100)}%</span>
                            </div>
                            <div>
                                <h4 className="font-black text-sm line-clamp-1 mb-1">{p.name}</h4>
                                <div className="flex items-end gap-2 mb-4">
                                    <span className="text-xl font-black text-red-600 tracking-tighter">₹{p.flash_price}</span>
                                    <span className="text-xs text-gray-400 line-through mb-1 font-bold">₹{p.price}</span>
                                </div>
                                <button className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors">Grab Now</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {/* Categories Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-black text-2xl text-gray-900 tracking-tight">Shop by Category</h2>
            <button className="text-sm font-bold text-blinkit-green hover:underline">See All</button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
            <button 
              onClick={() => setCategory('All')}
              className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all ${category === 'All' ? 'bg-brand-100 border-2 border-brand-500 shadow-lg shadow-brand-50' : 'bg-white border border-gray-100 hover:border-brand-200'}`}
            >
              <div className="text-3xl">🏠</div>
              <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">All</span>
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.name}
                onClick={() => setCategory(c.name)}
                className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all ${category === c.name ? 'bg-brand-100 border-2 border-brand-500 shadow-lg shadow-brand-50' : 'bg-white border border-gray-100 hover:border-brand-200'}`}
              >
                <div className="text-3xl">{c.icon}</div>
                <span className="text-xs font-black text-gray-700 uppercase tracking-tighter text-center">{c.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Shops */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-8 bg-brand-500 rounded-full"></div>
            <h2 className="font-display font-black text-2xl text-gray-900 tracking-tight">Top Shops Near You</h2>
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
        <section className="pb-20">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-8 bg-blinkit-green rounded-full"></div>
            <h2 className="font-display font-black text-2xl text-gray-900 tracking-tight">
              {category !== 'All' ? `Fresh ${category}` : 'Daily Essentials'}
              <span className="text-gray-400 text-sm font-bold ml-3 tracking-normal">({products.length} Items)</span>
            </h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {[...Array(12)].map((_, i) => <div key={i} className="skeleton h-72 rounded-3xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 py-24 text-center">
              <div className="text-7xl mb-6 grayscale opacity-50">🛒</div>
              <p className="text-gray-900 font-black text-xl mb-2">No products found in this category</p>
              <p className="text-gray-500 font-medium">Try searching for something else or browse other categories.</p>
              <button onClick={() => setCategory('All')} className="mt-8 bg-gray-900 text-white font-bold px-8 py-3 rounded-xl">Go back to home</button>
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
