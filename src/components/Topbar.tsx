'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useLanguage } from '@/contexts/LanguageContext';

export default function Topbar() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [adminName, setAdminName] = useState(t('system_admin'));

  useEffect(() => {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.name) setAdminName(user.name);
    }
  }, [t]);

  const handleLogout = async () => {
    // ... logout code ...
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
    
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-lg border-b border-gray-100 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 hidden md:block">{t('dashboard')}</h2>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        {/* Language Switcher */}
        <button 
          onClick={toggleLanguage}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
          {language === 'ar' ? 'English' : 'عربي'}
        </button>

        {/* Notifications Icon (Mock) */}
        <button className="relative p-2 text-gray-400 hover:text-indigo-500 transition-colors rounded-full hover:bg-indigo-50 hidden sm:block">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-gray-700">{adminName}</span>
            <span className="text-xs text-gray-500">{t('general_manager')}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-50 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
            {adminName.charAt(0)}
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-white transition-all bg-red-50 hover:bg-red-500 px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="font-medium hidden sm:inline">{t('logout')}</span>
        </button>
      </div>
    </header>
  );
}
