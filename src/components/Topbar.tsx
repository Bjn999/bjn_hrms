'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

import { useLanguage } from '@/contexts/LanguageContext';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

export default function Topbar() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [adminUser, setAdminUser] = useState<{name: string, role?: string, image?: string} | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          setAdminUser(JSON.parse(userStr));
        } catch (e) {
          console.error(e);
        }
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserJobOrRole = () => {
    if (!adminUser) return t('general_manager');
    
    // 1. Prioritize employee job title from backend if available
    if ((adminUser as any).employee?.job?.name) {
       return (adminUser as any).employee.job.name;
    }
    
    // 2. Format role nicely
    if (adminUser.role === 'company_admin') {
       return language === 'ar' ? 'مدير الشركة' : 'Company Admin';
    }
    if (adminUser.role === 'employee') {
       return language === 'ar' ? 'موظف' : 'Employee';
    }
    if (adminUser.role === 'super_admin') {
       return language === 'ar' ? 'مدير النظام' : 'Super Admin';
    }
    
    return adminUser.role || t('general_manager');
  };

  const handleLogout = async () => {
    // ... logout code ...
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/logout`, {
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
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
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

        {/* Notifications Dropdown */}
        <NotificationDropdown theme="light" />

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-gray-700">{adminUser?.name || t('system_admin')}</span>
              <span className="text-xs text-gray-500">{getUserJobOrRole()}</span>
            </div>
            {adminUser?.image ? (
              <img src={adminUser.image} alt={adminUser.name} className="w-10 h-10 rounded-xl shadow-sm object-cover border border-gray-100" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-50 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                {(adminUser?.name || t('system_admin')).charAt(0)}
              </div>
            )}
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <Link 
                href="/portal/settings?tab=account" 
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="font-medium">{language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}</span>
              </Link>
              <div className="h-px bg-gray-100 my-1"></div>
              <button 
                onClick={() => {
                  setIsProfileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="font-medium">{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
