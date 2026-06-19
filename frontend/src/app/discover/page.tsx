'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

const feedItems = [
  {
    id: 1, title: 'A5 Wagyu Steak', type: 'product',
    src: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1469&auto=format&fit=crop',
    price: '₹4,999', originalPrice: '₹6,499', rating: 4.9, reviews: 1284,
    shop: 'Luxe Meats Co.', shopAvatar: '🥩', tag: '⚡ Flash Deal',
    desc: 'Premium marbled Japanese Wagyu, graded A5 — the highest possible rating.',
  },
  {
    id: 2, title: 'Artisan Avocado Toast', type: 'recipe',
    src: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=1470&auto=format&fit=crop',
    price: '₹349', originalPrice: null, rating: 4.7, reviews: 568,
    shop: 'The Green Table', shopAvatar: '🥑', tag: '🪄 Smart Recipe',
    desc: 'All 5 ingredients auto-added to cart by our AI Recipe Builder.',
  },
  {
    id: 3, title: 'Organic Ceremonial Matcha', type: 'product',
    src: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=1471&auto=format&fit=crop',
    price: '₹1,199', originalPrice: '₹1,599', rating: 4.8, reviews: 902,
    shop: 'Zen Harvest', shopAvatar: '🍵', tag: '✨ Trending',
    desc: 'First harvest ceremonial grade matcha from Uji, Kyoto, Japan.',
  },
];

function SlideToButton({ onComplete, price }: { onComplete: () => void; price: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const thumbWidth = 56;
    const maxTravel = rect.width - thumbWidth;
    const pct = Math.min(Math.max((x - thumbWidth / 2) / maxTravel, 0), 1);
    setProgress(pct);
  };

  const handlePointerUp = () => {
    setDragging(false);
    if (progress > 0.85) {
      setProgress(1);
      onComplete();
    } else {
      setProgress(0);
    }
  };

  const thumbWidth = 56;

  return (
    <div
      ref={trackRef}
      className="relative h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Animated fill */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500/30 to-brand-500/10 rounded-2xl transition-all"
        style={{ width: `${progress * 100}%`, transition: dragging ? 'none' : 'width 0.4s cubic-bezier(0.16,1,0.3,1)' }}
      />

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="text-sm font-black uppercase tracking-widest text-white/40 transition-opacity"
          style={{ opacity: 1 - progress * 2 }}
        >
          Slide to Buy · {price}
        </span>
      </div>

      {/* Draggable thumb */}
      <div
        className={`absolute top-1 bottom-1 w-12 rounded-xl bg-brand-500 flex items-center justify-center text-black text-xl font-black shadow-[0_0_20px_rgba(247,211,0,0.5)] transition-all ${dragging ? 'scale-105' : ''}`}
        style={{
          left: `calc(${progress * 100}% * (1 - ${thumbWidth}px / ${trackRef.current?.offsetWidth || 300}px) + 4px)`,
          transition: dragging ? 'none' : 'left 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
        onPointerDown={handlePointerDown}
      >
        →
      </div>
    </div>
  );
}

export default function DiscoverFeed() {
  const [mounted, setMounted] = useState(false);
  const [likes, setLikes] = useState<Record<number, boolean>>({});
  const [saves, setSaves] = useState<Record<number, boolean>>({});
  const [purchased, setPurchased] = useState<Record<number, boolean>>({});
  const addItem = useCartStore((s: any) => s.addItem);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLike = (id: number) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: number) => {
    setSaves(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePurchase = (item: typeof feedItems[0]) => {
    setPurchased(prev => ({ ...prev, [item.id]: true }));
    addItem({
      id: item.id * 1000,
      name: item.title,
      price: parseFloat(item.price.replace(/[₹,]/g, '')),
      image: item.src,
      shop_id: item.id,
    });
  };

  if (!mounted) return <div className="h-screen bg-black w-full" />;

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden relative">
      {/* Floating Top Navigation (Minimal) */}
      <div className="absolute top-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <Link href="/" className="pointer-events-auto w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <span className="text-xl">←</span>
        </Link>
        <h1 className="font-display font-black text-xl tracking-widest uppercase text-white drop-shadow-md">
          Discover
        </h1>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Full Screen Snapping Container */}
      <div className="w-full h-full snap-y snap-mandatory overflow-y-scroll scroll-smooth hide-scrollbar">
        {feedItems.map((item, index) => (
          <div key={item.id} className="w-full h-screen snap-start snap-always relative flex items-center justify-center bg-black overflow-hidden group">
            {/* Dynamic Media Player */}
            <div className="absolute inset-0 w-full h-full">
              <img 
                src={item.src} 
                alt={item.title}
                className="w-full h-full object-cover animate-slow-zoom"
              />
              {/* Gradient Overlays for Readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
            </div>

            {/* Part 4: Engagement Overlay UI */}
            <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
              <button 
                onClick={() => toggleLike(item.id)}
                className="flex flex-col items-center gap-1 group/btn"
              >
                <div className={`w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center text-2xl transition-all duration-300 ${likes[item.id] ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110' : 'bg-black/40 border-white/20 text-white hover:bg-white/10'}`}>
                  {likes[item.id] ? '❤️' : '🤍'}
                </div>
                <span className="text-xs font-bold drop-shadow-md">{likes[item.id] ? '12.4K' : '12.3K'}</span>
              </button>

              <button className="flex flex-col items-center gap-1 group/btn">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-2xl text-white hover:bg-white/10 transition-all duration-300">
                  💬
                </div>
                <span className="text-xs font-bold drop-shadow-md">842</span>
              </button>

              <button 
                onClick={() => toggleSave(item.id)}
                className="flex flex-col items-center gap-1 group/btn"
              >
                <div className={`w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center text-2xl transition-all duration-300 ${saves[item.id] ? 'bg-brand-500/20 border-brand-500 text-brand-500 shadow-[0_0_20px_rgba(247,211,0,0.5)] scale-110' : 'bg-black/40 border-white/20 text-white hover:bg-white/10'}`}>
                  {saves[item.id] ? '⭐' : '🔖'}
                </div>
                <span className="text-xs font-bold drop-shadow-md">{saves[item.id] ? 'Saved' : 'Save'}</span>
              </button>

              <button className="flex flex-col items-center gap-1 group/btn">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-2xl text-white hover:bg-white/10 transition-all duration-300">
                  🔗
                </div>
                <span className="text-xs font-bold drop-shadow-md">Share</span>
              </button>
            </div>
            
            {/* Part 5: Product Highlight Card */}
            <div className="absolute bottom-5 left-4 right-20 z-20 animate-fade-up">
              {/* Shop info row */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-base">
                  {item.shopAvatar}
                </div>
                <span className="text-sm font-black text-white drop-shadow-md tracking-wide">{item.shop}</span>
                <span className="ml-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-400">
                  {item.tag}
                </span>
              </div>

              {/* Glass Card */}
              <div className="bg-black/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                <h2 className="font-display font-black text-2xl text-white tracking-tight mb-1">{item.title}</h2>
                <p className="text-gray-300 text-sm font-medium mb-3 leading-relaxed line-clamp-2">{item.desc}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < Math.floor(item.rating) ? 'text-brand-400' : 'text-white/20'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-brand-400 font-black text-sm">{item.rating}</span>
                  <span className="text-gray-500 text-xs font-medium">({item.reviews.toLocaleString()} reviews)</span>
                </div>

                {/* Price Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{item.price}</span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-500 line-through font-medium">{item.originalPrice}</span>
                    )}
                  </div>
                  {item.originalPrice && (
                    <span className="px-2.5 py-1 text-xs font-black uppercase tracking-widest rounded-full bg-green-500/20 border border-green-500/40 text-green-400">
                      {Math.round((1 - parseInt(item.price.replace(/[₹,]/g,'')) / parseInt(item.originalPrice.replace(/[₹,]/g,''))) * 100)}% OFF
                    </span>
                  )}
                </div>

                {/* Part 6: Slide to Buy */}
                <div className="mt-4">
                  {purchased[item.id] ? (
                    <div className="h-14 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center gap-2 animate-fade-in">
                      <span className="text-2xl">✓</span>
                      <span className="font-black text-green-400 uppercase tracking-widest text-sm">Added to Cart</span>
                    </div>
                  ) : (
                    <SlideToButton onComplete={() => handlePurchase(item)} price={item.price} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
