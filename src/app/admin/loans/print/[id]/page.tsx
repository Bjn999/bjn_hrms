'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { FinanceMonth, Loan } from '@/types';

interface GeneralSettings {
  company_name?: string;
  address?: string;
  image?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function LoansPrintPage() {
  const { t } = useLanguage();
  const params = useParams();
  const monthId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [financeMonth, setFinanceMonth] = useState<FinanceMonth | null>(null);
  const [data, setData] = useState<Loan[]>([]);
  const [settings, setSettings] = useState<GeneralSettings | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
        
        const res = await fetch(`${API}/loans/${monthId}`, { headers });
        const result = await res.json();
        
        
        const setRes = await fetch(`${API}/generalSettings`, { headers });
        const setResult = await setRes.json();
        if (setResult.status) {
          setSettings(setResult.data);
        }
        if (result.status) {
          setData(result.loans || []);
          setFinanceMonth(result.finance_month);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [monthId]);

  useEffect(() => {
    if (!loading && financeMonth) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, financeMonth]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="bg-white min-h-screen p-8 text-black" dir="rtl">
      {/* Print Header */}
      <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
        {/* Right Section: Company Info & Report Name */}
        <div className="text-right w-1/3">
          <h1 className="text-2xl font-black text-black">{settings?.company_name || 'نظام إدارة الموارد البشرية'}</h1>
          {settings?.address && <p className="text-sm font-bold text-gray-600 mt-1">{settings.address}</p>}
          <h2 className="text-xl font-bold mt-2">كشف السلف الشهرية للموظفين</h2>
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
          <p className="text-sm font-bold">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
          <p className="text-sm font-bold mt-1 mb-2">وقت الطباعة: {new Date().toLocaleTimeString('ar-EG')}</p>
          {financeMonth && (
            <p className="text-sm font-bold bg-gray-100 inline-block px-3 py-1 rounded-lg border border-gray-300">
              للشهر المالي: {financeMonth.month?.name} لسنة {financeMonth.finance_yr}
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm border-collapse border border-black text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2 font-bold">م</th>
            <th className="border border-black p-2 font-bold">{t('employee_name')}</th>
            <th className="border border-black p-2 font-bold">قيمة السلفة</th>
            <th className="border border-black p-2 font-bold w-1/4">{t('notes')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id}>
              <td className="border border-black p-2">{index + 1}</td>
              <td className="border border-black p-2 font-bold">
                <span className="text-gray-500 ml-1">({item.employee_code})</span>
                {item.employee?.emp_name || ''}
              </td>
              <td className="border border-black p-2">{parseFloat(String(item.total)).toFixed(2)} {t('currency')}</td>
              <td className="border border-black p-2 max-w-[200px] break-words whitespace-pre-wrap">{item.notes || '-'}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="border border-black p-4 text-center">لا توجد بيانات لهذا الشهر</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Print Footer */}
      <div className="mt-16 flex justify-between px-10">
        <div className="text-center">
          <p className="font-bold mb-8">توقيع المحاسب</p>
          <p>........................</p>
        </div>
        <div className="text-center">
          <p className="font-bold mb-8">توقيع مدير الموارد البشرية</p>
          <p>........................</p>
        </div>
        <div className="text-center">
          <p className="font-bold mb-8">الاعتماد</p>
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
