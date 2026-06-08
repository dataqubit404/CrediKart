'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SmartRecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'High Protein', 'Keto', 'Vegan', 'Italian', 'Quick 10-Min', 'Desserts'];

  const recipes = [
    {
      id: 1,
      title: 'Artisan Avocado Toast',
      time: '10 Min',
      difficulty: 'Easy',
      category: 'Vegan',
      image: '/images/recipes/avocado_toast.png',
      ingredients: ['Sourdough Bread', 'Avocado', 'Eggs', 'Chili Flakes', 'Microgreens']
    },
    {
      id: 2,
      title: 'Teriyaki Salmon Bowl',
      time: '25 Min',
      difficulty: 'Medium',
      category: 'High Protein',
      image: '/images/recipes/salmon_bowl.png',
      ingredients: ['Salmon Fillet', 'Sushi Rice', 'Edamame', 'Teriyaki Sauce', 'Sesame Seeds']
    },
    {
      id: 3,
      title: 'Seared Ribeye Steak',
      time: '35 Min',
      difficulty: 'Hard',
      category: 'Keto',
      image: '/images/recipes/steak_dinner.png',
      ingredients: ['Ribeye Steak', 'Asparagus', 'Garlic', 'Butter', 'Thyme']
    }
  ];

  const filteredRecipes = activeCategory === 'All' 
    ? recipes 
    : recipes.filter(r => r.category === activeCategory);

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

        {/* Part 3: Dynamic Recipe Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {filteredRecipes.map(recipe => (
            <div 
              key={recipe.id} 
              className="group relative h-96 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-glass border border-white/10 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(247,211,0,0.15)]"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${recipe.image})` }}
              ></div>
              
              {/* Deep Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-luxe-900 via-luxe-900/60 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100"></div>

              {/* Card Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-widest border border-white/20 text-white">
                    {recipe.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-300">
                    ⏱ {recipe.time}
                  </span>
                </div>
                
                <h3 className="font-display font-black text-2xl mb-2 text-white leading-tight group-hover:text-brand-400 transition-colors">
                  {recipe.title}
                </h3>
                
                <div className="flex items-center justify-between mt-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-sm font-medium text-gray-400">
                    {recipe.ingredients.length} Ingredients
                  </span>
                  <div className="w-10 h-10 rounded-full bg-brand-500 text-black flex items-center justify-center font-bold shadow-[0_0_15px_rgba(247,211,0,0.4)]">
                    🪄
                  </div>
                </div>
              </div>
            </div>
          ))}
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
