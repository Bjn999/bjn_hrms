'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams } from 'next/navigation';
import { FinanceMonth } from '@/types';

interface SalaryRecord {
  id: number;
  employee_code: string;
  emp_name_display?: string;
  department_name?: string;
  job_name?: string;
  emp_sal: number | string;
  total_benefits: number | string;
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

export default function PrintSummaryTablePage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const monthId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SalaryRecord[]>([]);
  const [financeMonth, setFinanceMonth] = useState<FinanceMonth | null>(null);

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/employee-salaries/${monthId}/print-all-details`, { headers: headers() });
        const result = await res.json();
        if (result.status) {
          setData(result.data || []);
          setFinanceMonth(result.finance_month);
        }
      } catch {
        // Ignored
      } finally {
        setLoading(false);
      }
    };

    if (monthId) {
      fetchData();
    }
  }, [monthId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">{t('loading')}</div>;
  }

  if (!financeMonth) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-rose-500">{t('failed_load_salary')}</div>;
  }

  const monthName = financeMonth.month_id !== undefined ? (language === 'ar' ? MONTHS_AR[financeMonth.month_id] : MONTHS_EN[financeMonth.month_id]) : '';
  const year = financeMonth.finance_yr || '';

  // Sum totals
  const sumBasic = data.reduce((s, r) => s + parseFloat(String(r.emp_sal || 0)), 0);
  const sumBenefits = data.reduce((s, r) => s + parseFloat(String(r.total_benefits || 0)), 0);
  const sumDeductions = data.reduce((s, r) => s + parseFloat(String(r.total_deduction || 0)), 0);
  const sumNet = data.reduce((s, r) => s + parseFloat(String(r.final_the_net || 0)), 0);

  return (
    <div className="bg-white min-h-screen text-slate-800 p-8 print:p-0" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Controls (Hidden on Print) */}
      <div className="print:hidden bg-slate-100 p-4 rounded-2xl flex justify-between items-center mb-6 border border-slate-200">
        <div>
          <h3 className="font-black text-slate-800">{language === 'ar' ? 'تقرير كشف الرواتب المختصر' : 'Summarized Salaries Report'}</h3>
          <p className="text-xs text-slate-500 mt-1">{language === 'ar' ? 'عرض الطباعة متوافق مع وضع العرض العمودي (Portrait)' : 'Print layout is optimized for Portrait mode'}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            {t('print')}
          </button>
          <button onClick={() => window.close()} className="bg-white text-slate-700 px-6 py-2 rounded-xl font-bold border border-slate-300 hover:bg-slate-50 transition-colors">{t('close')}</button>
        </div>
      </div>

      {/* Report Container */}
      <div className="max-w-[900px] mx-auto">
        {/* Header Block */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white text-2xl font-black rounded-lg">
              {t('logo')}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{t('hrms_title')}</h1>
              <p className="text-sm text-slate-500 font-bold mt-1">
                {language === 'ar' ? 'تقرير كشف رواتب الموظفين المختصر' : 'Summarized Employee Salaries Report'}
              </p>
            </div>
          </div>
          <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 mb-0.5">{t('finance_month')}</p>
            <p className="text-lg font-black text-indigo-700">{monthName} {year}</p>
            <p className="text-xs text-slate-400 mt-1">{t('print_date')}: {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
          </div>
        </div>

        {/* Data Table */}
        <table className="w-full text-sm text-right border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 print:bg-slate-100 print:text-black">
              <th className="border border-slate-300 px-4 py-3 font-black text-center w-16">#</th>
              <th className="border border-slate-300 px-4 py-3 font-black">{language === 'ar' ? 'الموظف' : 'Employee'}</th>
              <th className="border border-slate-300 px-4 py-3 font-black text-center">{language === 'ar' ? 'الراتب الأساسي' : 'Basic Salary'}</th>
              <th className="border border-slate-300 px-4 py-3 font-black text-center bg-emerald-50 text-emerald-800 print:bg-slate-50 print:text-black">{language === 'ar' ? 'إجمالي الإضافات' : 'Total Benefits'}</th>
              <th className="border border-slate-300 px-4 py-3 font-black text-center bg-rose-50 text-rose-800 print:bg-slate-50 print:text-black">{language === 'ar' ? 'إجمالي الخصميات' : 'Total Deductions'}</th>
              <th className="border border-slate-300 px-4 py-3 font-black text-center bg-indigo-900 text-white print:bg-slate-100 print:text-black">{language === 'ar' ? 'صافي الراتب' : 'Net Salary'}</th>
              <th className="border border-slate-300 px-4 py-3 font-black text-center w-36">{language === 'ar' ? 'التوقيع' : 'Signature'}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.id} className="hover:bg-slate-50/50 border-b border-slate-300 transition-colors">
                <td className="border border-slate-300 px-4 py-3 text-center text-slate-500 font-bold">{index + 1}</td>
                <td className="border border-slate-300 px-4 py-3">
                  <p className="font-bold text-slate-900 print:text-black">{row.emp_name_display}</p>
                  <p className="text-xs text-slate-400">#{row.employee_code} {row.job_name ? `— ${row.job_name}` : ''}</p>
                </td>
                <td className="border border-slate-300 px-4 py-3 text-center font-bold text-slate-700 print:text-black">
                  {parseFloat(String(row.emp_sal || 0)).toFixed(2)}
                </td>
                <td className="border border-slate-300 px-4 py-3 text-center font-bold text-emerald-600">
                  {parseFloat(String(row.total_benefits || 0)).toFixed(2)}
                </td>
                <td className="border border-slate-300 px-4 py-3 text-center font-bold text-rose-600">
                  {parseFloat(String(row.total_deduction || 0)).toFixed(2)}
                </td>
                <td className="border border-slate-300 px-4 py-3 text-center font-black text-indigo-900 print:text-black bg-slate-50/50 print:bg-transparent">
                  {parseFloat(String(row.final_the_net || 0)).toFixed(2)}
                </td>
                <td className="border border-slate-300 px-4 py-3 text-center"></td>
              </tr>
            ))}
            {/* Grand Total Row */}
            <tr className="bg-slate-200 text-slate-900 border-t-2 border-slate-800 font-black print:bg-slate-200 print:text-black">
              <td colSpan={2} className="border border-slate-300 px-4 py-3 text-center">{language === 'ar' ? 'الإجمالي العام' : 'GRAND TOTAL'}</td>
              <td className="border border-slate-300 px-4 py-3 text-center">{sumBasic.toFixed(2)}</td>
              <td className="border border-slate-300 px-4 py-3 text-center text-emerald-800 print:text-black">{sumBenefits.toFixed(2)}</td>
              <td className="border border-slate-300 px-4 py-3 text-center text-rose-800 print:text-black">{sumDeductions.toFixed(2)}</td>
              <td className="border border-slate-300 px-4 py-3 text-center bg-indigo-200 text-indigo-950 print:text-black print:bg-transparent">{sumNet.toFixed(2)}</td>
              <td className="border border-slate-300 px-4 py-3"></td>
            </tr>
          </tbody>
        </table>

        {/* Bottom Signatures Area */}
        <div className="flex justify-between items-end pt-12 mt-12 border-t border-slate-300">
          <div className="text-center w-48">
            <p className="text-xs font-black text-slate-800 mb-8">{t('financial_officer_accountant')}</p>
            <div className="border-b border-slate-400"></div>
          </div>
          <div className="text-center w-48">
            <p className="text-xs font-black text-slate-800 mb-8">{t('hr_manager')}</p>
            <div className="border-b border-slate-400"></div>
          </div>
          <div className="text-center w-48">
            <p className="text-xs font-black text-slate-800 mb-8">{language === 'ar' ? 'المدير العام' : 'General Manager'}</p>
            <div className="border-b border-slate-400"></div>
          </div>
        </div>
      </div>

      {/* Global Portrait Print Style */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: portrait;
            margin: 10mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
    </div>
  );
}
