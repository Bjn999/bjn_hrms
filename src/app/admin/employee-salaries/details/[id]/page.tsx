'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useRouter } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { FinanceMonth, Employee } from '@/types';

interface SalaryDetailItem {
  id: number;
  total: number | string;
  notes?: string;
  created_at: string;
  type_name?: string;
  days_count?: number;
  value?: number;
  [key: string]: unknown;
}

interface SalaryDetails {
  id: number;
  finance_month_id: number;
  employee_code: string;
  is_stoped: number;
  is_archived: number;
  added_by?: number;
  updated_by?: number;
  total_benefits: string | number;
  total_deduction: string | number;
  final_the_net: string | number;
  emp_name_display?: string;
  emp_sal?: string | number;
  emp_job_id?: number;
  emp_departments_id?: number;
  job_name?: number;
  department_name?: number;
  day_price?: string | number;
  sal_cash_or_visa?: number;
  last_salary_remain_balance?: string | number;
  motivation?: string | number;
  reward?: string | number;
  fixed_allowances?: string | number;
  changable_allowances?: string | number;
  additional_days_counter?: string | number;
  additional_days_total?: string | number;
  socialinsurancecutmonthly?: string | number;
  medicalinsurancecutmonthly?: string | number;
  absence_days_counter?: string | number;
  absence_days_total?: string | number;
  sanctions_days_counter?: string | number;
  sanctions_days_total?: string | number;
  monthly_loan?: string | number;
  permanent_loan?: string | number;
  discount?: string | number;
  phones?: string | number;
  archived_date?: string;
  created_at: string;
  updated_at?: string;
  employee?: Employee;
  benefits?: SalaryDetailItem[];
  deductions?: SalaryDetailItem[];
  loans?: SalaryDetailItem[];
  sanctions?: SalaryDetailItem[];
  absences?: SalaryDetailItem[];
  allowances?: SalaryDetailItem[];
  discounts?: SalaryDetailItem[];
  rewards?: SalaryDetailItem[];
}

const API = process.env.NEXT_PUBLIC_API_URL || '';

const MONTHS_AR: Record<number, string> = {
  1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
  5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
  9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
};

const MONTHS_EN: Record<number, string> = {
  1: 'January', 2: 'February', 3: 'March', 4: 'April',
  5: 'May', 6: 'June', 7: 'July', 8: 'August',
  9: 'September', 10: 'October', 11: 'November', 12: 'December'
};

export default function EmployeeSalaryDetailsPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const params = useParams();
  const router = useRouter();
  const recordId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SalaryDetails | null>(null);
  const [financeMonth, setFinanceMonth] = useState<FinanceMonth | null>(null);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/employee-salaries/${recordId}/details`, { headers: headers() });
      const result = await res.json();
      if (result.status) {
        setData(result.data);
        setFinanceMonth(result.finance_month);
        setIsMonthOpen(result.finance_month?.is_open == 1);
      } else {
        showToast(result.message || t('failed_load_salary'), 'error');
        router.back();
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recordId) {
      const timer = setTimeout(() => {
        fetchData();
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  const handleStopSalary = async () => {
    const ok = await confirm({
      title: t('confirm_stop_salary_title'),
      description: t('confirm_stop_salary_desc'),
      icon: 'warning'
    });
    if (!ok) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API}/employee-salaries/${recordId}/stop`, {
        method: 'POST',
        headers: headers()
      });
      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
        fetchData();
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSalary = async () => {
    const ok = await confirm({
      title: t('confirm_resume_salary_title'),
      description: t('confirm_resume_salary_desc'),
      icon: 'warning'
    });
    if (!ok) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API}/employee-salaries/${recordId}/resume`, {
        method: 'POST',
        headers: headers()
      });
      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
        fetchData();
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchiveSalary = async () => {
    const ok = await confirm({
      title: t('confirm_archive_salary_title'),
      description: t('confirm_archive_salary_desc'),
      icon: 'warning'
    });
    if (!ok) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API}/employee-salaries/${recordId}/archive`, {
        method: 'POST',
        headers: headers()
      });
      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
        fetchData();
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSalary = async () => {
    const ok = await confirm({
      title: t('confirm_delete_salary_title'),
      description: t('confirm_delete_salary_desc'),
      icon: 'danger'
    });
    if (!ok) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API}/employee-salaries/${recordId}`, {
        method: 'DELETE',
        headers: headers()
      });
      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
        if (data) {
          router.push(`/admin/employee-salaries/${data.finance_month_id}`);
        }
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.open(`/admin/employee-salaries/print/${recordId}`, '_blank');
  };

  if (loading) return <LoadingScreen />;
  if (!data) return null;

  const isArchived = data.is_archived == 1;
  const isStopped = data.is_stoped == 1;
  const canAct = isMonthOpen && !isArchived;

  return (
    <div className="animate-fade-in-up pb-12 print:p-0 print:bg-white print:text-black">
      <style>{`
        @media print {
          /* Hide sidebar, topbar, background gradient, toast and actions */
          aside,
          header,
          .print\\:hidden,
          button,
          .toast-container,
          div[class*="Toast"],
          div[class*="Confirm"] {
            display: none !important;
          }

          /* Reset all screen-specific flex/grid layouts to print block flow */
          body, html {
            background-color: white !important;
            color: black !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Reset DashboardLayout layout structures */
          .flex.h-screen {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }

          .flex-1.flex.flex-col {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
            width: 100% !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            height: auto !important;
            background: white !important;
            width: 100% !important;
            position: static !important;
          }

          /* Reset employee salary details layout elements */
          .bg-white, .bg-emerald-50\\/20, .bg-rose-50\\/20, .bg-slate-900 {
            background-color: white !important;
            background: white !important;
            color: black !important;
          }

          .text-white, .text-slate-100, .text-slate-400, .text-slate-500, .text-emerald-800, .text-rose-800, .text-violet-400 {
            color: black !important;
          }

          .border, .border-slate-100, .border-emerald-50, .border-rose-50 {
            border: 1px solid #000 !important;
          }

          .shadow-sm, .shadow-md, .shadow-lg, .shadow-2xl {
            box-shadow: none !important;
          }

          .rounded-3xl, .rounded-2xl, .rounded-xl {
            border-radius: 0 !important;
          }

          /* Ensure layout takes full printable width and wraps nicely */
          .animate-fade-in-up {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 1rem !important;
          }
        }
      `}</style>
      {/* Top Header - Hidden when printing */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 bg-white border border-slate-100 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800">{t('emp_salary_details')}</h2>
            {financeMonth && (
              <p className="text-sm text-slate-500 font-medium">
                {t('finance_month')}: {financeMonth.month_id !== undefined ? (language === 'ar' ? MONTHS_AR[financeMonth.month_id] : MONTHS_EN[financeMonth.month_id]) : ''} - {financeMonth.finance_yr}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-bold flex items-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {t('print_salary_slip')}
          </button>
        </div>
      </div>

      {/* Action Bar (Stop, Archive, Delete) - Hidden when printing */}
      {financeMonth && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 font-bold">{t('salary_status')}:</span>
            {isArchived ? (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {t('salary_status_archived')}
              </span>
            ) : isStopped ? (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                {t('salary_status_stopped')}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                {t('salary_status_active')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canAct && !isStopped && (
              <>
                <button
                  onClick={handleStopSalary}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-bold text-sm transition-all border border-amber-200/50 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('temp_stop')}
                </button>
                <button
                  onClick={handleArchiveSalary}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm transition-all border border-emerald-200/50 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  {t('archive_salary')}
                </button>
              </>
            )}
            {canAct && isStopped && (
              <button
                onClick={handleResumeSalary}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm transition-all border border-emerald-200/50 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('activate_salary')}
              </button>
            )}
            {canAct && !isStopped && (
              <button
                onClick={handleDeleteSalary}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-sm transition-all border border-rose-200/50 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('delete_record')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Container - Styled for both screen & print */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden print:shadow-none print:border-none">
        {/* Print Header Information */}
        <div className="hidden print:block text-center border-b pb-6 mb-6">
          <h1 className="text-2xl font-black text-black">{t('detailed_emp_salary_slip')}</h1>
          {financeMonth && (
            <p className="text-sm text-slate-700 font-bold mt-1">
              {t('finance_month')}: {financeMonth.month_id !== undefined ? (language === 'ar' ? MONTHS_AR[financeMonth.month_id] : MONTHS_EN[financeMonth.month_id]) : ''} - {financeMonth.finance_yr} ({financeMonth.start_date_m} {t('from_date_to_date')} {financeMonth.end_date_m})
            </p>
          )}
        </div>

        {/* Employee Info Header */}
        <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 print:bg-white print:border-b-2 print:border-black">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase print:text-slate-700">{t('employee')}</span>
            <p className="text-lg font-black text-slate-800 print:text-black mt-1">
              {data.emp_name_display || data.employee?.emp_name || ''}
            </p>
            <span className="text-sm text-slate-400 font-bold print:text-slate-700">{t('employee_code')}: {data.employee_code}</span>
          </div>

          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase print:text-slate-700">{t('job')}</span>
            <p className="text-lg font-bold text-slate-700 print:text-black mt-1">
              {data.job_name || (data.emp_job_id ? `${t('job')} #${data.emp_job_id}` : t('not_specified'))}
            </p>
            <span className="text-sm text-slate-400 font-bold print:text-slate-700">
              {t('department')}: {data.department_name || (data.emp_departments_id ? `${t('department')} #${data.emp_departments_id}` : t('general'))}
            </span>
          </div>

          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase print:text-slate-700">{t('day_price_payment_method')}</span>
            <p className="text-lg font-bold text-slate-700 print:text-black mt-1">
              {parseFloat(String(data.day_price || 0)).toFixed(2)} {t('currency')} / {t('day')}
            </p>
            <span className="text-sm text-slate-400 font-bold print:text-slate-700">
              {t('salary_payment_method')}: {data.sal_cash_or_visa == 1 ? t('salary_payment_cash') : t('salary_payment_bank')}
            </span>
          </div>
        </div>

        {/* Previous Month Transferred Balance Warning/Note if exists */}
        {parseFloat(String(data.last_salary_remain_balance || 0)) !== 0 && (
          <div className="m-6 p-4 bg-violet-50 text-violet-700 rounded-2xl border border-violet-100 flex items-center justify-between print:bg-slate-100 print:text-black print:border-black">
            <span className="font-bold text-sm">{t('prev_month_balance')}:</span>
            <span className="font-black text-base">{parseFloat(String(data.last_salary_remain_balance || 0)).toFixed(2)} {t('currency')}</span>
          </div>
        )}

        {/* Benefits & Deductions Grid Layout */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4 print:p-0">

          {/* Earnings / Benefits Section */}
          <div className="bg-emerald-50/20 border border-emerald-50 rounded-2xl p-6 print:border-2 print:border-black print:bg-white print:rounded-none">
            <h3 className="text-lg font-black text-emerald-800 print:text-black mb-4 flex items-center gap-2 pb-2 border-b border-emerald-100/50 print:border-black">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 print:hidden"></span>
              {t('first_benefits')}
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold print:text-black">{t('basic_salary')}</span>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.emp_sal || 0)).toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold print:text-black">{t('fixed_motivation')}</span>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.motivation || 0)).toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold print:text-black">{t('financial_reward')}</span>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.reward || 0)).toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold print:text-black">{t('fixed_allowances')}</span>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.fixed_allowances || 0)).toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold print:text-black">{t('changable_allowances')}</span>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.changable_allowances || 0)).toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <span className="text-slate-500 font-bold block print:text-black">{t('additional_days')}</span>
                  {parseInt(String(data.additional_days_counter || 0)) > 0 && (
                    <span className="text-xs text-slate-400 font-bold print:text-slate-700">{t('days_count')}: ({data.additional_days_counter})</span>
                  )}
                </div>
                <span className="font-black text-slate-800 print:text-black">
                  {parseFloat(String(data.additional_days_total || 0)).toFixed(2)} {t('currency')}
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-emerald-100 font-black text-emerald-800 print:text-black print:border-black">
                <span className="text-base">{t('total_benefits')}</span>
                <span className="text-xl">{parseFloat(String(data.total_benefits || 0)).toFixed(2)} {t('currency')}</span>
              </div>
            </div>
          </div>

          {/* Deductions Section */}
          <div className="bg-rose-50/20 border border-rose-50 rounded-2xl p-6 print:border-2 print:border-black print:bg-white print:rounded-none">
            <h3 className="text-lg font-black text-rose-800 print:text-black mb-4 flex items-center gap-2 pb-2 border-b border-rose-100/50 print:border-black">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 print:hidden"></span>
              {t('second_deductions')}
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold print:text-black">{t('social_insurance')}</span>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.socialinsurancecutmonthly || 0)).toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold print:text-black">{t('medical_insurance')}</span>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.medicalinsurancecutmonthly || 0)).toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <span className="text-slate-500 font-bold block print:text-black">{t('absence_days')}</span>
                  {parseInt(String(data.absence_days_counter || 0)) > 0 && (
                    <span className="text-xs text-slate-400 font-bold print:text-slate-700">{t('days_count')}: ({data.absence_days_counter})</span>
                  )}
                </div>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.absence_days_total || 0)).toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                  <span className="text-slate-500 font-bold block print:text-black">{t('sanctions_days')}</span>
                  {parseInt(String(data.sanctions_days_counter || 0)) > 0 && (
                    <span className="text-xs text-slate-400 font-bold print:text-slate-700">{t('days_count')}: ({data.sanctions_days_counter})</span>
                  )}
                </div>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.sanctions_days_total || 0)).toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold print:text-black">{t('monthly_loans')}</span>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.monthly_loan || 0)).toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold print:text-black">{t('permanent_loans')}</span>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.permanent_loan || 0)).toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold print:text-black">{t('financial_discounts')}</span>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.discount || 0)).toFixed(2)} {t('currency')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-bold print:text-black">{t('phone_bills')}</span>
                <span className="font-black text-slate-800 print:text-black">{parseFloat(String(data.phones || 0)).toFixed(2)} {t('currency')}</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-rose-100 font-black text-rose-800 print:text-black print:border-black">
                <span className="text-base">{t('total_deduction')}</span>
                <span className="text-xl">{parseFloat(String(data.total_deduction || 0)).toFixed(2)} {t('currency')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Net Salary Summary Block */}
        <div className="m-6 p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 print:m-0 print:border-2 print:border-black print:text-black print:bg-white print:rounded-none">
          <div>
            <h4 className="text-lg font-black text-slate-100 print:text-black mb-1">{t('third_net_salary')}</h4>
            <p className="text-sm text-slate-400 print:text-slate-700">
              {Number(data.final_the_net) > 0 ? (
                <span>{t('amount_due_to_emp')}</span>
              ) : Number(data.final_the_net) < 0 ? (
                <span>{t('amount_due_from_emp')}</span>
              ) : (
                <span>{t('salary_net_balanced')}</span>
              )}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase font-bold print:text-slate-700">{t('final_net_salary')}</span>
            <p className="text-3xl font-black text-violet-400 print:text-black mt-1">
              {parseFloat(String(Math.abs(Number(data.final_the_net || 0)))).toFixed(2)} {t('currency')}
            </p>
          </div>
        </div>

        {/* Archive Timestamp Footer - Shown when archived */}
        {isArchived && (
          <div className="m-6 pt-4 border-t border-slate-100 text-left text-xs text-slate-400 font-bold print:m-0 print:text-slate-700">
            {t('record_archived_at')} {data.archived_date ? new Date(data.archived_date).toLocaleString(language === 'ar' ? 'ar-YE' : 'en-US') : t('preset')}
          </div>
        )}

        {/* Signature Line for Printing */}
        <div className="hidden print:flex justify-between mt-12 px-6">
          <div className="text-center">
            <p className="font-bold">{t('officer_signature')}</p>
            <div className="h-16"></div>
            <p className="text-xs text-slate-500">........................</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{t('recipient_signature')}</p>
            <div className="h-16"></div>
            <p className="text-xs text-slate-500">........................</p>
          </div>
        </div>
      </div>
    </div>
  );
}
