'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams } from 'next/navigation';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { FinanceMonth, Attendance, Employee } from '@/types';

interface GeneralSettings {
  company_name?: string;
  address?: string;
  image?: string;
}

const API = (process.env.NEXT_PUBLIC_API_URL || '') + '/admin';

const STATUS_TEXTS: Record<number, string> = {
  1: 'حضور كامل',
  2: 'غياب',
  3: 'تأخير',
  4: 'انصراف مبكر',
  5: 'إجازة',
};

export default function EmployeeAttendancePrintPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const monthId = params?.id as string;
  const employeeCode = params?.employee_code as string;

  const [loading, setLoading] = useState(true);
  const [financeMonth, setFinanceMonth] = useState<FinanceMonth | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [data, setData] = useState<Attendance[]>([]);
  const [settings, setSettings] = useState<GeneralSettings | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
        
        const res = await fetch(`${API}/attendances/${monthId}/employee/${employeeCode}`, { headers });
        const result = await res.json();
        
        const setRes = await fetch(`${API}/generalSettings`, { headers });
        const setResult = await setRes.json();
        if (setResult.status) {
          setSettings(setResult.data);
        }
        if (result.status) {
          setData(result.data || []);
          setEmployee(result.employee);
          setFinanceMonth(result.finance_month);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [monthId, employeeCode]);

  // useEffect(() => {
  //   if (!loading && financeMonth && employee) {
  //     setTimeout(() => {
  //       window.print();
  //     }, 500);
  //   }
  // }, [loading, financeMonth, employee]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="bg-white min-h-screen p-8 text-black" dir="rtl">
      {/* Print Header */}
      <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
        {/* Right Section: Company Info & Report Name */}
        <div className="text-right w-1/3">
          <h1 className="text-2xl font-black text-black">{settings?.company_name || 'نظام إدارة الموارد البشرية'}</h1>
          {settings?.address && <p className="text-sm font-bold text-gray-600 mt-1">{settings.address}</p>}
          <h2 className="text-xl font-bold mt-2">سجل بصمات الموظف</h2>
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

      {/* Employee Details Panel */}
      <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="font-bold text-gray-500 block">كود الموظف:</span>
          <span className="font-black text-black">#{employee?.employee_code}</span>
        </div>
        <div>
          <span className="font-bold text-gray-500 block">اسم الموظف:</span>
          <span className="font-black text-black">{employee?.emp_name}</span>
        </div>
        <div>
          <span className="font-bold text-gray-500 block">الإدارة / الفرع:</span>
          <span className="font-bold text-black">{employee?.department?.name || '-'} / {employee?.branch?.name || '-'}</span>
        </div>
        <div>
          <span className="font-bold text-gray-500 block">الوظيفة:</span>
          <span className="font-bold text-black">{employee?.job?.name || '-'}</span>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm border-collapse border border-black text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2 font-bold w-12">م</th>
            <th className="border border-black p-2 font-bold">{t('attendance_date')}</th>
            <th className="border border-black p-2 font-bold">{t('attendance_status')}</th>
            <th className="border border-black p-2 font-bold">{t('check_in_time')}</th>
            <th className="border border-black p-2 font-bold">{t('check_out_time')}</th>
            <th className="border border-black p-2 font-bold">{t('total_actual_hours')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id}>
              <td className="border border-black p-2">{index + 1}</td>
              <td className="border border-black p-2 font-bold">{item.attendance_date}</td>
              <td className="border border-black p-2">{STATUS_TEXTS[item.attendance_status] || 'أخرى'}</td>
              <td className="border border-black p-2">{item.check_in || '-'}</td>
              <td className="border border-black p-2">{item.check_out || '-'}</td>
              <td className="border border-black p-2 font-bold">{item.total_hours || '0'}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="border border-black p-4 text-center">لا توجد سجلات حضور لهذا الموظف في هذا الشهر</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Print Footer */}
      <div className="mt-16 flex justify-between px-10">
        <div className="text-center">
          <p className="font-bold mb-8">توقيع الموظف</p>
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
