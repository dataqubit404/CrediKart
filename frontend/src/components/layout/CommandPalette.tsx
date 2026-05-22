'use client';
import { useEffect } from 'react';
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
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
           {/* Part 3: Premium Search Input Placeholder */}
           <div className="p-4 border-b border-white/5 opacity-50">Part 3: Search Input</div>
           
           {/* Part 4-7: Results Placeholder */}
           <div className="p-4 opacity-50">Part 4-7: Dynamic Results Area</div>
        </div>
      </div>
    </>
  );
}
