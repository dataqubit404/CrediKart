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
      <div className="fixed inset-0 bg-black/60 z-40" onClick={closeCart} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">Your Cart</h2>
          <button onClick={closeCart} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-xl">✕</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="text-6xl">🛒</div>
              <p className="text-gray-400 dark:text-gray-500">Your cart is empty</p>
              <button onClick={closeCart} className="btn-primary text-sm">Start Shopping</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product_id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-2xl shrink-0 border border-gray-100 dark:border-gray-600">
                  {item.image_url ? (
                    <img src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace('/api', '')}${item.image_url}`} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                  ) : '🛍️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.unit}</p>
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-500">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.product_id, item.qty - 1)} className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white flex items-center justify-center font-bold transition-colors">−</button>
                  <span className="text-gray-900 dark:text-white font-semibold w-5 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.product_id, item.qty + 1)} className="w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-600 text-black flex items-center justify-center font-bold transition-colors">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-5 space-y-4">
            {items[0]?.shop_name && (
              <p className="text-xs text-gray-500 dark:text-gray-400">From: <span className="text-gray-900 dark:text-white font-medium">{items[0].shop_name}</span></p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">₹{total()}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={clearCart} className="btn-secondary flex-1 text-sm">Clear</button>
              {user ? (
                <Link href="/checkout" onClick={closeCart} className="btn-primary flex-1 text-sm text-center">
                  Checkout →
                </Link>
              ) : (
                <Link href="/auth/login" onClick={closeCart} className="btn-primary flex-1 text-sm text-center">
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
