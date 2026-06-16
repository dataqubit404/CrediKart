'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const feedItems = [
  { id: 1, title: 'A5 Wagyu Steak', type: 'product', src: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1469&auto=format&fit=crop' },
  { id: 2, title: 'Artisan Avocado Toast', type: 'recipe', src: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=1470&auto=format&fit=crop' },
  { id: 3, title: 'Organic Ceremonial Matcha', type: 'product', src: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=1471&auto=format&fit=crop' },
];

export default function DiscoverFeed() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

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
            
            {/* Temporary Placeholder Text for Debugging Part 3 */}
            <div className="relative z-10 pointer-events-none opacity-50">
              <h2 className="text-3xl font-black font-display tracking-tight text-white drop-shadow-lg">
                {item.title}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
