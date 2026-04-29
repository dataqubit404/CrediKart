'use client';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  mrp?: number;
  unit?: string;
  category?: string;
  image_url?: string;
  stock: number;
  shop?: { id: number; name: string };
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items, updateQty } = useCartStore();
  const inCart = items.find(i => i.product_id === product.id);
  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const handleAdd = () => {
    if (!product.shop) { toast.error('Shop info missing'); return; }
    addItem({
      product_id: product.id,
      shop_id: product.shop.id,
      shop_name: product.shop.name,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      unit: product.unit,
      image_url: product.image_url,
    });
    toast.success(`${product.name} added to cart`);
  };

  const BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col gap-2 hover:border-brand-300 transition-all duration-200 group relative">
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm flex flex-col items-center leading-none">
          <span>{discount}%</span>
          <span className="text-[7px] uppercase">OFF</span>
        </div>
      )}

      {/* Image */}
      <div className="relative bg-gray-50 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
        {product.image_url ? (
          <img
            src={`${BASE}${product.image_url}`}
            alt={product.name}
            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="text-4xl opacity-20">🛍️</div>
        )}
        
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-gray-900 text-xs font-black uppercase tracking-tighter border-2 border-gray-900 px-2 py-1 rounded">Sold Out</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 mt-1">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase tracking-wide">
            {product.unit || 'Each'}
          </span>
        </div>
        <h3 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 h-10">
          {product.name}
        </h3>
      </div>

      {/* Price + Add Section */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-sm font-black text-gray-900">₹{product.price}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-[10px] text-gray-400 line-through">₹{product.mrp}</span>
          )}
        </div>

        {product.stock > 0 && (
          inCart ? (
            <div className="flex items-center bg-blinkit-green rounded-xl overflow-hidden shadow-md shadow-green-100">
              <button
                onClick={() => updateQty(product.id, inCart.qty - 1)}
                className="w-8 h-8 flex items-center justify-center text-white font-black hover:bg-black/10 transition-colors"
              >−</button>
              <span className="text-white font-black w-4 text-center text-xs">{inCart.qty}</span>
              <button
                onClick={() => updateQty(product.id, inCart.qty + 1)}
                className="w-8 h-8 flex items-center justify-center text-white font-black hover:bg-black/10 transition-colors"
              >+</button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-white hover:bg-brand-50 text-blinkit-green border border-blinkit-green font-black px-4 py-1.5 rounded-xl text-xs transition-all uppercase tracking-tighter hover:shadow-lg hover:shadow-brand-100"
            >
              Add
            </button>
          )
        )}
      </div>
    </div>
  );
}
