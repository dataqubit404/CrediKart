'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import DashboardSidebar from '@/components/layout/DashboardSidebar';

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
    <div className="min-h-screen bg-white dark:bg-midnight transition-colors duration-500">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 flex gap-10 py-8">
        <DashboardSidebar role="ADMIN" />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
