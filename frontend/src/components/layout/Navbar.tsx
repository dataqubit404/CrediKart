'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import CartDrawer from '@/components/cart/CartDrawer';
import { Search, ShoppingBag, User as UserIcon, LogOut, LayoutGrid, Zap, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { itemCount, openCart } = useCartStore();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Check dark mode
    if (document.documentElement.classList.contains('dark')) setIsDark(true);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const dashboardLink =
    user?.role === 'ADMIN' ? '/admin' :
    user?.role === 'SHOPKEEPER' ? '/shopkeeper' :
    user?.role === 'DELIVERY' ? '/delivery' :
    '/dashboard';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 pt-4`}>
        <div className={`max-w-7xl mx-auto rounded-[2.5rem] transition-all duration-500 ${isScrolled ? 'glass-dark py-3 px-6' : 'bg-transparent py-5 px-4'}`}>
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-black text-lg shadow-neon-blue rotate-3 hover:rotate-0 transition-transform">
                CK
              </div>
              <span className={`font-display font-black text-2xl tracking-tighter hidden md:block ${isScrolled || isDark ? 'text-white' : 'text-midnight'}`}>
                Credi<span className="text-brand-500">Kart</span>
              </span>
            </Link>

            {/* Search Bar (Elite) */}
            <div className="flex-1 max-w-2xl hidden sm:block">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="text"
                  placeholder='Search for products, shops or categories...'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && search) window.location.href = `/?q=${search}`; }}
                  className="w-full glass bg-white/5 dark:bg-white/5 border-white/10 dark:border-white/10 rounded-2xl pl-14 pr-6 py-3.5 text-sm font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/50 outline-none transition-all placeholder:text-gray-400 text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0 ml-auto">
              {/* Theme Toggle */}
              <button 
                onClick={toggleDarkMode}
                className="w-11 h-11 rounded-2xl glass hover:bg-white/10 flex items-center justify-center text-white transition-all"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Flash Deals */}
              <Link href="/flash-deals" className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-500/10 text-brand-500 font-bold text-sm border border-brand-500/20 hover:bg-brand-500 hover:text-white transition-all">
                <Zap className="w-4 h-4 fill-current" />
                <span>Flash</span>
              </Link>

              {/* User / Auth */}
              {mounted && user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-11 h-11 rounded-2xl glass border-brand-500/20 flex items-center justify-center overflow-hidden hover:scale-105 transition-all"
                  >
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-brand-500" />}
                  </button>
                  
                  {menuOpen && (
                    <div className="absolute right-0 mt-4 w-64 glass-dark rounded-[2rem] p-3 shadow-2xl animate-fade-in">
                      <div className="px-5 py-4 border-b border-white/5">
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest mt-0.5">{user.role}</p>
                      </div>
                      <div className="py-2">
                        <Link href={dashboardLink} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-all">
                          <LayoutGrid className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : mounted ? (
                <Link href="/auth/login" className="btn-premium py-2.5 px-6">Login</Link>
              ) : (
                <div className="w-24 h-11 skeleton-premium rounded-2xl" />
              )}

              {/* Cart */}
              <button
                onClick={() => openCart()}
                className="relative group btn-premium py-2.5 px-5 flex items-center gap-3"
              >
                <div className="flex flex-col items-start">
                  <span className="text-[9px] opacity-70 uppercase font-black tracking-wider">Cart</span>
                  <span className="text-sm font-bold">{mounted ? itemCount() : 0} Items</span>
                </div>
                <div className="w-px h-6 bg-white/20"></div>
                <ShoppingBag className="w-5 h-5" />
                {mounted && itemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-luxury-rose rounded-full text-[10px] flex items-center justify-center font-bold animate-bounce border-2 border-midnight">
                    {itemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="h-28"></div> {/* Spacer for fixed nav */}
      <CartDrawer />
    </>
  );
}
