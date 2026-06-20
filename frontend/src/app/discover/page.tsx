'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import CartDrawer from '@/components/cart/CartDrawer';
import toast from 'react-hot-toast';

const feedItems = [
  {
    id: 1, title: 'A5 Wagyu Steak', type: 'product',
    src: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1469&auto=format&fit=crop',
    price: '₹4,999', originalPrice: '₹6,499', rating: 4.9, reviews: 1284,
    shop: 'Luxe Meats Co.', shopAvatar: '🥩', tag: '⚡ Flash Deal',
    desc: 'Premium marbled Japanese Wagyu, graded A5 — the highest possible marbling score.',
    followers: '42.5K',
    likes: '680K',
    bio: 'Curators of premium Japanese A5 Wagyu, custom dry-aged steaks, and luxury cold cuts. Delivered fresh, chilled in luxury insulated packaging.',
    products: [
      { id: 101, name: 'Dry-Aged Ribeye Steak (350g)', price: 1899, image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=300&auto=format&fit=crop' },
      { id: 102, name: 'Premium Smoked Pork Bacon (200g)', price: 699, image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=300&auto=format&fit=crop' },
    ]
  },
  {
    id: 2, title: 'Artisan Avocado Toast', type: 'recipe',
    src: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=1470&auto=format&fit=crop',
    price: '₹349', originalPrice: null, rating: 4.7, reviews: 568,
    shop: 'The Green Table', shopAvatar: '🥑', tag: '🪄 Smart Recipe',
    desc: 'All 5 organic ingredients auto-added to cart by our AI Recipe Builder.',
    followers: '18.9K',
    likes: '245K',
    bio: 'Bustling plant-based café and grocer focused on sustainable farm-to-table organic produce, fresh breads, and natural spreads.',
    products: [
      { id: 201, name: 'Organic Hass Avocados (2 Pack)', price: 199, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=300&auto=format&fit=crop' },
      { id: 202, name: 'Artisan Sourdough Boule (450g)', price: 149, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop' },
    ]
  },
  {
    id: 3, title: 'Organic Ceremonial Matcha', type: 'product',
    src: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=1471&auto=format&fit=crop',
    price: '₹1,199', originalPrice: '₹1,599', rating: 4.8, reviews: 902,
    shop: 'Zen Harvest', shopAvatar: '🍵', tag: '✨ Trending',
    desc: 'First harvest ceremonial grade matcha from Uji, Kyoto, Japan.',
    followers: '64.2K',
    likes: '1.1M',
    bio: 'Authentic stone-ground green teas and traditional tea utensils sourced directly from family farms in historic Uji, Kyoto.',
    products: [
      { id: 301, name: 'Hand-Carved Bamboo Matcha Whisk', price: 599, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=300&auto=format&fit=crop' },
      { id: 302, name: 'Handcrafted Ceramic Matcha Bowl', price: 1499, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300&auto=format&fit=crop' },
    ]
  },
];

function SlideToButton({ onComplete, price, id }: { onComplete: () => void; price: string; id?: string }) {
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
      id={id}
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
  
  // Custom micro-animation states
  const [particles, setParticles] = useState<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    burstX: number;
    burstY: number;
    targetX: number;
    targetY: number;
    delay: number;
    duration: number;
  }[]>([]);
  const [cardPulse, setCardPulse] = useState<Record<number, boolean>>({});
  const [cartWobble, setCartWobble] = useState(false);

  // Shop Mini-Modal States
  const [selectedShop, setSelectedShop] = useState<typeof feedItems[0] | null>(null);
  const [following, setFollowing] = useState<Record<number, boolean>>({});

  const addItem = useCartStore((s: any) => s.addItem);
  const openCart = useCartStore((s: any) => s.openCart);
  const items = useCartStore((s: any) => s.items);
  const itemCount = items.reduce((acc: number, item: any) => acc + item.qty, 0);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLike = (id: number) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: number) => {
    setSaves(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFollow = (shopId: number, shopName: string) => {
    const isFollowing = !following[shopId];
    setFollowing(prev => ({ ...prev, [shopId]: isFollowing }));
    if (isFollowing) {
      toast.success(`You are now following ${shopName}!`);
    } else {
      toast.success(`Unfollowed ${shopName}`);
    }
  };

  const handlePurchase = (item: typeof feedItems[0]) => {
    // 1. Trigger card tactile pulse
    setCardPulse(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setCardPulse(prev => ({ ...prev, [item.id]: false }));
    }, 600);

    // 2. Set purchased state immediately to transition button layout
    setPurchased(prev => ({ ...prev, [item.id]: true }));

    // 3. Fire particle micro-animation flying to the top-right cart
    const sourceBtn = document.getElementById(`slide-buy-${item.id}`);
    const cartBtn = document.getElementById('discover-cart-btn');

    if (sourceBtn && cartBtn) {
      const sourceRect = sourceBtn.getBoundingClientRect();
      const cartRect = cartBtn.getBoundingClientRect();

      // Start at the center of the slide-to-buy thumb/button
      const startX = sourceRect.left + sourceRect.width / 2;
      const startY = sourceRect.top + sourceRect.height / 2;

      // Distance to the center of the cart icon
      const dx = cartRect.left + cartRect.width / 2 - startX;
      const dy = cartRect.top + cartRect.height / 2 - startY;

      // Theme-matched premium colors: Gold, Emerald/Mint Green, Pure White, Light Yellow, Jade Green
      const colors = ['#F7D300', '#10B981', '#FFFFFF', '#FDE047', '#34D399', '#A7F3D0'];

      const newParticles = Array.from({ length: 18 }).map((_, idx) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 80 + 40; // initial explosion speed
        const burstX = Math.cos(angle) * speed;
        // explode upwards more
        const burstY = Math.sin(angle) * speed - 60; 

        return {
          id: Date.now() + idx,
          x: startX,
          y: startY,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 6, // 6px to 12px
          burstX,
          burstY,
          targetX: dx + (Math.random() * 20 - 10), // slight target spread
          targetY: dy + (Math.random() * 20 - 10),
          delay: Math.random() * 0.2, // staggered delay
          duration: Math.random() * 0.4 + 0.8, // 0.8s to 1.2s flight time
        };
      });

      setParticles(newParticles);

      // 4. Trigger cart wobble & add the item when the particles arrive
      setTimeout(() => {
        setCartWobble(true);
        addItem({
          product_id: item.id * 1000,
          shop_id: item.id,
          shop_name: item.shop,
          name: item.title,
          price: parseFloat(item.price.replace(/[₹,]/g, '')),
          mrp: item.originalPrice ? parseFloat(item.originalPrice.replace(/[₹,]/g, '')) : undefined,
          image_url: item.src,
        });
      }, 850);

      // Stop wobble
      setTimeout(() => {
        setCartWobble(false);
      }, 1350);

      // Cleanup particles from DOM
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 2000);

    } else {
      // Fallback if elements not in DOM
      addItem({
        product_id: item.id * 1000,
        shop_id: item.id,
        shop_name: item.shop,
        name: item.title,
        price: parseFloat(item.price.replace(/[₹,]/g, '')),
        mrp: item.originalPrice ? parseFloat(item.originalPrice.replace(/[₹,]/g, '')) : undefined,
        image_url: item.src,
      });
    }
  };

  const handleAddModalProduct = (prod: any, shop: typeof feedItems[0]) => {
    addItem({
      product_id: prod.id,
      shop_id: shop.id,
      shop_name: shop.shop,
      name: prod.name,
      price: prod.price,
      image_url: prod.image,
    });
    toast.success(`${prod.name} added to cart!`);
  };

  if (!mounted) return <div className="h-screen bg-black w-full" />;

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden relative">
      {/* Dynamic inline styles for the custom animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes particleFly {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 1;
          }
          20% {
            transform: translate3d(var(--burst-x), var(--burst-y), 0) scale(1.3);
            opacity: 1;
            filter: drop-shadow(0 0 8px var(--particle-color));
          }
          40% {
            opacity: 1;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translate3d(var(--target-x), var(--target-y), 0) scale(0.1);
            opacity: 0;
          }
        }
        .animate-particle-fly {
          animation: particleFly var(--duration) cubic-bezier(0.25, 1, 0.5, 1) var(--delay) forwards;
        }
        @keyframes cardPulse {
          0%, 100% { transform: scale(1); }
          30% { transform: scale(0.96); }
          60% { transform: scale(1.025); }
        }
        .animate-card-pulse {
          animation: cardPulse 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Floating Particles Overlay */}
      {particles.map(p => (
        <div
          key={p.id}
          className="fixed rounded-full pointer-events-none z-50 animate-particle-fly"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
            '--burst-x': `${p.burstX}px`,
            '--burst-y': `${p.burstY}px`,
            '--target-x': `${p.targetX}px`,
            '--target-y': `${p.targetY}px`,
            '--delay': `${p.delay}s`,
            '--duration': `${p.duration}s`,
            '--particle-color': p.color,
          } as any}
        />
      ))}

      {/* Floating Top Navigation */}
      <div className="absolute top-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <Link href="/" className="pointer-events-auto w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <span className="text-xl">←</span>
        </Link>
        <h1 className="font-display font-black text-xl tracking-widest uppercase text-white drop-shadow-md">
          Discover
        </h1>
        {/* Floating Cart Button */}
        <button
          onClick={() => openCart()}
          id="discover-cart-btn"
          className={`pointer-events-auto w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border flex items-center justify-center hover:bg-white/10 transition-all duration-300 relative ${cartWobble ? 'animate-bounce scale-110 border-brand-500 shadow-[0_0_15px_rgba(247,211,0,0.6)] bg-brand-500/10' : 'border-white/10'}`}
        >
          <span className="text-lg">🛒</span>
          {mounted && itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(247,211,0,0.5)] animate-pulse-glow">
              {itemCount}
            </span>
          )}
        </button>
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
            <div className={`absolute bottom-5 left-4 right-20 z-20 animate-fade-up ${cardPulse[item.id] ? 'animate-card-pulse' : ''}`}>
              {/* Shop info row */}
              <div 
                onClick={() => setSelectedShop(item)}
                className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-all pointer-events-auto"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-base hover:scale-105 active:scale-95 transition-all">
                  {item.shopAvatar}
                </div>
                <span className="text-sm font-black text-white drop-shadow-md tracking-wide hover:underline">{item.shop}</span>
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
                    <SlideToButton id={`slide-buy-${item.id}`} onComplete={() => handlePurchase(item)} price={item.price} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Creator / Shop Profile Bottom Sheet Modal */}
      {selectedShop && (
        <>
          {/* Backdrop overlay */}
          <div 
            onClick={() => setSelectedShop(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 animate-fade-in pointer-events-auto cursor-pointer"
          />
          {/* Bottom sheet content */}
          <div className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[#0E1015]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[2.5rem] z-50 p-6 pb-10 overflow-y-auto animate-slide-up shadow-[0_-15px_40px_rgba(0,0,0,0.8)] pointer-events-auto select-none">
            {/* Grab handle indicator */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

            {/* Profile Info Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-glass-sm">
                  {selectedShop.shopAvatar}
                </div>
                <div>
                  <h3 className="font-display font-black text-xl text-white tracking-tight leading-tight">
                    {selectedShop.shop}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-gray-400">
                    <span>{selectedShop.followers} Followers</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>{selectedShop.likes} Likes</span>
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <button 
                onClick={() => toggleFollow(selectedShop.id, selectedShop.shop)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${following[selectedShop.id] ? 'bg-green-500/20 border border-green-500/40 text-green-400' : 'bg-brand-500 text-black hover:bg-brand-400 shadow-[0_0_15px_rgba(247,211,0,0.3)]'}`}
              >
                {following[selectedShop.id] ? '✓ Following' : 'Follow'}
              </button>
            </div>

            {/* Shop Bio */}
            <p className="text-gray-300 text-sm font-medium leading-relaxed mb-6 bg-white/5 border border-white/5 rounded-2xl p-4">
              {selectedShop.bio}
            </p>

            {/* Shop Featured Products */}
            <div>
              <h4 className="font-display font-black text-sm uppercase tracking-widest text-white/50 mb-4">
                Top Products from this Shop
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {selectedShop.products.map(prod => (
                  <div key={prod.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-2 relative overflow-hidden group/prod">
                    <div className="h-28 w-full rounded-xl overflow-hidden relative">
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover/prod:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/prod:opacity-100 transition-opacity duration-300" />
                    </div>
                    <h5 className="font-bold text-sm text-white line-clamp-1 leading-snug">{prod.name}</h5>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-brand-400">₹{prod.price}</span>
                      <button 
                        onClick={() => handleAddModalProduct(prod, selectedShop)}
                        className="w-8 h-8 rounded-lg bg-brand-500 text-black font-black text-lg flex items-center justify-center hover:bg-brand-400 active:scale-95 transition-all shadow-[0_0_10px_rgba(247,211,0,0.3)]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Sidebar Cart Drawer integration */}
      <CartDrawer />
    </div>
  );
}
