'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    }, 0);

    // Intercept all fetch calls to handle 401 Unauthenticated
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
      }
      return response;
    };

    return () => {
      clearTimeout(timer);
      window.fetch = originalFetch;
    };
  }, [router]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_token' && !e.newValue) {
        window.location.href = '/login';
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">{t('loading_dashboard')}</div>;
  }

  const isPrintPage = pathname?.includes('/print');

  if (isPrintPage) {
    return <div className="bg-white min-h-screen">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 relative">
          <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10 pointer-events-none"></div>
          {children}
        </main>
      </div>
    </div>
  );
}
