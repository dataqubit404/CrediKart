'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back to CrediKart!');
      const user = useAuthStore.getState().user;
      if (user?.role === 'ADMIN') router.push('/admin');
      else if (user?.role === 'SHOPKEEPER') router.push('/shopkeeper');
      else if (user?.role === 'DELIVERY') router.push('/delivery');
      else router.push('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-black font-black text-xl shadow-xl shadow-brand-200 group-hover:scale-110 transition-transform">
              CK
            </div>
            <span className="font-display font-black text-3xl text-gray-900 tracking-tighter">CrediKart</span>
          </Link>
          <h1 className="font-display font-black text-3xl text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500 font-medium italic">"The fastest way to shop on credit"</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="john@example.com" required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <button type="button" className="text-xs font-bold text-brand-600 hover:underline">Forgot?</button>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl text-lg shadow-xl shadow-gray-200 transition-all active:scale-95 disabled:opacity-50">
              {loading ? 'Logging you in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <p className="text-gray-500 font-medium">
              New to CrediKart?{' '}
              <Link href="/auth/register" className="text-brand-600 hover:text-brand-700 font-black decoration-brand-500/30 decoration-2 underline-offset-4 underline">Create an account</Link>
            </p>
          </div>


        </div>
      </div>
    </div>
  );
}
