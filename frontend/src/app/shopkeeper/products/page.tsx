'use client';
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Dairy','Bakery','Staples','Oils','Instant Food','Beverages','Cleaning','Snacks','Fruits & Veg','Other'];

const empty = { name: '', description: '', price: '', mrp: '', stock: '', unit: '', category: 'Staples', is_active: true };

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopId, setShopId] = useState<number | null>(null);
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

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product removed');
    fetchProducts();
  };

  const BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-2xl text-white">Products</h1>
          <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }} className="btn-primary">
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-white mb-4">{editId ? 'Edit Product' : 'Add New Product'}</h2>
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
                <input type="file" ref={fileRef} accept="image/*" className="input text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input" rows={2} placeholder="Brief description..." />
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
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">📦</div>
            <p>No products yet. Add your first product!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(p => (
              <div key={p.id} className={`card p-3 ${!p.is_active ? 'opacity-50' : ''}`}>
                <div className="aspect-square bg-gray-800 rounded-xl mb-3 overflow-hidden">
                  {p.image_url
                    ? <img src={`${BASE}${p.image_url}`} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                  }
                </div>
                <p className="text-sm font-medium text-white line-clamp-2 mb-1">{p.name}</p>
                <p className="text-xs text-gray-400 mb-2">{p.unit} • Stock: {p.stock}</p>
                <p className="text-brand-500 font-bold text-sm mb-3">₹{p.price}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setForm({ name: p.name, description: p.description || '', price: p.price, mrp: p.mrp || '', stock: p.stock, unit: p.unit || '', category: p.category || 'Staples', is_active: p.is_active }); setEditId(p.id); setShowForm(true); window.scrollTo(0, 0); }}
                    className="flex-1 text-xs btn-secondary py-1.5">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="flex-1 text-xs btn-danger py-1.5">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
