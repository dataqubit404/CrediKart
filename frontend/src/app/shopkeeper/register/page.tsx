'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function RegisterShopPage() {
  const [form, setForm] = useState({ name: '', description: '', address: '', lat: '', lng: '' });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [docName, setDocName] = useState<string | null>(null);
  const router = useRouter();

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.target as HTMLFormElement);
      await api.post('/shops', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Shop registered successfully! You are now live.');
      router.push('/shopkeeper');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to register shop');
    } finally {
      setLoading(false);
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

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setDocName(e.target.files[0].name);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center text-2xl shadow-lg shadow-brand-100">
            🏪
          </div>
          <div>
            <h1 className="font-display font-black text-3xl text-gray-900 tracking-tight">Open Your Digital Store</h1>
            <p className="text-gray-500 font-medium">Start selling to thousands of customers in minutes.</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="label">Shop Name</label>
                  <input name="name" value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="e.g. Mumbai Fresh Mart" required />
                </div>
                <div>
                  <label className="label">Full Address</label>
                  <textarea name="address" value={form.address} onChange={e => set('address', e.target.value)} className="input" rows={3} placeholder="Full street address, landmark, city" required />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="label">Shop Description</label>
                  <textarea name="description" value={form.description} onChange={e => set('description', e.target.value)} className="input" rows={3} placeholder="What do you sell? (e.g. Organic vegetables, snacks...)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Latitude</label>
                    <input name="lat" type="number" step="any" value={form.lat} onChange={e => set('lat', e.target.value)} className="input" placeholder="19.07" />
                  </div>
                  <div>
                    <label className="label">Longitude</label>
                    <input name="lng" type="number" step="any" value={form.lng} onChange={e => set('lng', e.target.value)} className="input" placeholder="72.87" />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="label">Store Front Image</label>
                <div className="relative group">
                  <input name="image" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
                  <div className={`border-2 border-dashed ${imagePreview ? 'border-brand-500 bg-brand-50/10' : 'border-gray-200'} rounded-2xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-brand-500 group-hover:bg-brand-50 transition-all overflow-hidden relative min-h-[160px]`}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                    ) : (
                      <span className="text-3xl">📸</span>
                    )}
                    <span className={`text-sm font-bold ${imagePreview ? 'text-brand-700 z-10' : 'text-gray-400'} group-hover:text-brand-600`}>
                      {imagePreview ? 'Change Store Image' : 'Click to upload image'}
                    </span>
                    {imagePreview && <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 bg-white/80 px-2 py-0.5 rounded z-10">Preview Ready</span>}
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Business Verification Document</label>
                <div className="relative group">
                  <input name="verification_doc" type="file" accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required onChange={handleDocChange} />
                  <div className={`border-2 border-dashed ${docName ? 'border-brand-500 bg-brand-50/10' : 'border-gray-200'} rounded-2xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-brand-500 group-hover:bg-brand-50 transition-all`}>
                    <span className="text-3xl">{docName ? '✅' : '📄'}</span>
                    <span className={`text-sm font-bold ${docName ? 'text-brand-700' : 'text-gray-400'} group-hover:text-brand-600 text-center px-4 line-clamp-1`}>
                      {docName || 'GST or Trade License'}
                    </span>
                    {docName && <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-100 px-2 py-0.5 rounded">Ready to verify</span>}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blinkit-green hover:bg-green-700 text-white font-black py-5 rounded-2xl text-lg shadow-xl shadow-green-100 transition-all active:scale-[0.98] disabled:opacity-50">
              {loading ? 'Processing Registration...' : 'Launch My Store 🚀'}
            </button>
          </form>
        </div>

        <div className="mt-10 flex items-center justify-center gap-8 opacity-50 grayscale">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest"><span className="text-xl">🛡️</span> Secure Verification</div>
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest"><span className="text-xl">⚡</span> Instant Approval</div>
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest"><span className="text-xl">💰</span> Zero Setup Fee</div>
        </div>
      </div>
    </div>
  );
}
