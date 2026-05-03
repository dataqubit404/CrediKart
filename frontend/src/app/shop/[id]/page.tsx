'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/shop/ProductCard';
import api from '@/lib/api';

const CATS = ['All', 'Dairy', 'Bakery', 'Staples', 'Oils', 'Instant Food', 'Beverages', 'Cleaning', 'Snacks'];

export default function ShopPage() {
  const { id } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/shops/${id}`).then(r => {
      setShop(r.data);
      setProducts((r.data.products || []).map((p: any) => ({ ...p, shop: { id: r.data.id, name: r.data.name } })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const filtered = category === 'All' ? products : products.filter(p => p.category === category);
  const BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="skeleton h-48 rounded-2xl mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-60 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-96 text-gray-400">Shop not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Shop banner */}
      <div className="relative h-52 bg-white overflow-hidden">
        {shop.image_url
          ? <img src={`${BASE}${shop.image_url}`} alt={shop.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-8xl">🏪</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold text-3xl text-white">{shop.name}</h1>
            {shop.is_featured && <span className="bg-brand-500 text-black text-xs font-bold px-2 py-1 rounded-full">⭐ Featured</span>}
          </div>
          <p className="text-gray-300 text-sm mt-1">📍 {shop.address}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-400">
            <span>⭐ {Number(shop.rating).toFixed(1)}</span>
            <span>• {shop.total_orders || 0} orders</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CATS.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${category === c ? 'bg-brand-500 text-black' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'}`}>
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">📦</div>
            <p>No products in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
