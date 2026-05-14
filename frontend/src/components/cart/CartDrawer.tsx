'use client';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total, clearCart } = useCartStore();
  const { user } = useAuthStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-midnight/80 backdrop-blur-sm z-[60] animate-fade-in" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[450px] glass-dark border-l border-white/5 z-[70] flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white tracking-tight">Your Cart</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{items.length} Items Selected</p>
            </div>
          </div>
          <button onClick={closeCart} className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-6 text-4xl">🛒</div>
              <p className="text-white font-black text-xl mb-2">Cart is empty</p>
              <p className="text-gray-500 font-medium mb-8">Looks like you haven't added anything yet.</p>
              <button onClick={closeCart} className="btn-premium px-8">Start Shopping</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product_id} className="flex items-center gap-4 glass bg-white/5 p-4 rounded-3xl border-white/5 group">
                <div className="w-20 h-20 rounded-2xl bg-white/5 overflow-hidden p-2 shrink-0 border border-white/5">
                  {item.image_url ? (
                    <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace('/api', '')}${item.image_url}`} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">🛍️</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate mb-0.5">{item.name}</p>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{item.unit || 'Standard Unit'}</p>
                  <p className="text-base font-black text-brand-500">₹{item.price}</p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center bg-midnight rounded-xl p-1 border border-white/10">
                    <button onClick={() => updateQty(item.product_id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-white font-black text-xs w-6 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.product_id, item.qty + 1)} className="w-7 h-7 flex items-center justify-center text-brand-500 hover:scale-110 transition-all">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.product_id)} className="text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest transition-colors">Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="glass-dark border-t border-white/10 p-8 space-y-6">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-brand-500/5 border border-brand-500/10 mb-2">
              <ShieldCheck className="w-5 h-5 text-brand-500" />
              <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Secure Checkout Guaranteed</p>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-3xl font-black text-white italic">₹{total().toFixed(2)}</p>
              </div>
              <button onClick={clearCart} className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-2 mb-1">
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {user ? (
                <Link href="/checkout" onClick={closeCart} className="btn-premium py-4 text-sm text-center flex items-center justify-center gap-3">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link href="/auth/login" onClick={closeCart} className="btn-premium py-4 text-sm text-center">
                  Login to Checkout
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
