'use client';
import { useEffect, useState } from 'react';
import { useSearchStore } from '@/store/searchStore';

export default function CommandPalette() {
  const { isOpen, toggleSearch, closeSearch } = useSearchStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleSearch, closeSearch]);

  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, shopRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/shops`)
        ]);
        const prodData = await prodRes.json();
        const shopData = await shopRes.json();
        setProducts(prodData);
        setShops(shopData);
      } catch (error) {
        console.error('Failed to fetch data for command palette:', error);
      }
    };
    fetchData();
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);

  // Filter Logic
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4);
  const filteredShops = shops.filter(s => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3);
  const quickActions = [
    { title: 'Go to Dashboard', icon: '📊', color: 'brand' },
    { title: 'View Cart', icon: '🛒', color: 'blue' },
    { title: 'Settings', icon: '⚙️', color: 'gray' }
  ].filter(a => a.title.toLowerCase().includes(query.toLowerCase()));

  const totalResults = filteredProducts.length + filteredShops.length + quickActions.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % (totalResults || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + (totalResults || 1)) % (totalResults || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Execute active item (placeholder for routing)
      closeSearch();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Clear query when opening
      setQuery('');
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B0C10]/80 backdrop-blur-3xl z-[100] transition-opacity duration-300 animate-fade-in"
        onClick={closeSearch}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-20 px-4 sm:pt-32 pointer-events-none">
        <div 
          className="w-full max-w-2xl bg-luxe-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden pointer-events-auto transform transition-all duration-300 animate-slide-in"
          onClick={e => e.stopPropagation()}
        >
           {/* Part 3: Premium Search Input */}
           <div className="relative flex items-center px-4 border-b border-white/5">
              <span className="text-gray-400 text-xl pl-2 pointer-events-none">🔍</span>
              <input 
                type="text"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search products, shops, or actions..."
                className="w-full bg-transparent text-white placeholder-gray-500 font-medium text-lg px-4 py-5 focus:outline-none focus:ring-0 appearance-none border-none"
              />
              <div className="flex items-center gap-2 pr-2">
                {query && (
                  <button onClick={() => setQuery('')} className="text-gray-500 hover:text-white transition-colors p-1">
                    ✕
                  </button>
                )}
                <span className="hidden sm:flex items-center gap-1 text-[10px] font-black text-gray-500 bg-white/5 border border-white/10 px-2 py-1 rounded-md tracking-widest uppercase">
                  ESC
                </span>
              </div>
           </div>
           
           {/* Part 4-7: Results Area */}
           <div className="max-h-[60vh] overflow-y-auto p-4 scrollbar-hide">
             {!query ? (
               <div className="py-6 px-4">
                 <div className="mb-6">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Trending Searches</h3>
                   <div className="flex flex-wrap gap-2">
                     {['Organic Milk', 'Fresh Eggs', 'Whole Wheat Bread', 'Dark Chocolate'].map(term => (
                       <button key={term} onClick={() => setQuery(term)} className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-500/50 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-all duration-300">
                         {term}
                       </button>
                     ))}
                   </div>
                 </div>
                 
                 <div>
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Quick Actions</h3>
                   <div className="flex flex-col gap-1">
                     <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 group transition-colors text-left">
                       <span className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">📊</span>
                       <span className="text-gray-300 group-hover:text-white font-medium transition-colors">Go to Dashboard</span>
                     </button>
                     <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 group transition-colors text-left">
                       <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">🛒</span>
                       <span className="text-gray-300 group-hover:text-white font-medium transition-colors">View Cart</span>
                     </button>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="py-2">
                 {filteredProducts.length > 0 && (
                   <div className="mb-6">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Products</h3>
                     <div className="flex flex-col">
                       {filteredProducts.map((p: any) => (
                         <button key={p.id} className="flex items-center justify-between p-4 hover:bg-white/5 group transition-colors text-left border-l-2 border-transparent hover:border-brand-500">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-luxe-800 rounded-xl p-2 border border-white/5 flex items-center justify-center">
                               {p.image_url ? (
                                 <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace('/api', '')}${p.image_url}`} alt={p.name} className="w-full h-full object-contain" />
                               ) : <span className="text-xl">🛍️</span>}
                             </div>
                             <div>
                               <h4 className="text-white font-medium group-hover:text-brand-300 transition-colors">{p.name}</h4>
                               <span className="text-xs text-gray-500">{p.shop?.name || 'Local Store'}</span>
                             </div>
                           </div>
                           <span className="text-brand-400 font-black">₹{p.price}</span>
                         </button>
                       ))}
                     </div>
                   </div>
                 )}

                 {filteredShops.length > 0 && (
                   <div className="mb-6">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Shops</h3>
                     <div className="flex flex-col">
                       {filteredShops.map((s: any) => (
                         <button key={s.id} className="flex items-center gap-4 p-4 hover:bg-white/5 group transition-colors text-left border-l-2 border-transparent hover:border-blue-500">
                           <div className="w-12 h-12 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl group-hover:scale-110 transition-transform">🏪</div>
                           <div>
                             <h4 className="text-white font-medium group-hover:text-blue-300 transition-colors">{s.name}</h4>
                             <span className="text-xs text-gray-500">View Shop Profile</span>
                           </div>
                         </button>
                       ))}
                     </div>
                   </div>
                 )}

                 {quickActions.length > 0 && (
                   <div>
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Actions</h3>
                     <div className="flex flex-col">
                       {quickActions.map((a: any) => (
                         <button key={a.title} className="flex items-center gap-4 p-4 hover:bg-white/5 group transition-colors text-left border-l-2 border-transparent hover:border-white/50">
                           <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>{a.icon}</div>
                           <h4 className="text-white font-medium group-hover:text-gray-300 transition-colors">{a.title}</h4>
                         </button>
                       ))}
                     </div>
                   </div>
                 )}

                 {filteredProducts.length === 0 && filteredShops.length === 0 && quickActions.length === 0 && (
                   <div className="p-10 text-center flex flex-col items-center justify-center">
                     <span className="text-5xl mb-4 opacity-50">🛸</span>
                     <p className="text-gray-400 text-lg">No results found for "<span className="text-white font-medium">{query}</span>"</p>
                     <p className="text-gray-600 text-sm mt-1">Try searching for something else.</p>
                   </div>
                 )}
               </div>
             )}
           </div>
        </div>
      </div>
    </>
  );
}
