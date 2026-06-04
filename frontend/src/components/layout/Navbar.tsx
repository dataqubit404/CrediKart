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
      <nav className="sticky top-0 z-50 bg-[#0B0C10]/80 backdrop-blur-xl border-b border-white/5 shadow-glass-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-6">
          {/* Logo & Location */}
          <div className="flex items-center gap-6 shrink-0 border-r border-white/10 pr-6 h-full">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-[#0B0C10] font-black text-lg shadow-[0_0_15px_rgba(247,211,0,0.3)] group-hover:shadow-[0_0_25px_rgba(247,211,0,0.5)] transition-all duration-300 transform group-hover:scale-105">
                CK
              </div>
              <span className="font-display font-black text-2xl tracking-tight hidden lg:block transition-colors text-gradient-luxe">CrediKart</span>
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex-1">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-500 transition-colors">🔍</span>
              <input
                type="text"
                placeholder='Search "milk", "eggs" or "bread"'
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && search) window.location.href = `/?q=${search}`; }}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/10 transition-all duration-300"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 shrink-0">
            {mounted && (
              <div className="flex items-center gap-3">
                <Link href="/dashboard/rewards" className="text-sm font-bold text-white hover:text-brand-300 transition-colors flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-400 rounded-xl shadow-[0_0_15px_rgba(247,211,0,0.4)] hover:shadow-[0_0_25px_rgba(247,211,0,0.6)] hover:scale-105 active:scale-95 animate-pulse-glow border border-white/20">
                  <span className="text-lg">🎡</span> Spin & Win
                </Link>
                <Link href="/flash-deals" className="text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1.5 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-xl shadow-[0_0_10px_rgba(247,211,0,0.1)] hover:shadow-[0_0_15px_rgba(247,211,0,0.2)] hidden md:flex">
                  <span>⚡</span> Flash Deals
                </Link>
              </div>
            )}
            {mounted && user ? (
              <div className="flex items-center gap-4">
                <Link href={dashboardLink} className="text-sm font-bold text-gray-400 hover:text-white hidden sm:block transition-colors tracking-wide">
                  My Account
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 rounded-full bg-luxe-800 border border-white/10 flex items-center justify-center text-sm font-bold text-white hover:bg-luxe-700 hover:border-white/20 transition-all duration-300 shadow-glass-sm"
                  >
                    {user.name?.[0]?.toUpperCase()}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-luxe-glass backdrop-blur-2xl border border-white/10 rounded-2xl shadow-glass z-50 overflow-hidden animate-fade-in">
                      <div className="px-5 py-4 bg-luxe-800/50 border-b border-white/5">
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-0.5">{user.role}</p>
                      </div>
                      <Link href={dashboardLink} onClick={() => setMenuOpen(false)} className="block px-5 py-3.5 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                        Dashboard
                      </Link>
                      <button onClick={logout} className="w-full text-left px-5 py-3.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : mounted ? (
              <Link href="/auth/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors px-2 tracking-wide">
                Login
              </Link>
            ) : (
              <div className="w-20 h-8 skeleton rounded-lg" />
            )}

            <button
              onClick={() => openCart()}
              className="btn-blinkit text-sm flex items-center gap-3 px-5 py-2.5 ml-2"
            >
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] text-green-100 opacity-90 uppercase font-black tracking-wider">My Cart</span>
                <span className="text-sm font-bold">{mounted ? itemCount() : 0} Items</span>
              </div>
              <div className="w-px h-6 bg-white/30"></div>
              <span className="text-xl">🛒</span>
            </button>
          </div>
        </div>
      </nav>
      <CartDrawer />
    </>
  );
}
