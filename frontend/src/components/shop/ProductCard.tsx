'use client';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, Zap, Globe, Gift, Package, Star } from 'lucide-react';

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
    <div className="card-premium h-full group flex flex-col relative">
      {/* Badges Container */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {product.is_donation && (
          <div className="badge-tech bg-green-500/20 text-green-500 border-green-500/30 flex items-center gap-1.5 backdrop-blur-sm">
            <Globe className="w-3 h-3" />
            <span>Eco-Donation</span>
          </div>
        )}
        {isFlashActive && (
          <div className="badge-tech bg-red-500/20 text-red-500 border-red-500/30 flex items-center gap-1.5 backdrop-blur-sm animate-pulse">
            <Zap className="w-3 h-3 fill-current" />
            <span>Flash Deal</span>
          </div>
        )}
        {product.offer_type === 'BOGO' && (
          <div className="badge-tech bg-luxury-gold/20 text-luxury-gold border-luxury-gold/30 flex items-center gap-1.5 backdrop-blur-sm">
            <Gift className="w-3 h-3" />
            <span>BOGO</span>
          </div>
        )}
      </div>

      {/* Image Section */}
      <div className="relative aspect-square rounded-[1.5rem] bg-gray-50 dark:bg-midnight-lightest/30 overflow-hidden mb-5 group-hover:shadow-2xl transition-all duration-700">
        {product.image_url ? (
          <img
            src={`${BASE}${product.image_url}`}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-500/5">
            <Package className="w-12 h-12 text-brand-500/20" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/5 transition-colors duration-500"></div>

        {product.stock === 0 && (
          <div className="absolute inset-0 glass-dark flex items-center justify-center">
            <span className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/20">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest bg-brand-500/5 px-2 py-0.5 rounded-md border border-brand-500/10">
            {product.unit || 'Standard'}
          </span>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">• {product.category || 'Essential'}</span>
        </div>
        
        <h3 className="font-display font-bold text-gray-900 dark:text-white text-base leading-tight mb-4 group-hover:text-brand-500 transition-colors line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-black ${product.is_donation ? 'text-green-500' : (isFlashActive ? 'text-red-500' : 'text-gray-900 dark:text-white')}`}>
              {product.is_donation ? 'FREE' : `₹${currentPrice}`}
            </span>
            {discount > 0 && (
              <span className="text-xs font-bold text-brand-500 bg-brand-500/10 px-1.5 py-0.5 rounded-md">-{discount}%</span>
            )}
          </div>
          {(product.mrp && product.mrp > currentPrice) && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 line-through font-bold">₹{product.mrp}</span>
          )}
        </div>

        {product.stock > 0 && (
          inCart ? (
            <div className="flex items-center bg-brand-500 rounded-2xl p-1.5 shadow-neon-blue transition-all">
              <button
                onClick={() => updateQty(product.id, inCart.qty - 1)}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 rounded-xl transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-white font-black px-3 text-sm">{inCart.qty}</span>
              <button
                onClick={() => updateQty(product.id, inCart.qty + 1)}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-midnight-lightest border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all duration-300 shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          )
        )}
      </div>
    </div>
  );
}
