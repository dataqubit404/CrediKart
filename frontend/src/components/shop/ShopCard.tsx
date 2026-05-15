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
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] overflow-hidden group cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-xl hover:shadow-brand-50 transition-all duration-300 flex flex-col">
        <div className="relative h-44 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
          {shop.image_url ? (
            <img src={`${BASE}${shop.image_url}`} alt={shop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="text-6xl opacity-20">🏪</div>
          )}
          
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <span className="text-yellow-500 text-sm">⭐</span>
            <span className="text-xs font-black text-gray-900 dark:text-white">{Number(shop.rating || 4.5).toFixed(1)}</span>
          </div>

          {shop.is_featured && (
            <div className="absolute top-4 right-4 bg-brand-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-brand-200">
              Featured
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-1 text-[10px] font-black text-brand-600 uppercase tracking-widest">
            <span>Store</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>Local Hero</span>
          </div>
          
          <h3 className="font-display font-black text-gray-900 dark:text-white text-lg mb-2 leading-tight group-hover:text-brand-600 transition-colors">
            {shop.name}
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium line-clamp-2 mb-4 flex-1">
            {shop.description || 'Providing fresh essentials and more at your doorstep.'}
          </p>

          <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
              <span>📍</span>
              <span className="truncate max-w-[120px]">{shop.address.split(',')[0]}</span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">
              {shop.total_orders > 100 ? '100+ Orders' : 'New Store'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
