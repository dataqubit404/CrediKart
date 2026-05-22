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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 pointer-events-none">
      <div className="pointer-events-auto">
         {/* Part 2: Shell & Overlay Placeholder */}
         <div className="bg-luxe-900 border border-white/10 p-10 text-white rounded-2xl shadow-glass-sm animate-fade-up">
            Command Palette Active
         </div>
      </div>
    </div>
  );
}
