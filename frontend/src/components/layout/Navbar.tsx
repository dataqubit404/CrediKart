'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import CartDrawer from '@/components/cart/CartDrawer';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { itemCount, openCart } = useCartStore();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const dashboardLink =
    user?.role === 'ADMIN' ? '/admin' :
    user?.role === 'SHOPKEEPER' ? '/shopkeeper' :
    user?.role === 'DELIVERY' ? '/delivery' :
    '/dashboard';

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-6">
          {/* Logo & Location */}
          <div className="flex items-center gap-6 shrink-0 border-r border-gray-100 pr-6 h-full">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-black font-black text-base shadow-sm">
                CK
              </div>
              <span className="font-display font-black text-gray-900 text-xl tracking-tight hidden lg:block">CrediKart</span>
            </Link>

          </div>

          {/* Search bar */}
          <div className="flex-1">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-600 transition-colors">🔍</span>
              <input
                type="text"
                placeholder='Search "milk", "eggs" or "bread"'
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && search) window.location.href = `/?q=${search}`; }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 shrink-0">
            {mounted && user ? (
              <div className="flex items-center gap-4">
                <Link href={dashboardLink} className="text-sm font-bold text-gray-600 hover:text-gray-900 hidden sm:block transition-colors">
                  My Account
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {user.name?.[0]?.toUpperCase()}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{user.role}</p>
                      </div>
                      <Link href={dashboardLink} onClick={() => setMenuOpen(false)} className="block px-5 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                        Dashboard
                      </Link>
                      <button onClick={logout} className="w-full text-left px-5 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : mounted ? (
              <Link href="/auth/login" className="text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors px-2">
                Login
              </Link>
            ) : (
              <div className="w-20 h-8 skeleton rounded-lg" />
            )}

            <button
              onClick={() => openCart()}
              className="bg-blinkit-green hover:bg-green-700 text-white font-bold px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 shadow-lg shadow-green-200"
            >
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] text-green-100 opacity-80 uppercase font-black">My Cart</span>
                <span className="text-sm">{mounted ? itemCount() : 0} Items</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <span className="text-lg">🛒</span>
            </button>
          </div>
        </div>
      </nav>
      <CartDrawer />
    </>
  );
}
