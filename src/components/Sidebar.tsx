'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  // State for manual opening/closing overrides
  const [manualMenus, setManualMenus] = useState<Record<string, boolean>>({});
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Reset manual overrides when path changes, so default path auto-expand takes over
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setManualMenus({});
  }

  const matchesSection = (section: string) => {
    if (section === 'employees') {
      return !!(pathname?.includes('/admin/employees') || 
                pathname?.includes('/admin/reward-sal-types') || 
                pathname?.includes('/admin/discount-sal-types') || 
                pathname?.includes('/admin/allowance-sal-types'));
    }
    if (section === 'salaries') {
      return !!(pathname?.includes('/admin/sanctions') ||
                pathname?.includes('/admin/absences') ||
                pathname?.includes('/admin/discounts') ||
                pathname?.includes('/admin/loans') ||
                pathname?.includes('/admin/permanent-loans') ||
                pathname?.includes('/admin/additions') ||
                pathname?.includes('/admin/rewards') ||
                pathname?.includes('/admin/allowances') ||
                pathname?.includes('/admin/salary-records') ||
                pathname?.includes('/admin/employee-salaries'));
    }
    if (section === 'settings') {
      return !!(pathname?.includes('/admin/general-settings') || 
                pathname?.includes('/admin/finance-calendars') || 
                pathname?.includes('/admin/branches') || 
                pathname?.includes('/admin/shifts') || 
                pathname?.includes('/admin/departments') || 
                pathname?.includes('/admin/jobs-categories') || 
                pathname?.includes('/admin/qualifications') || 
                pathname?.includes('/admin/occasions') || 
                pathname?.includes('/admin/resignations') || 
                pathname?.includes('/admin/nationalities') || 
                pathname?.includes('/admin/religions') || 
                pathname?.includes('/admin/blood-groups') || 
                pathname?.includes('/admin/countries') || 
                pathname?.includes('/admin/governorates') || 
                pathname?.includes('/admin/languages') || 
                pathname?.includes('/admin/centers'));
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
        <Link href="/admin" className={`group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 ${pathname === '/admin' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-slate-800/50 hover:text-white'}`}>
          <svg className={`w-5 h-5 ml-3 transition-colors ${pathname === '/admin' ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="font-medium mx-2">{t('dashboard')}</span>
        </Link>

        {/* Settings Menu */}
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
              <Link href="/admin/general-settings" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/general-settings') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/general-settings') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('general_settings')}
              </Link>
              <Link href="/admin/finance-calendars" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/finance-calendars') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/finance-calendars') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('finance_calendars')}
              </Link>
              <Link href="/admin/branches" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/branches') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/branches') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('branches')}
              </Link>
              <Link href="/admin/shifts" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/shifts') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/shifts') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('shifts')}
              </Link>
              <Link href="/admin/departments" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/departments') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/departments') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('departments')}
              </Link>
              <Link href="/admin/jobs-categories" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/jobs-categories') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/jobs-categories') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('jobs_categories')}
              </Link>
              <Link href="/admin/qualifications" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/qualifications') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/qualifications') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('qualifications')}
              </Link>
              <Link href="/admin/occasions" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/occasions') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/occasions') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('occasions')}
              </Link>
              <Link href="/admin/resignations" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/resignations') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/resignations') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('resignations')}
              </Link>
              <Link href="/admin/nationalities" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/nationalities') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/nationalities') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('nationalities')}
              </Link>
              <Link href="/admin/religions" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/religions') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/religions') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('religions')}
              </Link>
              <Link href="/admin/blood-groups" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/blood-groups') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/blood-groups') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('blood_groups')}
              </Link>
              <Link href="/admin/countries" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/countries') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/countries') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('countries')}
              </Link>
              <Link href="/admin/governorates" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/governorates') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/governorates') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('governorates')}
              </Link>
              <Link href="/admin/centers" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/centers') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/centers') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('centers')}
              </Link>
              <Link href="/admin/languages" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/languages') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/languages') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                {t('languages')}
              </Link>
            </div>
          </div>
        </div>

        {/* Employees Menu */}
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
              <Link href="/admin/employees" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/employees') ? 'text-white bg-purple-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/employees') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-600'}`}></div>
                {t('employees_list')}
              </Link>
              <Link href="/admin/reward-sal-types" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/reward-sal-types') ? 'text-white bg-purple-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/reward-sal-types') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-600'}`}></div>
                {t('rewards_types')}
              </Link>
              <Link href="/admin/discount-sal-types" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/discount-sal-types') ? 'text-white bg-purple-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/discount-sal-types') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-600'}`}></div>
                {t('discount_sal_types')}
              </Link>
              <Link href="/admin/allowance-sal-types" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/allowance-sal-types') ? 'text-white bg-purple-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/allowance-sal-types') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-600'}`}></div>
                {t('allowances_types')}
              </Link>
            </div>
          </div>
        </div>

        {/* Salaries & Payroll Menu */}
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
              <Link href="/admin/salary-records" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/salary-records') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/salary-records') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('salary_record')}
              </Link>
              <Link href="/admin/sanctions" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/sanctions') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/sanctions') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('sanctions_days')}
              </Link>
              <Link href="/admin/absences" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/absences') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/absences') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('absences_days')}
              </Link>

              <Link href="/admin/discounts" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/discounts') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/discounts') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('financial_discounts')}
              </Link>
              <Link href="/admin/loans" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/loans') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/loans') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('monthly_loans')}
              </Link>
              <Link href="/admin/permanent-loans" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/permanent-loans') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/permanent-loans') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('permanent_loans')}
              </Link>
              <Link href="/admin/additions" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/additions') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/additions') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('additional_days')}
              </Link>
              <Link href="/admin/rewards" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/rewards') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/rewards') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('financial_rewards')}
              </Link>
              <Link href="/admin/allowances" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/allowances') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/allowances') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('variable_allowances')}
              </Link>
              <Link href="/admin/employee-salaries" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/admin/employee-salaries') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/admin/employee-salaries') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                {t('employee_salaries')}
              </Link>
            </div>
          </div>
        </div>
      
      </nav>

      {/* Footer Profile Area */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-md z-10 flex flex-col justify-end">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-bold">U</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t('system_admin')}</p>
            <p className="text-xs text-slate-400">{t('online')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
