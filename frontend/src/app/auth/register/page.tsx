'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'CUSTOMER', label: 'Customer', icon: '🛒', desc: 'Shop & Pay later' },
  { value: 'SHOPKEEPER', label: 'Shopkeeper', icon: '🏪', desc: 'Sell products' },
  { value: 'DELIVERY', label: 'Partner', icon: '🚴', desc: 'Deliver & Earn' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'CUSTOMER' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Account created! Logging you in...');
      // Since we auto-verify, we can just redirect to login
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-black font-black text-xl shadow-xl shadow-brand-200 group-hover:scale-110 transition-transform">
              CK
            </div>
            <span className="font-display font-black text-3xl text-gray-900 tracking-tighter">CrediKart</span>
          </Link>
          <h1 className="font-display font-black text-3xl text-gray-900 mb-2">Join the revolution</h1>
          <p className="text-gray-500 font-medium">Grocery delivery in minutes, credit for a lifetime.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200 border border-gray-100">
          <div className="mb-10">
            <label className="label text-center mb-4 text-xs uppercase tracking-widest text-gray-400">Choose your role</label>
            <div className="grid grid-cols-3 gap-4">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => set('role', r.value)}
                  className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${
                    form.role === r.value
                      ? 'border-brand-500 bg-brand-50 shadow-lg shadow-brand-50'
                      : 'border-gray-100 bg-white hover:border-brand-200'
                  }`}
                >
                  <div className="text-3xl mb-2">{r.icon}</div>
                  <div className="text-[10px] font-black uppercase tracking-tighter text-gray-900">{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">Full Name</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="John Doe" required />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input" placeholder="9876543210" required />
              </div>
            </div>
            
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input" placeholder="john@example.com" required />
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} className="input" placeholder="Min 8 characters" required minLength={8} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl text-lg shadow-xl shadow-gray-200 transition-all active:scale-95 disabled:opacity-50">
              {loading ? 'Creating your account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <p className="text-gray-500 font-medium">
              Already a member?{' '}
              <Link href="/auth/login" className="text-brand-600 hover:text-brand-700 font-black decoration-brand-500/30 decoration-2 underline-offset-4 underline">Log in here</Link>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-10 text-xs text-gray-400 font-medium">
          By joining, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
