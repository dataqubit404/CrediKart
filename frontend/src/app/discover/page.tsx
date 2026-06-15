'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const feedItems = [
  { id: 1, title: 'A5 Wagyu Steak', type: 'product' },
  { id: 2, title: 'Artisan Avocado Toast', type: 'recipe' },
  { id: 3, title: 'Organic Ceremonial Matcha', type: 'product' },
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
          <div key={item.id} className="w-full h-screen snap-start snap-always relative flex items-center justify-center bg-luxe-900 border-b border-white/5">
            <h2 className="text-3xl font-black font-display tracking-tight text-white/20">
              Video / Image #{index + 1}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
