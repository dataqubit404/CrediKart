'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Dairy','Bakery','Staples','Oils','Instant Food','Beverages','Cleaning','Snacks','Fruits & Veg','Other'];

const empty = { 
    name: '', 
    description: '', 
    price: '', 
    mrp: '', 
    stock: '', 
    unit: '', 
    category: 'Staples', 
    is_active: true,
    expiry_date: '',
    is_flash_sale: false,
    flash_price: '',
    flash_ends_at: '',
    is_donation: false
};

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopId, setShopId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchProducts = () => {
    api.get('/shops/my').then(r => {
      setShopId(r.data.id);
      setProducts(r.data.products || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0]);

      if (editId) {
        await api.put(`/products/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product added');
      }
      setForm(empty); setEditId(null); setShowForm(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product removed');
    fetchProducts();
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const BASE = API_URL.replace('/api', '');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Products</h1>
          <button onClick={() => { setForm(empty); setEditId(null); setImagePreview(null); setShowForm(!showForm); }} className="btn-primary">
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">{editId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Product Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="e.g. Amul Milk 500ml" required />
              </div>
              <div>
                <label className="label">Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="input" placeholder="28" required min="0" step="0.01" />
              </div>
              <div>
                <label className="label">MRP (₹)</label>
                <input type="number" value={form.mrp} onChange={e => set('mrp', e.target.value)} className="input" placeholder="30" min="0" step="0.01" />
              </div>
              <div>
                <label className="label">Stock *</label>
                <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className="input" placeholder="100" required min="0" />
              </div>
              <div>
                <label className="label">Unit</label>
                <input value={form.unit} onChange={e => set('unit', e.target.value)} className="input" placeholder="500ml, 1kg, etc." />
              </div>
              <div>
                <label className="label">Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="input">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">📸</span>
                    )}
                  </div>
                  <input type="file" ref={fileRef} accept="image/*" className="input text-sm flex-1" onChange={handleImageChange} />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input" rows={2} placeholder="Brief description..." />
              </div>

              {/* Special Offers Section */}
              <div className="sm:col-span-2 border-t border-gray-100 pt-6 mt-2">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>⚡</span> Waste Control & Flash Sales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Expiry Date</label>
                    <input type="date" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} className="input" />
                  </div>
                  <div className="flex items-center gap-4 h-full pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.is_flash_sale} onChange={e => set('is_flash_sale', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                      <span className="text-sm font-medium text-gray-700">Enable Flash Sale</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.is_donation} onChange={e => set('is_donation', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                      <span className="text-sm font-medium text-gray-700">Mark for Donation (₹0)</span>
                    </label>
                  </div>
                  {form.is_flash_sale && (
                    <>
                      <div>
                        <label className="label">Flash Price (₹)</label>
                        <input type="number" value={form.flash_price} onChange={e => set('flash_price', e.target.value)} className="input border-brand-200 bg-brand-50/20" placeholder="Discounted price" />
                      </div>
                      <div>
                        <label className="label">Flash Ends At</label>
                        <input type="datetime-local" value={form.flash_ends_at} onChange={e => set('flash_ends_at', e.target.value)} className="input border-brand-200 bg-brand-50/20" />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editId ? 'Update' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📦</div>
            <p>No products yet. Add your first product!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(p => (
              <div key={p.id} className={`card p-3 ${!p.is_active ? 'opacity-50' : ''}`}>
                <div className="aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden">
                  {p.image_url
                    ? <img src={`${BASE}${p.image_url}`} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                  }
                </div>
                <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{p.name}</p>
                <p className="text-xs text-gray-500 mb-2">{p.unit} • Stock: {p.stock}</p>
                <p className="text-brand-600 font-bold text-sm mb-3">₹{p.price}</p>
                <div className="flex gap-2">
                  <button onClick={() => { 
                    setForm({ 
                      name: p.name, 
                      description: p.description || '', 
                      price: p.price, 
                      mrp: p.mrp || '', 
                      stock: p.stock, 
                      unit: p.unit || '', 
                      category: p.category || 'Staples', 
                      is_active: p.is_active,
                      expiry_date: p.expiry_date || '',
                      is_flash_sale: p.is_flash_sale || false,
                      flash_price: p.flash_price || '',
                      flash_ends_at: p.flash_ends_at ? new Date(p.flash_ends_at).toISOString().slice(0, 16) : '',
                      is_donation: p.is_donation || false
                    }); 
                    setEditId(p.id); 
                    setImagePreview(p.image_url ? `${BASE}${p.image_url}` : null);
                    setShowForm(true); 
                    window.scrollTo(0, 0); 
                  }}
                    className="flex-1 text-xs btn-secondary py-1.5">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="flex-1 text-xs btn-danger py-1.5">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
