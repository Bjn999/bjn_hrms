'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';

export default function Sidebar() {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  const [adminUser, setAdminUser] = useState<{name: string, role?: string, image?: string} | null>(null);
  const [subWarning, setSubWarning] = useState<{
    is_expiring_soon: boolean;
    is_expired: boolean;
    days_remaining: number | null;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          setAdminUser(parsed);

          if (parsed.role === 'company_admin') {
            const token = localStorage.getItem('auth_token');
            fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/company-subscription`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            })
            .then(res => res.json())
            .then(data => {
              if (data.status && data.data) {
                if (data.data.is_expiring_soon || data.data.is_expired) {
                  setSubWarning({
                    is_expiring_soon: data.data.is_expiring_soon,
                    is_expired: data.data.is_expired,
                    days_remaining: data.data.days_remaining
                  });
                }
              }
            })
            .catch(() => {});
          }
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

  // Reset manual overrides when path changes, so default path auto-expand takes over
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setManualMenus({});
  }

  const matchesSection = (section: string) => {
    if (section === 'fingerprint') {
      return !!(pathname?.includes('/portal/attendance'));
    }
    if (section === 'vacations') {
      return !!(pathname?.includes('/portal/vacations') || pathname?.includes('/portal/my-vacations'));
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

  // Permission checks for section menus
  const canSeeSettingsMenu = hasAnyPermission([
    'view_settings',
    'view_finance_calendars',
    'view_branches',
    'view_shifts',
    'view_departments',
    'view_jobs_categories',
    'view_qualifications',
    'view_occasions',
    'view_resignations',
    'view_general_constants'
  ]);

  const canSeeEmployeesMenu = hasAnyPermission([
    'view_employees',
    'view_reward_types',
    'view_discount_types',
    'view_allowance_types'
  ]);

  const canSeeSalariesMenu = hasAnyPermission([
    'view_salaries',
    'view_sanctions',
    'view_absences',
    'view_discounts',
    'view_loans',
    'view_permanent_loans',
    'view_additions',
    'view_rewards',
    'view_allowances'
  ]);

  const canManageVacations = hasAnyPermission(['view_employees', 'view_occasions']) || 
                             adminUser?.role === 'company_admin' || 
                             adminUser?.role === 'hr_manager';

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
        {hasPermission('view_dashboard') && (
        <Link href="/portal" className={`group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 ${pathname === '/portal' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-slate-800/50 hover:text-white'}`}>
          <svg className={`w-5 h-5 ml-3 transition-colors ${pathname === '/portal' ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="font-medium mx-2">{t('dashboard')}</span>
        </Link>
        )}

        {/* Settings Menu */}
        {canSeeSettingsMenu && (
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
              {hasPermission('view_settings') && (
                <Link href="/portal/general-settings" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/general-settings') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/general-settings') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('general_settings')}
                </Link>
              )}
              {hasPermission('view_finance_calendars') && (
                <Link href="/portal/finance-calendars" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/finance-calendars') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/finance-calendars') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('finance_calendars')}
                </Link>
              )}
              {hasPermission('view_branches') && (
                <Link href="/portal/branches" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/branches') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/branches') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('branches')}
                </Link>
              )}
              {hasPermission('view_shifts') && (
                <Link href="/portal/shifts" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/shifts') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/shifts') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('shifts')}
                </Link>
              )}
              {hasPermission('view_departments') && (
                <Link href="/portal/departments" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/departments') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/departments') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('departments')}
                </Link>
              )}
              {hasPermission('view_jobs_categories') && (
                <Link href="/portal/jobs-categories" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/jobs-categories') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/jobs-categories') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('jobs_categories')}
                </Link>
              )}
              {hasPermission('view_qualifications') && (
                <Link href="/portal/qualifications" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/qualifications') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/qualifications') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('qualifications')}
                </Link>
              )}
              {hasPermission('view_occasions') && (
                <Link href="/portal/occasions" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/occasions') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/occasions') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('occasions')}
                </Link>
              )}
              {hasPermission('view_resignations') && (
                <Link href="/portal/resignations" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/resignations') ? 'text-white bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/resignations') ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('resignations')}
                </Link>
              )}
              {hasPermission('view_general_constants') && (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Vacations Menu */}
        {canManageVacations ? (
        <div className="pt-2">
          <button
            onClick={() => toggleMenu('vacations')}
            className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${isMenuOpen('vacations') ? 'bg-slate-800/50 text-white' : 'hover:bg-slate-800/30 hover:text-white'}`}
          >
            <div className="flex items-center">
              <svg className={`w-5 h-5 ml-3 transition-colors ${isMenuOpen('vacations') ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium mx-2">{t('vacations_menu')}</span>
            </div>
            <div className={`w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center transition-transform duration-300 ${isMenuOpen('vacations') ? 'transform -rotate-90 bg-blue-500/20 text-blue-400' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </div>
          </button>

          <div className={`overflow-hidden transition-all duration-500 ${isMenuOpen('vacations') ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-1 mx-4 ltr:border-l-2 ltr:pl-4 rtl:border-r-2 rtl:pr-4 border-slate-800/50 py-1">
              <Link href="/portal/vacations" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/vacations') ? 'text-white bg-blue-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/vacations') ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-slate-600'}`}></div>
                {t('vacations_management')}
              </Link>
              <Link href="/portal/my-vacations" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/my-vacations') ? 'text-white bg-blue-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/my-vacations') ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-slate-600'}`}></div>
                {t('my_vacations')}
              </Link>
            </div>
          </div>
        </div>
        ) : (
          <Link 
            href="/portal/my-vacations" 
            className={`group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive('/portal/my-vacations') ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 font-bold' : 'hover:bg-slate-800/50 hover:text-white'}`}
          >
            <svg className={`w-5 h-5 ml-3 transition-colors ${isActive('/portal/my-vacations') ? 'text-white' : 'text-blue-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium mx-2">{t('my_vacations')}</span>
          </Link>
        )}

        {/* Employees Menu */}
        {canSeeEmployeesMenu && (
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
              {hasPermission('view_employees') && (
                <Link href="/portal/employees" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/employees') ? 'text-white bg-purple-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/employees') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('employees_list')}
                </Link>
              )}
              {hasPermission('view_reward_types') && (
                <Link href="/portal/reward-sal-types" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/reward-sal-types') ? 'text-white bg-purple-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/reward-sal-types') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('rewards_types')}
                </Link>
              )}
              {hasPermission('view_discount_types') && (
                <Link href="/portal/discount-sal-types" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/discount-sal-types') ? 'text-white bg-purple-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/discount-sal-types') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('discount_sal_types')}
                </Link>
              )}
              {hasPermission('view_allowance_types') && (
                <Link href="/portal/allowance-sal-types" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/allowance-sal-types') ? 'text-white bg-purple-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/allowance-sal-types') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('allowances_types')}
                </Link>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Salaries & Payroll Menu */}
        {canSeeSalariesMenu && (
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
              {hasPermission('view_salaries') && (
                <Link href="/portal/salary-records" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/salary-records') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/salary-records') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('salary_record')}
                </Link>
              )}
              {hasPermission('view_sanctions') && (
                <Link href="/portal/sanctions" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/sanctions') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/sanctions') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('sanctions_days')}
                </Link>
              )}
              {hasPermission('view_absences') && (
                <Link href="/portal/absences" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/absences') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/absences') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('absences_days')}
                </Link>
              )}
              {hasPermission('view_discounts') && (
                <Link href="/portal/discounts" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/discounts') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/discounts') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('financial_discounts')}
                </Link>
              )}
              {hasPermission('view_loans') && (
                <Link href="/portal/loans" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/loans') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/loans') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('monthly_loans')}
                </Link>
              )}
              {hasPermission('view_permanent_loans') && (
                <Link href="/portal/permanent-loans" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/permanent-loans') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/permanent-loans') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('permanent_loans')}
                </Link>
              )}
              {hasPermission('view_additions') && (
                <Link href="/portal/additions" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/additions') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/additions') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('additional_days')}
                </Link>
              )}
              {hasPermission('view_rewards') && (
                <Link href="/portal/rewards" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/rewards') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/rewards') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('financial_rewards')}
                </Link>
              )}
              {hasPermission('view_allowances') && (
                <Link href="/portal/allowances" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/allowances') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/allowances') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('changable_allowances')}
                </Link>
              )}
              {hasPermission('view_salaries') && (
                <Link href="/portal/employee-salaries" className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-300 ${isActive('/portal/employee-salaries') ? 'text-white bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mx-2 transition-colors ${isActive('/portal/employee-salaries') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
                  {t('employee_salaries')}
                </Link>
              )}
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

        {/* Settings & Profile Link (Accessible to all users for personal profile & credentials) */}
        <Link href="/portal/settings" className={`group flex items-center px-4 py-3.5 mt-4 rounded-2xl transition-all duration-300 ${isActive('/portal/settings') ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-slate-800/50 hover:text-white'}`}>
          <svg className={`w-5 h-5 ml-3 transition-colors ${isActive('/portal/settings') ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium mx-2">{adminUser?.role === 'company_admin' ? (language === 'ar' ? 'إعدادات الشركة والحساب' : 'Settings & Account') : (language === 'ar' ? 'الملف الشخصي والحساب' : 'Profile & Account')}</span>
        </Link>
      </nav>

      {/* Footer Profile Area */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-md z-10 flex flex-col justify-end relative">
        <div className="flex items-center justify-between px-2">
          <Link href="/portal/settings?tab=account" className="flex items-center gap-3 overflow-hidden group hover:opacity-90 transition-opacity">
            {adminUser?.image ? (
              <img src={adminUser.image} alt={adminUser.name} className="w-9 h-9 rounded-full shadow-lg object-cover shrink-0 ring-2 ring-transparent group-hover:ring-indigo-500/50 transition-all" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shrink-0 ring-2 ring-transparent group-hover:ring-indigo-500/50 transition-all">
                <span className="text-white text-sm font-bold">
                  {adminUser?.name ? adminUser.name.charAt(0) : 'U'}
                </span>
              </div>
            )}
            <div className="truncate text-right rtl:text-right ltr:text-left">
              <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">{adminUser?.name || t('system_admin')}</p>
              <p className="text-xs text-slate-400 truncate">{getUserJobOrRole()}</p>
            </div>
          </Link>

          {/* Floating Pulsating Expiry Alert Badge with Hover Tooltip */}
          {subWarning && (
            <div className="relative group shrink-0">
              <Link
                href="/portal/settings?tab=subscription_data"
                className={`relative p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  subWarning.is_expired
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                }`}
              >
                {/* Pulsating Ping Wave */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    subWarning.is_expired ? 'bg-rose-400' : 'bg-amber-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${
                    subWarning.is_expired ? 'bg-rose-500' : 'bg-amber-500'
                  }`}></span>
                </span>

                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </Link>

              {/* Hover Popover Tooltip Bubble */}
              <div className="absolute bottom-full mb-3 rtl:left-0 ltr:right-0 w-64 p-3.5 bg-slate-900/95 text-white border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform group-hover:translate-y-0 translate-y-1">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-xs">
                  <span className={subWarning.is_expired ? 'text-rose-400' : 'text-amber-400'}>
                    {subWarning.is_expired ? '⚠️ ' + (language === 'ar' ? 'انتهت صلاحية الباقة' : 'Plan Expired') : '⏳ ' + (language === 'ar' ? 'اقترب انتهاء الاشتراك' : 'Expiring Soon')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {subWarning.is_expired
                    ? (language === 'ar' ? 'انتهت باقة اشتراك الشركة! يرجى التواصل مع إدارة النظام للتجديد الفوري.' : 'Company plan expired! Please contact administration to renew.')
                    : (language === 'ar'
                        ? `سينتهي اشتراك باقة شركتك خلال ${subWarning.days_remaining} يوم. يرجى التجديد لضمان استمرارية الخدمة.`
                        : `Your plan expires in ${subWarning.days_remaining} days. Please renew to avoid interruption.`)}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-indigo-400 font-semibold flex items-center justify-between">
                  <span>{language === 'ar' ? 'انقر لعرض التفاصيل' : 'Click to view details'}</span>
                  <span className="rtl:rotate-180">→</span>
                </div>
                {/* Arrow */}
                <div className="absolute top-full rtl:left-3 ltr:right-3 -mt-1 border-4 border-transparent border-t-slate-900"></div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
