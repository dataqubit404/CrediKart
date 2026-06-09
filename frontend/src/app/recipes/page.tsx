'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SmartRecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [ownedIngredients, setOwnedIngredients] = useState<string[]>([]);

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

  const handleRecipeClick = (recipe: any) => {
    setSelectedRecipe(recipe);
    setOwnedIngredients([]); // Reset pantry for new recipe
    setIsParsing(true);
    // Simulate AI parsing for 2.5 seconds
    setTimeout(() => {
      setIsParsing(false);
    }, 2500);
  };

  const toggleIngredient = (ing: string) => {
    if (ownedIngredients.includes(ing)) {
      setOwnedIngredients(ownedIngredients.filter(item => item !== ing));
    } else {
      setOwnedIngredients([...ownedIngredients, ing]);
    }
  };

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
              onClick={() => handleRecipeClick(recipe)}
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

        {/* Part 4 & 5: Magic Wand Parser & Pantry Checklist Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
            <div className="bg-luxe-900 border border-white/10 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.5)] relative animate-fade-up">
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-6 right-6 z-50 w-10 h-10 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>

              {/* Left Side: Recipe Image & Parser */}
              <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[500px]">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${selectedRecipe.image})` }}></div>
                <div className="absolute inset-0 bg-luxe-900/40"></div>
                
                {isParsing && (
                  <>
                    {/* The Scanning Laser */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-500 shadow-[0_0_20px_rgba(247,211,0,0.8)] animate-pulse-glow z-20"
                         style={{ animation: 'scan 2.5s ease-in-out infinite alternate' }}
                    ></div>
                    {/* Parser Overlay Content */}
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm bg-luxe-900/60 p-8 text-center animate-fade-in">
                      <div className="text-5xl mb-6 animate-bounce">🪄</div>
                      <h3 className="font-display font-black text-2xl mb-2 text-brand-400 italic">AI Parsing Recipe...</h3>
                      <p className="text-sm font-medium text-gray-300">Extracting raw ingredients from {selectedRecipe.title}</p>
                      
                      {/* Fake terminal extraction lines */}
                      <div className="mt-8 text-left w-full max-w-xs space-y-2">
                        {selectedRecipe.ingredients.map((ing: string, i: number) => (
                           <div key={i} className="text-xs font-mono text-brand-500/70" style={{ animation: `fade-in 0.5s ease forwards`, animationDelay: `${i * 0.4}s`, opacity: 0 }}>
                             > Analyzing {ing.toLowerCase()}... [OK]
                           </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Recipe Info Header (Visible when not parsing) */}
                {!isParsing && (
                  <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-luxe-900 to-transparent">
                    <h2 className="font-display font-black text-3xl mb-2 text-white">{selectedRecipe.title}</h2>
                    <p className="text-brand-400 font-bold tracking-widest uppercase text-xs">Recipe Breakdown</p>
                  </div>
                )}
              </div>

              {/* Right Side: Pantry Checklist (Part 5) */}
              <div className="w-full md:w-1/2 p-8 md:p-12 bg-luxe-900 flex flex-col">
                {isParsing ? (
                   <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                     <div className="w-16 h-16 border-4 border-white/5 border-t-brand-500 rounded-full animate-spin mb-6"></div>
                     <p className="font-bold text-sm uppercase tracking-widest">Building Checklist...</p>
                   </div>
                ) : (
                   <div className="flex-1 flex flex-col animate-fade-in">
                     <h3 className="font-display font-black text-2xl mb-2 text-white">Your Pantry Checklist</h3>
                     <p className="text-gray-400 text-sm font-medium mb-6">Tap the ingredients you already have at home to cross them off the shopping list.</p>
                     
                     <div className="flex-1 overflow-y-auto pr-4 space-y-3 custom-scrollbar mb-8">
                       {selectedRecipe.ingredients.map((ing: string, i: number) => {
                         const isOwned = ownedIngredients.includes(ing);
                         return (
                           <div 
                             key={i} 
                             onClick={() => toggleIngredient(ing)}
                             className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                               isOwned 
                                 ? 'bg-brand-500/5 border-brand-500/30 opacity-60' 
                                 : 'bg-luxe-800 border-white/10 hover:border-brand-500/50 hover:bg-luxe-800/80 shadow-glass-sm'
                             }`}
                           >
                             <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                               isOwned ? 'bg-brand-500 border-brand-500 text-black' : 'bg-luxe-900 border-white/20'
                             }`}>
                               {isOwned && '✓'}
                             </div>
                             <span className={`font-bold transition-all duration-300 ${isOwned ? 'line-through text-gray-500' : 'text-white'}`}>
                               {ing}
                             </span>
                           </div>
                         );
                       })}
                     </div>

                     {/* Part 6: Add to Cart Button Placeholder */}
                     <button className="w-full bg-brand-500 text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-brand-400 transition-colors shadow-[0_0_20px_rgba(247,211,0,0.3)] hover:shadow-[0_0_30px_rgba(247,211,0,0.5)] flex items-center justify-center gap-2">
                       <span>🛒</span> Add {selectedRecipe.ingredients.length - ownedIngredients.length} Items to Cart
                     </button>
                   </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
