'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  
  const [adminUser, setAdminUser] = useState<{name: string, role?: string, image?: string} | null>(null);

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
  }, []);

  const getUserJobOrRole = () => {
    if (!adminUser) return t('online');
    
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
    
    return adminUser.role || t('online');
  };

  const [manualMenus, setManualMenus] = useState<Record<string, boolean>>({});
  const [prevPathname, setPrevPathname] = useState(pathname);
  
  // Example helper for permissions. In real app, you should check adminUser?.permissions
  const hasPermission = (permission: string) => {
    if (!adminUser) return false;
    const permissions = (adminUser as any).permissions || [];
    return permissions.includes(permission);
  };

  // Reset manual overrides when path changes, so default path auto-expand takes over
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setManualMenus({});
  }

  const matchesSection = (section: string) => {
    if (section === 'fingerprint') {
      return !!(pathname?.includes('/portal/attendance'));
    }
    if (section === 'employees') {
      return !!(pathname?.includes('/portal/employees') ||
        pathname?.includes('/portal/reward-sal-types') ||
        pathname?.includes('/portal/discount-sal-types') ||
        pathname?.includes('/portal/allowance-sal-types'));
    }
    if (section === 'salaries') {
      return !!(pathname?.includes('/portal/sanctions') ||
        pathname?.includes('/portal/absences') ||
        pathname?.includes('/portal/discounts') ||
        pathname?.includes('/portal/loans') ||
        pathname?.includes('/portal/permanent-loans') ||
        pathname?.includes('/portal/additions') ||
        pathname?.includes('/portal/rewards') ||
        pathname?.includes('/portal/allowances') ||
        pathname?.includes('/portal/salary-records') ||
        pathname?.includes('/portal/employee-salaries'));
    }
    if (section === 'settings') {
      return !!(pathname?.includes('/portal/general-settings') ||
        pathname?.includes('/portal/finance-calendars') ||
        pathname?.includes('/portal/branches') ||
        pathname?.includes('/portal/shifts') ||
        pathname?.includes('/portal/departments') ||
        pathname?.includes('/portal/jobs-categories') ||
        pathname?.includes('/portal/qualifications') ||
        pathname?.includes('/portal/occasions') ||
        pathname?.includes('/portal/resignations') ||
        pathname?.includes('/portal/nationalities') ||
        pathname?.includes('/portal/religions') ||
        pathname?.includes('/portal/blood-groups') ||
        pathname?.includes('/portal/countries') ||
        pathname?.includes('/portal/governorates') ||
        pathname?.includes('/portal/languages') ||
        pathname?.includes('/portal/centers'));
    }
    return false;
  };

  const isMenuOpen = (menu: string) => {
    if (manualMenus[menu] !== undefined) {
      return manualMenus[menu];
    }
    return matchesSection(menu);
  };

  const toggleMenu = (menu: string) => {
    setManualMenus(prev => ({
      ...prev,
      [menu]: !isMenuOpen(menu)
    }));
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <div className="w-72 bg-slate-900 text-slate-300 min-h-screen flex flex-col shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-0 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>

      {/* Brand Logo */}
      <div className="h-20 flex items-center justify-center border-b border-slate-800/50 px-6 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{t('hrms')}</span>
        </div>
      </div>

      {/* Sidebar Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar z-10">

        {/* Dashboard Link */}
        <Link href="/portal" className={`group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 ${pathname === '/portal' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-slate-800/50 hover:text-white'}`}>
          <svg className={`w-5 h-5 ml-3 transition-colors ${pathname === '/portal' ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="font-medium mx-2">{t('dashboard')}</span>
        </Link>



        {/* Settings Menu */}
        {hasPermission('view_company_settings') && (
        <div className="pt-4">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('admin_settings')}</p>
          <button
            onClick={() => toggleMenu('settings')}
            className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${isMenuOpen('settings') ? 'bg-slate-800/50 text-white' : 'hover:bg-slate-800/30 hover:text-white'}`}
          >
            <div className="flex items-center">
              <svg className={`w-5 h-5 ml-3 transition-colors ${isMenuOpen('settings') ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="font-medium mx-2">{t('settings_list')}</span>
            </div>
            <div className={`w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center transition-transform duration-300 ${isMenuOpen('settings') ? 'transform -rotate-90 bg-indigo-500/20 text-indigo-400' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-500 ${isMenuOpen('settings') ? 'max-h-[1200px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-1 mx-4 ltr:border-l-2 ltr:pl-4 rtl:border-r-2 rtl:pr-4 border-slate-800/50 py-1">
              <Link href="/portal/general-settings" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/general-settings') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/general-settings') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('general_settings')}
              </Link>
              <Link href="/portal/finance-calendars" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/finance-calendars') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/finance-calendars') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('finance_calendars')}
              </Link>
              <Link href="/portal/branches" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/branches') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/branches') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('branches')}
              </Link>
              <Link href="/portal/shifts" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/shifts') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/shifts') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('shifts')}
              </Link>
              <Link href="/portal/departments" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/departments') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/departments') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('departments')}
              </Link>
              <Link href="/portal/jobs-categories" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/jobs-categories') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/jobs-categories') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('jobs_categories')}
              </Link>
              <Link href="/portal/qualifications" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/qualifications') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/qualifications') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('qualifications')}
              </Link>
              <Link href="/portal/occasions" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/occasions') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/occasions') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('occasions')}
              </Link>
              <Link href="/portal/resignations" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/resignations') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/resignations') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('resignations')}
              </Link>
              <Link href="/portal/nationalities" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/nationalities') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/nationalities') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('nationalities')}
              </Link>
              <Link href="/portal/religions" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/religions') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/religions') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('religions')}
              </Link>
              <Link href="/portal/blood-groups" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/blood-groups') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/blood-groups') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('blood_groups')}
              </Link>
              <Link href="/portal/countries" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/countries') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/countries') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('countries')}
              </Link>
              <Link href="/portal/governorates" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/governorates') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/governorates') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('governorates')}
              </Link>
              <Link href="/portal/centers" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/centers') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/centers') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('centers')}
              </Link>
              <Link href="/portal/languages" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/languages') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/languages') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('languages')}
              </Link>
            </div>
          </div>
        </div>
        )}

        {/* Employees Menu */}
        {hasPermission('view_employees') && (
        <div className="pt-2">
          <button
            onClick={() => toggleMenu('employees')}
            className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${isMenuOpen('employees') ? 'bg-slate-800/50 text-white' : 'hover:bg-slate-800/30 hover:text-white'}`}
          >
            <div className="flex items-center">
              <svg className={`w-5 h-5 ml-3 transition-colors ${isMenuOpen('employees') ? 'text-purple-400' : 'text-slate-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <span className="font-medium mx-2">{t('employees_menu')}</span>
            </div>
            <div className={`w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center transition-transform duration-300 ${isMenuOpen('employees') ? 'transform -rotate-90 bg-purple-500/20 text-purple-400' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-500 ${isMenuOpen('employees') ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-1 mx-4 ltr:border-l-2 ltr:pl-4 rtl:border-r-2 rtl:pr-4 border-slate-800/50 py-1">
              <Link href="/portal/employees" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/employees') ? 'text-white bg-purple-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/employees') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-600'}`}></div>
                {t('employees_list')}
              </Link>
              <Link href="/portal/reward-sal-types" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/reward-sal-types') ? 'text-white bg-purple-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/reward-sal-types') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-600'}`}></div>
                {t('rewards_types')}
              </Link>
              <Link href="/portal/discount-sal-types" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/discount-sal-types') ? 'text-white bg-purple-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/discount-sal-types') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-600'}`}></div>
                {t('discount_sal_types')}
              </Link>
              <Link href="/portal/allowance-sal-types" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/allowance-sal-types') ? 'text-white bg-purple-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/allowance-sal-types') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-600'}`}></div>
                {t('allowances_types')}
              </Link>
            </div>
          </div>
        </div>
        )}

        {/* Salaries & Payroll Menu */}
        {hasPermission('view_salaries') && (
        <div className="pt-2">
          <button
            onClick={() => toggleMenu('salaries')}
            className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${isMenuOpen('salaries') ? 'bg-slate-800/50 text-white' : 'hover:bg-slate-800/30 hover:text-white'}`}
          >
            <div className="flex items-center">
              <svg className={`w-5 h-5 ml-3 transition-colors ${isMenuOpen('salaries') ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="font-medium mx-2">{t('salaries_menu')}</span>
            </div>
            <div className={`w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center transition-transform duration-300 ${isMenuOpen('salaries') ? 'transform -rotate-90 bg-emerald-500/20 text-emerald-400' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-500 ${isMenuOpen('salaries') ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-1 mx-4 ltr:border-l-2 ltr:pl-4 rtl:border-r-2 rtl:pr-4 border-slate-800/50 py-1">
              <Link href="/portal/salary-records" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/salary-records') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/salary-records') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('salary_record')}
              </Link>
              <Link href="/portal/sanctions" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/sanctions') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/sanctions') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('sanctions_days')}
              </Link>
              <Link href="/portal/absences" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/absences') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/absences') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('absences_days')}
              </Link>

              <Link href="/portal/discounts" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/discounts') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/discounts') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('financial_discounts')}
              </Link>
              <Link href="/portal/loans" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/loans') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/loans') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('monthly_loans')}
              </Link>
              <Link href="/portal/permanent-loans" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/permanent-loans') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/permanent-loans') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('permanent_loans')}
              </Link>
              <Link href="/portal/additions" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/additions') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/additions') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('additional_days')}
              </Link>
              <Link href="/portal/rewards" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/rewards') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/rewards') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('financial_rewards')}
              </Link>
              <Link href="/portal/allowances" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/allowances') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/allowances') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('changable_allowances')}
              </Link>
              <Link href="/portal/employee-salaries" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/employee-salaries') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/employee-salaries') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('employee_salaries')}
              </Link>
            </div>
          </div>
        </div>
        )}

        {/* Fingerprint Menu */}
        {hasPermission('view_attendances') && (
        <div className="pt-2">
          <button
            onClick={() => toggleMenu('fingerprint')}
            className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${isMenuOpen('fingerprint') ? 'bg-slate-800/50 text-white' : 'hover:bg-slate-800/30 hover:text-white'}`}
          >
            <div className="flex items-center">
              <svg className={`w-5 h-5 ml-3 transition-colors ${isMenuOpen('fingerprint') ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
              <span className="font-medium mx-2">{t('fingerprint_menu')}</span>
            </div>
            <div className={`w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center transition-transform duration-300 ${isMenuOpen('fingerprint') ? 'transform -rotate-90 bg-indigo-500/20 text-indigo-400' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-500 ${isMenuOpen('fingerprint') ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-1 mx-4 ltr:border-l-2 ltr:pl-4 rtl:border-r-2 rtl:pr-4 border-slate-800/50 py-1">
              <Link href="/portal/attendance" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/attendance') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/attendance') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('employee_fingerprints')}
              </Link>
            </div>
          </div>
        </div>
        )}

        {/* Settings Link */}
        {hasPermission('view_settings') && (
        <Link href="/portal/settings" className={`group flex items-center px-4 py-3.5 mt-4 rounded-2xl transition-all duration-300 ${isActive('/portal/settings') ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-slate-800/50 hover:text-white'}`}>
          <svg className={`w-5 h-5 ml-3 transition-colors ${isActive('/portal/settings') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium mx-2">{language === 'ar' ? 'إعدادات الشركة' : 'Company Settings'}</span>
        </Link>
        )}
      </nav>

      {/* Footer Profile Area */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-md z-10 flex flex-col justify-end">
        <div className="flex items-center gap-3 px-2">
          {adminUser?.image ? (
            <img src={adminUser.image} alt={adminUser.name} className="w-9 h-9 rounded-full shadow-lg object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">
                {adminUser?.name ? adminUser.name.charAt(0) : 'U'}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white">{adminUser?.name || t('system_admin')}</p>
            <p className="text-xs text-slate-400">{getUserJobOrRole()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
