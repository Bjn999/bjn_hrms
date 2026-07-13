'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface PermanentLoanPrintItem {
  id: number;
  employee_code: string;
  total: string | number;
  installment_value: string | number;
  paid_amount?: string | number;
  remaining_amount?: string | number;
  is_disbursed?: number;
  is_archived?: number;
  employee?: {
    emp_name: string;
  };
}

export default function PermanentLoansPrintPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PermanentLoanPrintItem[]>([]);
  const [settings, setSettings] = useState<{ company_name?: string; address?: string; image?: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

        const res = await fetch(`${API}/permanent-loans`, { headers });
        const result = await res.json();

        const setRes = await fetch(`${API}/generalSettings`, { headers });
        const setResult = await setRes.json();
        if (setResult.status) {
          setSettings(setResult.data);
        }
        if (result.status) {
          setData(result.data || []);
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
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="bg-white min-h-screen p-8 text-black" dir={t('dir') || 'rtl'}>
      {/* Print Header */}
      <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
        {/* Right Section: Company Info & Report Name */}
        <div className="text-right w-1/3">
          <h1 className="text-2xl font-black text-black">{settings?.company_name || t('hrms_title')}</h1>
          {settings?.address && <p className="text-sm font-bold text-gray-600 mt-1">{settings.address}</p>}
          <h2 className="text-xl font-bold mt-2">{t('permanent_loans_report')}</h2>
        </div>

        {/* Center Section: Company Logo */}
        <div className="text-center w-1/3 flex justify-center">
          {settings?.image ? (
            <img src={`${process.env.NEXT_PUBLIC_UPLOAD_URL || ''}/${settings.image}`} alt="Company Logo" className="max-h-24 object-contain" />
          ) : (
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-800">
              <svg className="w-10 h-10 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
          )}
        </div>

        {/* Left Section: Print Info & Finance Month */}
        <div className="text-left w-1/3">
          <p className="text-sm font-bold">{t('print_date')}: {new Date().toLocaleDateString('ar-EG')}</p>
          <p className="text-sm font-bold mt-1 mb-2">{t('print_time')}: {new Date().toLocaleTimeString('ar-EG')}</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm border-collapse border border-black text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2 font-bold">{t('seq_number')}</th>
            <th className="border border-black p-2 font-bold">{t('employee_name')}</th>
            <th className="border border-black p-2 font-bold">{t('total_amount')}</th>
            <th className="border border-black p-2 font-bold">{t('monthly_installment')}</th>
            <th className="border border-black p-2 font-bold">{t('paid_amount')}</th>
            <th className="border border-black p-2 font-bold">{t('remaining_amount')}</th>
            <th className="border border-black p-2 font-bold">{t('status')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const isDisbursed = item.is_disbursed == 1 || item.is_archived == 1;
            return (
              <tr key={item.id}>
                <td className="border border-black p-2">{index + 1}</td>
                <td className="border border-black p-2 font-bold">
                  <span className="text-gray-500 ml-1">({item.employee_code})</span>
                  {item.employee?.emp_name || ''}
                </td>
                <td className="border border-black p-2">{parseFloat(String(item.total)).toFixed(2)} {t('currency')}</td>
                <td className="border border-black p-2">{parseFloat(String(item.installment_value)).toFixed(2)} {t('currency')}</td>
                <td className="border border-black p-2">{parseFloat(String(item.paid_amount || 0)).toFixed(2)} {t('currency')}</td>
                <td className="border border-black p-2">{parseFloat(String(item.remaining_amount || item.total)).toFixed(2)} {t('currency')}</td>
                <td className="border border-black p-2">{isDisbursed ? t('ended') : t('active_loan')}</td>
              </tr>
            );
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan={8} className="border border-black p-4 text-center">{t('no_permanent_loans_found')}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Print Footer */}
      <div className="mt-16 flex justify-between px-10">
        <div className="text-center">
          <p className="font-bold mb-8">{t('financial_officer_accountant')}</p>
          <p>........................</p>
        </div>
        <div className="text-center">
          <p className="font-bold mb-8">{t('hr_manager')}</p>
          <p>........................</p>
        </div>
        <div className="text-center">
          <p className="font-bold mb-8">{t('general_manager')}</p>
          <p>........................</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
            -webkit-print-color-adjust: exact;
          }
          nav, sidebar, button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
