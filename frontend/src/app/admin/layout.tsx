'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="dark">
      <div className="min-h-screen bg-gray-950 text-white selection:bg-brand-500/30">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
