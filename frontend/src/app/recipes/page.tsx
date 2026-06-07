'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SmartRecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'High Protein', 'Keto', 'Vegan', 'Italian', 'Quick 10-Min', 'Desserts'];

  return (
    <div className="min-h-screen bg-luxe-900 text-white animate-fade-in relative overflow-hidden pt-24 pb-12">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-500/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors mb-6 font-bold text-sm uppercase tracking-widest">
            <span>←</span> Back to Store
          </Link>
          <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter mb-6">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500 italic">Recipes</span> 🪄
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
            Discover premium meals. Let our AI extract the ingredients. We'll cross-check your pantry and deliver the rest to your door in 10 minutes.
          </p>
        </div>

        {/* Part 2: Interactive Category Pills & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 max-w-5xl mx-auto">
          {/* Scrollable Pills */}
          <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-2 md:pb-0 w-full md:w-auto mask-fade-edges">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                  activeCategory === cat 
                    ? 'bg-brand-500 text-black border-brand-500 shadow-[0_0_15px_rgba(247,211,0,0.4)] scale-105' 
                    : 'bg-luxe-800/50 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-luxe-800/80 backdrop-blur-md border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all shadow-glass"
            />
          </div>
        </div>

        {/* Part 3: Dynamic Recipe Cards Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-luxe-800/30 backdrop-blur-sm border border-white/5 rounded-3xl h-80 flex items-center justify-center text-gray-500">Part 3: Recipe Card</div>
          <div className="bg-luxe-800/30 backdrop-blur-sm border border-white/5 rounded-3xl h-80 flex items-center justify-center text-gray-500">Part 3: Recipe Card</div>
          <div className="bg-luxe-800/30 backdrop-blur-sm border border-white/5 rounded-3xl h-80 flex items-center justify-center text-gray-500">Part 3: Recipe Card</div>
        </div>

        {/* Part 4 & 5: Magic Wand Parser & Pantry Checklist Modal Placeholder */}
        {/* This will be an overlay modal triggered when a recipe is clicked */}
        <div className="fixed bottom-4 right-4 bg-luxe-800 border border-white/10 p-4 rounded-xl text-xs text-gray-500 opacity-50 z-50 pointer-events-none">
          Part 4-6 Modal Hidden
        </div>

      </div>
    </div>
  );
}
