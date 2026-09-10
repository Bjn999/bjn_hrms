'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { language, setLanguage, t } = useLanguage();
  const [adminUser, setAdminUser] = useState<{ name: string; email?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (!token) {
      router.push('/login');
    } else if (userStr) {
      try {
          const user = JSON.parse(userStr);
          if (user.role !== 'super_admin') {
              router.push('/portal');
          } else {
              setAdminUser(user);
              setLoading(false);
          }
      } catch(e) {
          setLoading(false);
      }
    } else {
      setLoading(false);
    }
    // Intercept all fetch calls to handle 401 Unauthenticated
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-medium">{t('loading_dashboard')}</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 rtl:border-l rtl:border-r-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Super Admin</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            <li>
              <Link href="/super-admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/super-admin' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                <span className="font-medium">{language === 'ar' ? 'الرئيسية' : 'Dashboard'}</span>
              </Link>
            </li>
            <li>
              <Link href="/super-admin/companies" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.startsWith('/super-admin/companies') ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                <span className="font-medium">{language === 'ar' ? 'الشركات' : 'Companies'}</span>
              </Link>
            </li>

            <li>
              <Link href="/super-admin/plans" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.startsWith('/super-admin/plans') ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className="font-medium">{language === 'ar' ? 'الباقات' : 'Plans'}</span>
              </Link>
            </li>
            <li>
              <Link href="/super-admin/subscriptions" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.startsWith('/super-admin/subscriptions') ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                <span className="font-medium">{language === 'ar' ? 'الاشتراكات' : 'Subscriptions'}</span>
              </Link>
            </li>
            <li>
              <Link href="/super-admin/roles" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/super-admin/roles' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span className="font-medium">{language === 'ar' ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}</span>
              </Link>
            </li>

            <li>
              <Link href="/super-admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/super-admin/settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span className="font-medium">{language === 'ar' ? 'الإعدادات' : 'Settings'}</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-transparent -z-10 pointer-events-none"></div>

        {/* Top Header Bar */}
        <header className="h-16 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/80 px-6 lg:px-8 flex items-center justify-between z-10 sticky top-0 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              {language === 'ar' ? 'لوحة إدارة النظام المركزية' : 'SaaS Control Plane'}
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Notification Dropdown (Dark Theme) */}
            <NotificationDropdown theme="dark" />

            <div className="h-6 w-px bg-slate-700/80 hidden sm:block"></div>

            {/* Super Admin User Info */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md border border-blue-400/30">
                {(adminUser?.name || 'SA').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-right rtl:text-right ltr:text-left">
                <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                  {adminUser?.name || (language === 'ar' ? 'مدير النظام' : 'Super Admin')}
                </span>
                <span className="text-[10px] text-blue-400 font-medium">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
