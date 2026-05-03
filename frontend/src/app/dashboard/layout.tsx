'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'CUSTOMER') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'CUSTOMER') return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      {children}
    </div>
  );
}
