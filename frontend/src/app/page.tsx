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
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/shops?limit=8'),
      api.get('/products?limit=24'),
    ]).then(([s, p]) => {
      setShops(s.data.shops || []);
      setProducts(p.data.products || []);
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
