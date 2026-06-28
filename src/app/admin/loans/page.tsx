'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { FinanceMonth, FinanceCalendar } from '@/types';

interface LoansMonth extends FinanceMonth {
  start_date_for_pasma?: string;
  end_date_for_pasma?: string;
  number_of_days?: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function LoansPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [data, setData] = useState<LoansMonth[]>([]);
  const [financeYears, setFinanceYears] = useState<FinanceCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = filterYear !== 'all' ? `?finance_yr=${filterYear}` : '';
      const res = await fetch(`${API}/loans${params}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const result = await res.json();
      if (result.status) {
        setData(result.data || []);
        setFinanceYears(result.finance_years || []);
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear]);

  const getMonthLabel = (item: LoansMonth) => {
    const months: Record<number, string> = {
      1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل', 5: 'مايو', 6: 'يونيو',
      7: 'يوليو', 8: 'أغسطس', 9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
    };
    const mid = item.month_id;
    return (mid !== undefined ? months[mid] : '') || mid || '';
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">السلف الشهرية</h2>
          <p className="text-slate-500 mt-1 text-sm">إدارة وعرض السلف الشهرية للموظفين حسب الأشهر المالية</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">السنة المالية</label>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 outline-none text-slate-700 font-bold transition-all"
            >
              {/* <option value="all">الكل</option> */}
              {financeYears.map((y: FinanceCalendar) => (
                <option key={y.finance_yr} value={y.finance_yr}>{y.finance_yr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-sky-500 to-blue-400"></div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">اسم الشهر المالي</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">تاريخ البداية</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">تاريخ النهاية</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">بداية البصمة</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">نهاية البصمة</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">عدد الأيام</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider text-center">عرض السلف</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: LoansMonth) => {
                return (
                  <tr key={item.id} className={`border-b border-slate-50 transition-colors ${item.is_open == 2 ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-5 py-4 font-bold text-slate-800">{getMonthLabel(item)}</td>
                    <td className="px-5 py-4 text-slate-600">{item.start_date_m}</td>
                    <td className="px-5 py-4 text-slate-600">{item.end_date_m}</td>
                    <td className="px-5 py-4 text-slate-600">{item.start_date_for_pasma}</td>
                    <td className="px-5 py-4 text-slate-600">{item.end_date_for_pasma}</td>
                    <td className="px-5 py-4 text-slate-700 font-bold">{item.number_of_days}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {item.is_open == 1 ? (
                          <>
                            <span className="font-bold text-emerald-600">مفتوح</span>
                            <Link
                              href={`/admin/loans/${item.id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors font-bold text-xs"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              عرض
                            </Link>
                          </>
                        ) : item.is_open == 2 ? (
                          <>
                            <span className="font-bold text-rose-600">مؤرشف</span>
                            <Link
                              href={`/admin/loans/${item.id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl transition-colors font-bold text-xs"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              عرض
                            </Link>
                          </>
                        ) : (
                          <span className="font-bold text-slate-500">بانتظار الفتح</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 font-bold">لا توجد بيانات متاحة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
