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

      {/* Elite Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative rounded-[3rem] overflow-hidden bg-midnight-lighter min-h-[500px] flex items-center px-8 sm:px-20 shadow-2xl group">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 -right-20 w-[600px] h-[600px] bg-brand-500/20 blur-[150px] rounded-full animate-pulse-slow"></div>
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-luxury-rose/10 blur-[120px] rounded-full animate-pulse"></div>

          <div className="max-w-2xl z-10 py-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span className="text-xs font-black text-brand-100 uppercase tracking-widest">CrediPay 2.0 is Live</span>
            </div>
            
            <h1 className="font-display font-black text-5xl sm:text-7xl text-white leading-[1.05] mb-6 tracking-tight">
              Smart Credit. <br/>
              <span className="bg-clip-text text-transparent bg-premium-gradient">Lightning</span> <br/>
              Delivery.
            </h1>
            
            <p className="text-gray-400 text-lg sm:text-xl font-medium mb-12 max-w-md leading-relaxed">
              Shop with credit, pay later, and get everything at your door in <span className="text-white font-bold">10 minutes</span>.
            </p>
            
            <div className="flex flex-wrap gap-5">
              <button className="btn-premium px-10 py-5 text-lg group">
                Start Shopping
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </button>
              <button className="btn-outline-premium px-10 py-5 text-lg border-white/10 text-white hover:bg-white/5">
                Explore Shops
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex items-center gap-8 opacity-40">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white italic">Razorpay</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Secure Payments</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">CrediPay</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Trusted Credit</span>
              </div>
            </div>
          </div>

          {/* Floating Elite Elements */}
          <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden lg:flex items-center justify-center pointer-events-none pr-10">
            <div className="relative w-full h-full">
              {/* Glass Floating Card */}
              <div className="absolute top-1/4 right-10 glass p-6 rounded-[2rem] border-white/10 shadow-2xl animate-float max-w-[240px]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-2xl">🥦</div>
                  <div>
                    <p className="text-xs font-black text-gray-500 uppercase">Latest Order</p>
                    <p className="text-sm font-bold text-white">Fresh Broccoli</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-brand-500 animate-shimmer"></div>
                </div>
                <p className="text-[10px] text-brand-500 mt-2 font-black uppercase">Arriving in 4 mins</p>
              </div>

              {/* Another Card */}
              <div className="absolute bottom-1/4 right-1/3 glass p-6 rounded-[2.5rem] border-white/10 shadow-2xl animate-pulse-slow max-w-[200px]">
                <p className="text-xs font-black text-gray-500 uppercase mb-2">Available Credit</p>
                <p className="text-3xl font-black text-white italic">₹5,000</p>
                <div className="mt-3 flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-midnight bg-brand-500 flex items-center justify-center text-[10px] font-bold">👤</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elite Flash Zone */}
      {flashProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mb-20">
            <div className="relative rounded-[3rem] overflow-hidden bg-luxury-rose p-8 sm:p-12 text-white shadow-2xl group">
                {/* Background Animation */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[100px] rounded-full animate-pulse-slow"></div>
                <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-black/20 blur-[80px] rounded-full animate-pulse"></div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12 relative z-10">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">Active Now</span>
                            <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">⚡ Flash Zone</h2>
                        </div>
                        <p className="text-white/80 text-lg font-medium max-w-lg">Premium products nearing expiry at <span className="text-white font-black underline">70-90% OFF</span>. Grab them before they vanish!</p>
                    </div>
                    <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl px-8 py-5 rounded-[2rem] border border-white/10 shadow-2xl">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Ending In</p>
                            <p className="font-display font-black text-3xl tracking-tighter tabular-nums">00:45:12</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8 overflow-x-auto pb-8 no-scrollbar relative z-10">
                    {flashProducts.map(p => (
                        <div key={p.id} className="min-w-[240px] glass dark:bg-white/10 rounded-[2.5rem] p-5 text-white border-white/10 shadow-2xl group/card hover:-translate-y-2 transition-all duration-500">
                            <div className="relative aspect-square rounded-[2rem] bg-white/5 mb-5 overflow-hidden border border-white/5">
                                <img 
                                    src={p.image_url ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${p.image_url}` : 'https://placehold.co/400x400?text=Flash'} 
                                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                                    alt={p.name}
                                />
                                <div className="absolute top-3 right-3 bg-luxury-rose text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-2xl border border-white/20">-{Math.round(((p.price - p.flash_price)/p.price)*100)}%</div>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm line-clamp-1 mb-2 opacity-90 tracking-tight">{p.name}</h4>
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-2xl font-black tracking-tighter">₹{p.flash_price}</span>
                                    <span className="text-xs text-white/40 line-through mb-1 font-bold">₹{p.price}</span>
                                </div>
                                <button className="w-full bg-white text-luxury-rose py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Quick Grab</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {/* Elite Categories Grid */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-brand-500 rounded-full"></div>
              <h2 className="font-display font-black text-3xl text-gray-900 dark:text-white tracking-tight">Browse Boutique</h2>
            </div>
            <button className="text-sm font-black text-brand-500 hover:tracking-widest transition-all uppercase tracking-widest">See All</button>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-6">
            <button 
              onClick={() => setCategory('All')}
              className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] transition-all duration-500 ${category === 'All' ? 'bg-brand-500 text-white shadow-neon-blue -translate-y-2' : 'glass hover:bg-brand-500/5 hover:border-brand-500/20'}`}
            >
              <div className="text-4xl filter drop-shadow-lg">🏠</div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${category === 'All' ? 'text-white' : 'text-gray-500'}`}>All</span>
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.name}
                onClick={() => setCategory(c.name)}
                className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] transition-all duration-500 ${category === c.name ? 'bg-brand-500 text-white shadow-neon-blue -translate-y-2' : 'glass hover:bg-brand-500/5 hover:border-brand-500/20'}`}
              >
                <div className="text-4xl filter drop-shadow-lg">{c.icon}</div>
                <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-tight ${category === c.name ? 'text-white' : 'text-gray-500'}`}>{c.name}</span>
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
