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

          {/* Part 2: Interactive Image Gallery */}
          <div className="w-full md:w-1/2 bg-luxe-800 p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-white/5 overflow-hidden group/modalimg">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none group-hover/modalimg:bg-brand-500/20 transition-all duration-700"></div>
            
            {/* Image Container with Zoom Effect */}
            <div className="relative w-full aspect-square max-w-sm rounded-3xl overflow-hidden border border-white/10 bg-luxe-900/50 shadow-glass-sm flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace('/api', '')}${product.image_url}`}
                  alt={product.name}
                  className="w-full h-full object-contain p-6 transform group-hover/modalimg:scale-125 transition-transform duration-700 opacity-90 group-hover/modalimg:opacity-100 cursor-zoom-in drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                />
              ) : (
                <div className="text-8xl opacity-10 drop-shadow-md group-hover/modalimg:scale-110 transition-transform duration-700">🛍️</div>
              )}
            </div>

            {/* Badges on Image */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {product.is_flash_sale && (
                <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center gap-2 uppercase italic animate-pulse">
                  <span>⚡</span> FLASH SALE
                </div>
              )}
              {product.offer_type === 'BOGO' && (
                <div className="bg-brand-500/20 backdrop-blur-md border border-brand-500/30 text-brand-300 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-[0_0_15px_rgba(247,211,0,0.2)] flex items-center gap-2 uppercase tracking-widest">
                  <span>🎁</span> BOGO OFFER
                </div>
              )}
            </div>
          </div>

          {/* Part 3 & 4: Info & Add to Cart */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-[#0B0C10]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md uppercase tracking-widest">
                  {product.category || 'General'}
                </span>
                <span className="text-[10px] font-black text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md uppercase tracking-widest">
                  {product.unit || 'Each'}
                </span>
              </div>
              
              <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-tight mb-4 leading-tight">
                {product.name}
              </h2>
              
              <div className="flex items-end gap-3 mb-6 pb-6 border-b border-white/5">
                <div className="flex flex-col">
                  <span className={`text-4xl font-black tracking-tighter drop-shadow-md ${product.is_donation ? 'text-green-400' : (product.is_flash_sale ? 'text-red-400' : 'text-brand-400')}`}>
                    {product.is_donation ? 'FREE' : `₹${product.is_flash_sale ? product.flash_price : product.price}`}
                  </span>
                  {(product.mrp && product.mrp > (product.is_flash_sale ? Number(product.flash_price) : product.price)) || product.is_flash_sale ? (
                    <span className="text-sm text-gray-500 line-through font-bold tracking-wider">
                      MRP: ₹{product.is_donation ? product.price : (product.is_flash_sale ? product.price : product.mrp)}
                    </span>
                  ) : null}
                </div>
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest mb-1.5 animate-pulse">
                    Only {product.stock} left!
                  </span>
                )}
              </div>
              
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                Experience premium quality with this selection. Carefully sourced and delivered right to your doorstep. Make sure to grab it before stock runs out!
              </p>
            </div>

            <div className="mt-auto">
              <div className="text-white opacity-50 border-t border-white/10 pt-4">Part 4: Morphing Add to Cart</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
