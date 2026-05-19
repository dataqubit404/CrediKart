'use client';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

interface Product {
  id: number;
  name: string;
  price: number;
  mrp?: number;
  unit?: string;
  category?: string;
  image_url?: string;
  stock: number;
  is_flash_sale?: boolean;
  flash_price?: number;
  flash_ends_at?: string;
  is_donation?: boolean;
  offer_type?: 'NONE' | 'BOGO' | 'COMBO';
  shop?: { id: number; name: string };
}

export default function QuickViewModal({ product, isOpen, onClose }: { product: Product | null, isOpen: boolean, onClose: () => void }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B0C10]/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
      >
        {/* Modal Container */}
        <div 
          className="relative w-full max-w-4xl bg-luxe-900 border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row overflow-hidden animate-slide-in"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white z-10 transition-colors"
          >
            ✕
          </button>

          {/* Part 2: Interactive Image Gallery Placeholder */}
          <div className="w-full md:w-1/2 bg-luxe-800 p-10 flex items-center justify-center relative">
            <div className="text-white opacity-50">Part 2: Image Gallery</div>
          </div>

          {/* Part 3 & 4: Info & Add to Cart Placeholder */}
          <div className="w-full md:w-1/2 p-10 flex flex-col">
             <div className="text-white opacity-50 flex-1">Part 3: Info & Pricing</div>
             <div className="text-white opacity-50 mt-4 border-t border-white/10 pt-4">Part 4: Morphing Add to Cart</div>
          </div>
        </div>
      </div>
    </>
  );
}
