'use client';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total, clearCart } = useCartStore();
  const { user } = useAuthStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#0B0C10]/80 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-luxe-900/90 backdrop-blur-2xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-luxe-800/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">🛒</span>
            <h2 className="font-display font-black text-2xl text-white tracking-tight">Your Cart</h2>
          </div>
          <button onClick={closeCart} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5">✕</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5">
              <div className="text-7xl opacity-20 drop-shadow-xl grayscale">🛍️</div>
              <div>
                <p className="text-white font-black text-xl mb-2">Your cart is empty</p>
                <p className="text-gray-500 font-medium text-sm">Add some premium items to get started.</p>
              </div>
              <button onClick={closeCart} className="btn-primary mt-4 tracking-widest text-xs">Start Shopping</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product_id} className="flex items-center gap-4 bg-luxe-800/80 backdrop-blur-md border border-white/5 rounded-2xl p-3.5 hover:border-brand-500/30 hover:bg-luxe-700/80 transition-colors group">
                <div className="w-16 h-16 rounded-xl bg-luxe-900 flex items-center justify-center text-3xl shrink-0 border border-white/5 overflow-hidden">
                  {item.image_url ? (
                    <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace('/api', '')}${item.image_url}`} alt={item.name} className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                  ) : '🛍️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors truncate mb-1">{item.name}</p>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase bg-white/5 inline-block px-1.5 py-0.5 rounded mb-2">{item.unit}</p>
                  <p className="text-base font-black text-white tracking-tighter">₹{item.price}</p>
                </div>
                <div className="flex flex-col items-center gap-2 bg-luxe-900 rounded-xl p-1 border border-white/5">
                  <button onClick={() => updateQty(item.product_id, item.qty + 1)} className="w-7 h-7 rounded-lg bg-brand-500/10 hover:bg-brand-500/30 text-brand-400 flex items-center justify-center font-black transition-colors">+</button>
                  <span className="text-white font-black w-5 text-center text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.product_id, item.qty - 1)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 flex items-center justify-center font-black transition-colors">−</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/5 bg-luxe-800/80 backdrop-blur-xl p-6 space-y-5 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] z-10 relative">
            {items[0]?.shop_name && (
              <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                <span className="text-xl drop-shadow-md">🏪</span>
                <div>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Delivering from</p>
                  <p className="text-xs text-white font-bold">{items[0].shop_name}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">Delivery Fee</span>
                <span className="text-green-400 font-bold tracking-widest uppercase text-xs">Free</span>
              </div>
              <div className="w-full h-px bg-white/5"></div>
              <div className="flex justify-between items-end">
                <span className="text-gray-300 font-bold tracking-wide uppercase text-xs">Total Amount</span>
                <span className="text-3xl font-black text-brand-400 tracking-tighter drop-shadow-[0_0_10px_rgba(247,211,0,0.3)]">₹{total()}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={clearCart} className="btn-secondary w-1/3 text-xs tracking-widest uppercase font-black">Clear</button>
              {user ? (
                <Link href="/checkout" onClick={closeCart} className="btn-primary flex-1 text-sm text-center flex items-center justify-center gap-2 font-black tracking-widest uppercase shadow-[0_0_20px_rgba(247,211,0,0.2)]">
                  Checkout <span className="text-lg">→</span>
                </Link>
              ) : (
                <Link href="/auth/login" onClick={closeCart} className="btn-primary flex-1 text-sm text-center flex items-center justify-center font-black tracking-widest uppercase">
                  Login to Buy
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
