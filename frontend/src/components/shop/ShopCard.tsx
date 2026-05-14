import Link from 'next/link';
import { Star, MapPin, Store, ShieldCheck, ArrowRight } from 'lucide-react';

interface Shop {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  address: string;
  rating: number;
  is_featured: boolean;
  total_orders: number;
}

export default function ShopCard({ shop }: { shop: Shop }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const BASE = API_URL.replace('/api', '');

  return (
    <Link href={`/shop/${shop.id}`} className="group block">
      <div className="card-premium h-full p-0 overflow-hidden flex flex-col">
        {/* Banner Section */}
        <div className="relative h-48 overflow-hidden bg-midnight-lightest/20">
          {shop.image_url ? (
            <img 
              src={`${BASE}${shop.image_url}`} 
              alt={shop.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-500/5">
              <Store className="w-16 h-16 text-brand-500/10" />
            </div>
          )}
          
          {/* Glass Badges */}
          <div className="absolute top-4 left-4 z-10 glass dark:bg-midnight/80 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 border-white/10 shadow-xl">
            <Star className="w-3.5 h-3.5 text-luxury-gold fill-current" />
            <span className="text-xs font-black text-gray-900 dark:text-white">{Number(shop.rating || 4.5).toFixed(1)}</span>
          </div>

          {shop.is_featured && (
            <div className="absolute top-4 right-4 z-10 badge-tech bg-brand-500 text-white border-transparent shadow-neon-blue">
              Elite Partner
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Info Section */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Store</span>
          </div>
          
          <h3 className="font-display font-black text-gray-900 dark:text-white text-xl mb-2 group-hover:text-brand-500 transition-colors leading-tight">
            {shop.name}
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium line-clamp-2 mb-6 flex-1">
            {shop.description || 'Providing fresh essentials and more at your doorstep with lightning speed.'}
          </p>

          <div className="pt-5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px] uppercase tracking-wider">{shop.address.split(',')[0]}</span>
            </div>
            
            <div className="flex items-center gap-2 text-brand-500 group-hover:gap-3 transition-all duration-300">
              <span className="text-[10px] font-black uppercase tracking-widest">Visit</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
