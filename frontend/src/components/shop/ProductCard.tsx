'use client';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import QuickViewModal from './QuickViewModal';

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
  combo_product_id?: number;
  shop?: { id: number; name: string };
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items, updateQty } = useCartStore();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const inCart = items.find(i => i.product_id === product.id);

  const isFlashActive = product.is_flash_sale && product.flash_ends_at && new Date(product.flash_ends_at) > new Date();
  const currentPrice = product.is_donation ? 0 : (isFlashActive ? Number(product.flash_price) : product.price);
  
  const discount = product.mrp ? Math.round(((product.mrp - currentPrice) / product.mrp) * 100) : 0;

  const handleAdd = () => {
    if (!product.shop) { toast.error('Shop info missing'); return; }
    addItem({
      product_id: product.id,
      shop_id: product.shop.id,
      shop_name: product.shop.name,
      name: product.name,
      price: currentPrice,
      mrp: product.mrp,
      unit: product.unit,
      image_url: product.image_url,
    });
    toast.success(`${product.name} added to cart`);
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const BASE = API_URL.replace('/api', '');

  return (
    <div className="bg-luxe-800/80 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-3 flex flex-col gap-2 hover:border-brand-500/50 hover:bg-luxe-700/80 shadow-glass-sm hover:shadow-[0_8px_30px_rgba(247,211,0,0.15)] transition-all duration-500 group relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/0 blur-[60px] rounded-full group-hover:bg-brand-500/10 transition-all duration-700 pointer-events-none"></div>

      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
        {product.is_donation && (
          <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-400 text-[9px] font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5 uppercase tracking-widest">
            <span>🌍</span> FREE
          </div>
        )}
        {isFlashActive && (
          <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 text-[9px] font-black px-2.5 py-1 rounded-lg shadow-[0_0_10px_rgba(239,68,68,0.2)] flex items-center gap-1.5 uppercase italic animate-pulse">
            <span>⚡</span> FLASH
          </div>
        )}
        {product.offer_type === 'BOGO' && (
          <div className="bg-brand-500/20 backdrop-blur-md border border-brand-500/30 text-brand-300 text-[9px] font-black px-2.5 py-1 rounded-lg shadow-[0_0_10px_rgba(247,211,0,0.2)] flex items-center gap-1.5 uppercase tracking-widest">
            <span>🎁</span> BOGO
          </div>
        )}
        {product.offer_type === 'COMBO' && (
          <div className="bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-indigo-300 text-[9px] font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5 uppercase tracking-widest">
            <span>🤝</span> COMBO
          </div>
        )}
        {discount > 0 && !product.is_donation && (
          <div className="bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-blue-400 text-[9px] font-black px-2.5 py-1 rounded-lg shadow-sm flex flex-col items-center leading-none tracking-wider">
            <span>{discount}% OFF</span>
          </div>
        )}
      </div>

      {/* Image */}
      <div 
        className="relative bg-luxe-900 rounded-[1rem] overflow-hidden aspect-square flex items-center justify-center border border-white/5 cursor-pointer group/img"
        onClick={() => setIsQuickViewOpen(true)}
      >
        {product.image_url ? (
          <img
            src={`${BASE}${product.image_url}`}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover/img:scale-110 transition-transform duration-700 opacity-90 group-hover/img:opacity-100"
          />
        ) : (
          <div className="text-4xl opacity-20 drop-shadow-md group-hover/img:scale-110 transition-transform duration-700">🛍️</div>
        )}
        
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-luxe-900/80 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white text-xs font-black uppercase tracking-widest border border-white/20 bg-white/5 px-3 py-1.5 rounded-lg shadow-xl">Sold Out</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 mt-2 z-10">
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-[9px] font-bold text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md uppercase tracking-widest">
            {product.unit || 'Each'}
          </span>
        </div>
        <h3 className="text-sm font-bold text-gray-200 leading-tight line-clamp-2 h-10 group-hover:text-white transition-colors">
          {product.name}
        </h3>
      </div>

      {/* Price + Add Section */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 z-10">
        <div className="flex flex-col">
          <span className={`text-sm font-black tracking-tight ${product.is_donation ? 'text-green-400' : (isFlashActive ? 'text-red-400' : 'text-white')}`}>
            {product.is_donation ? 'FREE' : `₹${currentPrice}`}
          </span>
          {(product.mrp && product.mrp > currentPrice) || isFlashActive ? (
            <span className="text-[10px] text-gray-500 line-through font-medium">₹{product.is_donation ? product.price : (isFlashActive ? product.price : product.mrp)}</span>
          ) : null}
        </div>

        {product.stock > 0 && (
          inCart ? (
            <div className="flex items-center bg-blinkit-green/20 backdrop-blur-md border border-blinkit-green/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(59,177,67,0.2)]">
              <button
                onClick={() => updateQty(product.id, inCart.qty - 1)}
                className="w-8 h-8 flex items-center justify-center text-green-400 font-black hover:bg-blinkit-green/20 transition-colors"
              >−</button>
              <span className="text-white font-black w-4 text-center text-xs">{inCart.qty}</span>
              <button
                onClick={() => updateQty(product.id, inCart.qty + 1)}
                className="w-8 h-8 flex items-center justify-center text-green-400 font-black hover:bg-blinkit-green/20 transition-colors"
              >+</button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-white/5 hover:bg-blinkit-green/20 text-green-400 border border-white/10 hover:border-blinkit-green/40 font-black px-4 py-2 rounded-xl text-xs transition-all duration-300 uppercase tracking-widest shadow-sm hover:shadow-[0_0_15px_rgba(59,177,67,0.2)] transform active:scale-95"
            >
              Add
            </button>
          )
        )}
      </div>

      <QuickViewModal 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </div>
  );
}
