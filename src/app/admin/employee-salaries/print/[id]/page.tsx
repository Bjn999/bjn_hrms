'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams } from 'next/navigation';
import { FinanceMonth } from '@/types';

interface PrintSalaryData {
  employee_code: string;
  emp_name_display?: string;
  emp_name?: string;
  emp_national_identity?: string;
  sal_cash_or_visa?: number;
  emp_departments_id?: number;
  emp_job_id?: number;
  department_name?: string;
  job_name?: string;
  emp_sal: number | string;
  fixed_allowances: number | string;
  changable_allowances: number | string;
  additional_days_total: number | string;
  reward: number | string;
  motivation: number | string;
  total_benefits: number | string;
  socialinsurancecutmonthly: number | string;
  medicalinsurancecutmonthly: number | string;
  absence_days_total: number | string;
  sanctions_days_total: number | string;
  discount: number | string;
  permanent_loan: number | string;
  monthly_loan: number | string;
  total_deduction: number | string;
  final_the_net: number | string;
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

export default function PrintSalarySlipPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const recordId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PrintSalaryData | null>(null);
  const [financeMonth, setFinanceMonth] = useState<FinanceMonth | null>(null);

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/employee-salaries/${recordId}/details`, { headers: headers() });
        const result = await res.json();
        if (result.status) {
          setData(result.data);
          setFinanceMonth(result.finance_month);
          
          // Wait for DOM to render before printing
          // setTimeout(() => {
          //   window.print();
          // }, 500);
        }
      } catch {
        // Ignored
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [recordId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">{t('loading')}</div>;
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-rose-500">{t('failed_load_salary')}</div>;
  }

  const monthName = financeMonth && financeMonth.month_id !== undefined ? (language === 'ar' ? MONTHS_AR[financeMonth.month_id] : MONTHS_EN[financeMonth.month_id]) : '';
  const year = financeMonth ? financeMonth.finance_yr : '';

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Controls (Hidden on Print) */}
      <div className="print:hidden bg-slate-100 p-4 flex justify-center gap-4 border-b border-slate-200">
        <button onClick={() => window.print()} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-900 transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          {t('print')}
        </button>
        <button onClick={() => window.close()} className="bg-white text-slate-700 px-6 py-2 rounded-lg font-bold border border-slate-300 hover:bg-slate-50 transition-colors">{t('close')}</button>
      </div>

      {/* A4 Paper Container */}
      <div className="max-w-[800px] mx-auto bg-white p-10 print:p-0 print:shadow-none shadow-xl my-8 print:my-0">
        
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white text-2xl font-black rounded-lg">
              {t('logo')}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{t('hrms_title')}</h1>
              <p className="text-sm text-slate-500 font-bold mt-1">{t('detailed_salary_slip_title')}</p>
            </div>
          </div>
          <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-sm font-bold text-slate-600 mb-1">{t('finance_month')}</p>
            <p className="text-xl font-black text-indigo-700">{monthName} {year}</p>
            <p className="text-xs text-slate-400 mt-2">{t('print_date')}: {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
          </div>
        </div>

        {/* Employee Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1">{t('employee_code')}</p>
              <p className="font-black text-slate-800">#{data.employee_code}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-slate-500 font-bold mb-1">{t('full_name')}</p>
              <p className="font-black text-slate-800">{data.emp_name_display || data.emp_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1">{t('national_identity')}</p>
              <p className="font-bold text-slate-700">{data.emp_national_identity || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1">{t('salary_payment_method')}</p>
              <p className="font-bold text-slate-700">{data.sal_cash_or_visa == 1 ? t('salary_payment_cash') : t('salary_payment_bank')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1">{t('department')}</p>
              <p className="font-bold text-slate-700">{data.department_name || (data.emp_departments_id ? `${t('department')} #${data.emp_departments_id}` : '-')}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-slate-500 font-bold mb-1">{t('job')}</p>
              <p className="font-bold text-slate-700">{data.job_name || (data.emp_job_id ? `${t('job')} #${data.emp_job_id}` : '-')}</p>
            </div>
          </div>
        </div>

        {/* Financial Details Grid */}
        <div className="grid grid-cols-2 gap-8 mb-4">
          
          {/* Earnings */}
          <div>
            <h3 className="text-lg font-black text-emerald-700 border-b-2 border-emerald-700 pb-2 mb-4 flex items-center justify-between">
              <span>{t('first_benefits')}</span>
              <span className="text-sm font-normal">{t('amount')}</span>
            </h3>
            <ul className="space-y-1.5">
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('basic_salary')}</span>
                <span className="text-slate-900">{parseFloat(String(data.emp_sal || 0)).toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('fixed_allowances')}</span>
                <span className="text-slate-900">{parseFloat(String(data.fixed_allowances || 0)).toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('variable_allowances')}</span>
                <span className="text-slate-900">{parseFloat(String(data.changable_allowances || 0)).toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('additional_days')}</span>
                <span className="text-slate-900">{parseFloat(String(data.additional_days_total || 0)).toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('financial_reward')}</span>
                <span className="text-slate-900">{parseFloat(String(data.reward || 0)).toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('fixed_motivation')}</span>
                <span className="text-slate-900">{parseFloat(String(data.motivation || 0)).toFixed(2)}</span>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t-2 border-dashed border-emerald-200 flex justify-between items-center font-black">
              <span className="text-emerald-800">{t('total_benefits')}</span>
              <span className="text-emerald-700 text-lg">{parseFloat(String(data.total_benefits || 0)).toFixed(2)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="text-lg font-black text-rose-700 border-b-2 border-rose-700 pb-2 mb-4 flex items-center justify-between">
              <span>{t('second_deductions')}</span>
              <span className="text-sm font-normal">{t('amount')}</span>
            </h3>
            <ul className="space-y-1.5">
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('social_insurance')}</span>
                <span className="text-slate-900">{parseFloat(String(data.socialinsurancecutmonthly || 0)).toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('medical_insurance')}</span>
                <span className="text-slate-900">{parseFloat(String(data.medicalinsurancecutmonthly || 0)).toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('absence_days')}</span>
                <span className="text-slate-900">{parseFloat(String(data.absence_days_total || 0)).toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('sanctions_days')}</span>
                <span className="text-slate-900">{parseFloat(String(data.sanctions_days_total || 0)).toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('financial_discounts')}</span>
                <span className="text-slate-900">{parseFloat(String(data.discount || 0)).toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('permanent_loans')}</span>
                <span className="text-slate-900">{parseFloat(String(data.permanent_loan || 0)).toFixed(2)}</span>
              </li>
              <li className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-600">{t('monthly_loans')}</span>
                <span className="text-slate-900">{parseFloat(String(data.monthly_loan || 0)).toFixed(2)}</span>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t-2 border-dashed border-rose-200 flex justify-between items-center font-black">
              <span className="text-rose-800">{t('total_deduction')}</span>
              <span className="text-rose-700 text-lg">{parseFloat(String(data.total_deduction || 0)).toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* Net Salary Box */}
        <div className="bg-slate-900 text-white rounded-xl p-3 flex justify-between items-center shadow-lg print:border-2 print:border-slate-900 print:bg-white print:text-slate-900 mb-6">
          <div>
            <p className="text-slate-400 print:text-slate-600 font-bold mb-0.5">{t('final_net_salary')}</p>
            <p className="text-xs opacity-75 hidden sm:block">{t('salary_slip_desc')}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black">{parseFloat(String(data.final_the_net || 0)).toFixed(2)}</span>
            <span className="text-sm ml-2 font-bold opacity-80">{t('currency')}</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end pt-6 mt-6 border-t border-slate-200">
          <div className="text-center w-40">
            <p className="text-sm font-bold text-slate-800 mb-6">{t('employee_signature')}</p>
            <div className="border-b-2 border-slate-400"></div>
          </div>
          <div className="text-center w-40">
            <p className="text-sm font-bold text-slate-800 mb-6">{t('financial_officer_accountant')}</p>
            <div className="border-b-2 border-slate-400"></div>
          </div>
          <div className="text-center w-40">
            <p className="text-sm font-bold text-slate-800 mb-6">{t('hr_manager')}</p>
            <div className="border-b-2 border-slate-400"></div>
          </div>
        </div>

      </div>

      {/* Global Print Styles inside page */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
    </div>
  );
}
