'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SmartRecipesPage() {
  return (
    <div className="min-h-screen bg-luxe-900 text-white animate-fade-in relative overflow-hidden pt-24 pb-12">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-500/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
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

        {/* Part 2: Interactive Category Pills & Search Placeholder */}
        <div className="bg-luxe-800/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-glass text-center text-gray-500 mb-12 max-w-2xl mx-auto">
          Part 2: Interactive Category Pills & Search Area
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
