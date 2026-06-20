'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

const API = 'http://localhost:8000/api/admin';

export default function SanctionsDaysPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [data, setData] = useState<any[]>([]);
  const [financeYears, setFinanceYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const params = filterYear !== 'all' ? `?finance_yr=${filterYear}` : '';
      // We use the same salary-records endpoint because it returns the perfectly formatted finance months list
      const res = await fetch(`${API}/sanctions${params}`, {
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

  useEffect(() => { fetchData(); }, [filterYear]);

  const getMonthLabel = (item: any) => {
    const months: Record<number, string> = {
      1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل', 5: 'مايو', 6: 'يونيو',
      7: 'يوليو', 8: 'أغسطس', 9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
    };
    return months[item.month_id] || item.month_id;
  };

  const getRowAction = (item: any) => {
    if (item.is_open == 2) return 'archived';
    if (item.is_open == 1) return 'view';
    return 'pending'; // Sanctions shouldn't be "opened" from here, just viewed or pending.
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('sanctions_days_title')}</h2>
          <p className="text-slate-500 mt-1 text-sm">{t('sanctions_days_desc')}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">{t('finance_year')}</label>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-700 font-bold transition-all"
            >
              {financeYears.map((y: any) => (
                <option key={y.finance_yr} value={y.finance_yr}>{y.finance_yr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-emerald-500 to-teal-400"></div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">اسم الشهر عربي</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">تاريخ البداية</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">تاريخ النهاية</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">بداية البصمة</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">نهاية البصمة</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">عدد الأيام</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider text-center">حالة الشهر</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: any) => {
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
                              href={`/admin/sanctions/${item.id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors font-bold text-xs"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              عرض
                            </Link>
                          </>
                        ) : item.is_open == 2 ? (
                          <>
                            <span className="font-bold text-rose-600">مغلق</span>
                            <Link
                              href={`/admin/sanctions/${item.id}`}
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
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <p className="text-slate-500 font-bold">{t('no_sanctions_found')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
