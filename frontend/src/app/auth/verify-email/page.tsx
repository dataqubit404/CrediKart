'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="card p-10 w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">⏳</span>
            </div>
            <h2 className="font-display font-bold text-xl text-white">Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-2">Email Verified!</h2>
            <p className="text-gray-400 mb-6">Your account is now active. You can sign in.</p>
            <Link href="/auth/login" className="btn-primary inline-block px-8">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="font-display font-bold text-xl text-white mb-2">Verification Failed</h2>
            <p className="text-gray-400 mb-6">The link is invalid or expired. Please register again.</p>
            <Link href="/auth/register" className="btn-primary inline-block px-8">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
