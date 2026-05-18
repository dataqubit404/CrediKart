import Link from 'next/link';

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
    <Link href={`/shop/${shop.id}`}>
      <div className="bg-luxe-800/80 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden group cursor-pointer hover:border-brand-500/50 hover:bg-luxe-700/80 hover:shadow-[0_10px_40px_rgba(247,211,0,0.15)] transition-all duration-500 flex flex-col relative">
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-brand-500/0 blur-[80px] rounded-full group-hover:bg-brand-500/10 transition-all duration-700 pointer-events-none z-0"></div>

        <div className="relative h-48 bg-luxe-900 flex items-center justify-center overflow-hidden border-b border-white/5 z-10">
          {shop.image_url ? (
            <img src={`${BASE}${shop.image_url}`} alt={shop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
          ) : (
            <div className="text-6xl opacity-20 drop-shadow-md">🏪</div>
          )}
          
          <div className="absolute top-4 left-4 bg-luxe-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white/10">
            <span className="text-brand-500 text-sm drop-shadow-[0_0_5px_rgba(247,211,0,0.5)]">⭐</span>
            <span className="text-xs font-black text-white">{Number(shop.rating || 4.5).toFixed(1)}</span>
          </div>

          {shop.is_featured && (
            <div className="absolute top-4 right-4 bg-brand-500/20 backdrop-blur-md border border-brand-500/30 text-brand-300 text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(247,211,0,0.2)]">
              Featured
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#0B0C10] to-transparent pointer-events-none"></div>
        </div>

        <div className="p-6 flex-1 flex flex-col z-10">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-brand-400 uppercase tracking-widest">
            <span>Store</span>
            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
            <span>Local Hero</span>
          </div>
          
          <h3 className="font-display font-black text-white text-xl mb-3 leading-tight group-hover:text-brand-300 transition-colors">
            {shop.name}
          </h3>
          
          <p className="text-gray-400 text-xs font-medium line-clamp-2 mb-5 flex-1 leading-relaxed">
            {shop.description || 'Providing premium fresh essentials and more at your doorstep.'}
          </p>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span className="text-brand-500/80">📍</span>
              <span className="truncate max-w-[120px]">{shop.address.split(',')[0]}</span>
            </div>
            <div className="bg-white/5 border border-white/10 text-gray-300 text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest">
              {shop.total_orders > 100 ? '100+ Orders' : 'New Store'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
