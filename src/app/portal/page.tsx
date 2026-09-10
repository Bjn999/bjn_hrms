'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'company' | 'personal'>('company');

  const canViewCompanyDashboard = (user: any) => {
    if (!user) return false;
    return user.role === 'company_admin' || 
           user.role === 'hr_manager' || 
           user.permissions?.includes('view_company_dashboard');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setAdminUser(user);
          
          const hasCompanyAccess = canViewCompanyDashboard(user);
          if (!hasCompanyAccess) {
            setActiveTab('personal');
          } else {
            setActiveTab('company');
          }
          
          // Fetch personal employee data for all users
          fetchEmployeeDashboardData();
        } catch (e) {
          console.error(e);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchEmployeeDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/user/personal-dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': language
        }
      });
      const data = await res.json();
      if (data.status) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching personal dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSalaryDetails = () => {
    if (dashboardData?.financials?.has_salary_permission === false) {
      showToast(dashboardData.financials.permission_message || (language === 'ar' ? 'ليس لديك صلاحية رؤية تفاصيل الراتب' : 'You do not have permission to view salary details'), 'error');
      return;
    }

    if (!dashboardData?.financials?.salary_record_id) {
      showToast(language === 'ar' ? 'لم يتم احتساب أو فتح مسير الراتب للشهر الحالي بعد' : 'Salary record is not available for the current month yet', 'warning');
      return;
    }

    router.push(`/portal/employee-salaries/print/${dashboardData.financials.salary_record_id}`);
  };

  if (loading) {
    return <div className="text-center mt-20 text-slate-500 font-bold">{t('loading')}</div>;
  }

  const hasCompanyStatsView = canViewCompanyDashboard(adminUser);

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('overview')}</h2>
          <p className="text-slate-500 mt-1">{t('welcome')} {adminUser?.name}</p>
        </div>
        <div className="hidden sm:block">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">{t('system_online')}</span>
          </div>
        </div>
      </div>

      {/* Tabs Header for users with company dashboard permissions */}
      {hasCompanyStatsView && (
        <div className="flex bg-slate-200/70 p-1.5 rounded-2xl mb-8 border border-slate-200 max-w-md shadow-inner">
          <button
            onClick={() => setActiveTab('company')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === 'company'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            {language === 'ar' ? 'إحصائيات الشركة' : 'Company Overview'}
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === 'personal'
                ? 'bg-white text-indigo-600 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            {language === 'ar' ? 'ملخصي الشخصي' : 'My Personal Summary'}
          </button>
        </div>
      )}

      {activeTab === 'company' && hasCompanyStatsView ? (
        <>
          {/* Admin Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: t('total_employees'), value: '1,248', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'indigo' },
              { title: t('current_month_salaries'), value: '$84,520', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'emerald' },
              { title: t('pending_leave_requests'), value: '12', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'amber' },
              { title: t('absences_today'), value: '5', icon: 'M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z M21 12h-6', color: 'rose' }
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className={`absolute rtl:-left-4 ltr:-right-4 -top-4 w-24 h-24 bg-${stat.color}-500/10 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 text-${stat.color}-500 flex items-center justify-center`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
            <div className="border-2 border-dashed border-slate-200 rounded-xl h-64 flex flex-col items-center justify-center bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <p className="text-xl font-medium text-slate-500">{t('charts_under_dev')}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Personal Stats Cards Grid (4 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Personal Info Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">{language === 'ar' ? 'البيانات الشخصية' : 'Personal Info'}</h3>
              <p className="text-xs text-slate-500 mb-3">{language === 'ar' ? 'كود الموظف:' : 'Emp Code:'} {dashboardData?.employee?.emp_code || adminUser?.employee?.emp_code || '-'}</p>
              <div className="w-full bg-slate-50 rounded-2xl p-3.5 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between"><span>{language === 'ar' ? 'الاسم:' : 'Name:'}</span> <span className="font-bold text-slate-800 truncate max-w-[120px]">{dashboardData?.employee?.emp_name || adminUser?.name}</span></div>
                <div className="flex justify-between"><span>{language === 'ar' ? 'المسمى الوظيفي:' : 'Job:'}</span> <span className="font-medium text-slate-700">{dashboardData?.employee?.job_name || '-'}</span></div>
                <div className="flex justify-between"><span>{language === 'ar' ? 'تاريخ التعيين:' : 'Start Date:'}</span> <span>{dashboardData?.employee?.emp_start_date || '-'}</span></div>
                <div className="flex justify-between border-t border-slate-200/80 pt-1.5 font-bold"><span>{language === 'ar' ? 'الراتب الأساسي:' : 'Basic Salary:'}</span> <span className="text-emerald-600">{Number(dashboardData?.employee?.emp_salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              </div>
            </div>

            {/* 2. Attendance Summary Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">{language === 'ar' ? 'الحضور للشهر الحالي' : 'Attendance'}</h3>
              <p className="text-xs text-slate-500 mb-3">{language === 'ar' ? 'الشهر المالي:' : 'Month:'} <span className="font-semibold text-slate-700">{dashboardData?.attendance?.current_month || '-'}</span></p>
              <div className="w-full bg-slate-50 rounded-2xl p-3.5 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between"><span>{language === 'ar' ? 'أيام الحضور:' : 'Present Days:'}</span> <span className="font-bold text-emerald-600">{dashboardData?.attendance?.present || 0}</span></div>
                <div className="flex justify-between"><span>{language === 'ar' ? 'أيام الغياب:' : 'Absent Days:'}</span> <span className="font-bold text-rose-500">{dashboardData?.attendance?.absent || 0}</span></div>
                <div className="flex justify-between border-t border-slate-200/80 pt-1.5 font-medium"><span>{language === 'ar' ? 'الفترة:' : 'Period:'}</span> <span className="text-slate-500 text-[11px]">{dashboardData?.attendance?.current_year_month || '-'}</span></div>
              </div>
            </div>

            {/* 3. Leave & Vacations Summary Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 shadow-inner">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">{language === 'ar' ? 'رصيد الإجازات' : 'Leave Balance'}</h3>
              <p className="text-xs text-slate-500 mb-3">{language === 'ar' ? 'للعام الميلادي الحالي' : 'Current Year'}</p>
              <div className="w-full bg-slate-50 rounded-2xl p-3.5 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between"><span>{language === 'ar' ? 'الرصيد المتاح:' : 'Available:'}</span> <span className="font-black text-emerald-600">{dashboardData?.vacations?.remaining_days ?? 0} {t('days_unit')}</span></div>
                <div className="flex justify-between"><span>{language === 'ar' ? 'المستهلك:' : 'Used:'}</span> <span className="font-bold text-blue-600">{dashboardData?.vacations?.used_days ?? 0} {t('days_unit')}</span></div>
                <div className="flex justify-between border-t border-slate-200/80 pt-1.5 font-medium"><span>{language === 'ar' ? 'قيد المراجعة:' : 'Pending:'}</span> <span className="font-bold text-amber-600">{dashboardData?.vacations?.pending_days ?? 0} {t('days_unit')}</span></div>
              </div>

              <button
                onClick={() => router.push('/portal/my-vacations')}
                className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {language === 'ar' ? 'إجازاتي وتقديم طلب' : 'My Leaves & Requests'}
              </button>
            </div>

            {/* 4. Financial Summary Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 shadow-inner">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">{language === 'ar' ? 'البيانات المالية' : 'Financials'}</h3>
              <p className="text-xs text-slate-500 mb-3">{language === 'ar' ? 'للشهر المالي الحالي' : 'For Current Month'}</p>
              <div className="w-full bg-slate-50 rounded-2xl p-3.5 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between"><span>{language === 'ar' ? 'إجمالي المستحقات:' : 'Total Entitlements:'}</span> <span className="font-bold text-emerald-600">{Number(dashboardData?.financials?.total_benefits || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span>{language === 'ar' ? 'إجمالي المستقطعات:' : 'Total Deductions:'}</span> <span className="font-bold text-rose-500">{Number(dashboardData?.financials?.total_deductions || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between border-t border-slate-200/80 pt-1.5 font-bold"><span>{language === 'ar' ? 'صافي الراتب:' : 'Net Salary:'}</span> <span className="text-indigo-600">{Number(dashboardData?.financials?.net_salary ?? ((dashboardData?.financials?.total_benefits || dashboardData?.employee?.emp_salary || 0) - (dashboardData?.financials?.total_deductions || 0))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              </div>

              {/* Details Action Button */}
              <button
                onClick={handleViewSalaryDetails}
                className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {language === 'ar' ? 'تفاصيل الراتب' : 'Salary Details'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
