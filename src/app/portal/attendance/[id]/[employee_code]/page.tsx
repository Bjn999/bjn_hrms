'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { FinanceMonth, Attendance, Employee } from '@/types';

const API = (process.env.NEXT_PUBLIC_API_URL || '') + '/admin';

export default function EmployeeAttendancePage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const params = useParams();
  const monthId = params?.id as string;
  const employeeCode = params?.employee_code as string;

  const [loading, setLoading] = useState(true);
  const [financeMonth, setFinanceMonth] = useState<FinanceMonth | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [extracting, setExtracting] = useState(false);

  const getDayName = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long' });
  };

  const handleExtractEmployee = async () => {
    setExtracting(true);
    try {
      const res = await fetch(`${API}/attendances/${monthId}/employee/${employeeCode}/extract`, {
        method: 'POST',
        headers: headers(),
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
      setExtracting(false);
    }
  };

  // Raw logs Modal
  const [showRawLogsModal, setShowRawLogsModal] = useState(false);
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  const [loadingRawLogs, setLoadingRawLogs] = useState(false);

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/attendances/${monthId}/employee/${employeeCode}`, { headers: headers() });
      const result = await res.json();
      if (result.status) {
        setAttendances(result.data || []);
        setEmployee(result.employee);
        setFinanceMonth(result.finance_month);
        setIsMonthOpen(result.finance_month?.is_open == 1);
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [monthId, employeeCode]);

  const fetchRawLogs = async () => {
    setLoadingRawLogs(true);
    try {
      const res = await fetch(`${API}/attendance-raw-logs?employee_code=${employeeCode}&finance_months_periods_id=${monthId}`, { headers: headers() });
      const result = await res.json();
      if (result.status) {
        setRawLogs(result.data || []);
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setLoadingRawLogs(false);
    }
  };

  const openRawLogsModal = () => {
    setShowRawLogsModal(true);
    fetchRawLogs();
  };
  const getStatusBadge = (status: number) => {
    const statuses: Record<number, { text: string; css: string }> = {
      1: { text: 'حضور كامل', css: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      2: { text: 'غياب', css: 'bg-rose-50 text-rose-700 border-rose-200' },
      3: { text: 'تأخير', css: 'bg-amber-50 text-amber-700 border-amber-200' },
      4: { text: 'انصراف مبكر', css: 'bg-orange-50 text-orange-700 border-orange-200' },
      5: { text: 'إجازة', css: 'bg-blue-50 text-blue-700 border-blue-200' },
    };
    const s = statuses[status] || { text: 'أخرى', css: 'bg-slate-50 text-slate-700 border-slate-200' };
    return <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${s.css}`}>{s.text}</span>;
  };

  const filteredAttendances = attendances.filter((a: Attendance) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const dateStr = a.attendance_date || '';
    return dateStr.includes(query);
  });

  const handleExportExcel = () => {
    const STATUS_TEXTS: Record<number, string> = {
      1: 'حضور كامل',
      2: 'غياب',
      3: 'تأخير',
      4: 'انصراف مبكر',
      5: 'إجازة',
    };

    const headersList = [
      t('attendance_date'),
      t('attendance_status'),
      t('check_in_time'),
      t('check_out_time'),
      t('total_actual_hours')
    ];

    const rows = filteredAttendances.map((item: Attendance) => [
      item.attendance_date,
      STATUS_TEXTS[item.attendance_status] || 'أخرى',
      item.check_in || '-',
      item.check_out || '-',
      item.total_hours || '0'
    ]);

    // إنشاء محتوى مفصول بتبويبات (Tabs) وسطور جديدة بـ CRLF
    const tsvContent = [
      headersList.join('\t'),
      ...rows.map(r => r.join('\t'))
    ].join('\r\n');

    // تحويل النصوص إلى ترميز UTF-16 Little Endian
    const buffer = new ArrayBuffer(tsvContent.length * 2 + 2);
    const view = new DataView(buffer);
    
    // كتابة الـ BOM الخاص بالـ UTF-16 LE (0xFF, 0xFE)
    view.setUint16(0, 0xFEFF, true);
    
    // كتابة الأحرف
    for (let i = 0; i < tsvContent.length; i++) {
      view.setUint16((i + 1) * 2, tsvContent.charCodeAt(i), true);
    }

    const blob = new Blob([buffer], { type: 'text/csv;charset=utf-16le;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `حضور_${employee?.emp_name || ''}_${financeMonth?.finance_yr || ''}_${financeMonth?.month?.name || ''}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href={`/portal/attendance/${monthId}`} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h2 className="text-2xl font-black text-slate-800">
              سجل بصمات: <span className="text-indigo-600">{employee?.emp_name}</span> (#{employee?.employee_code})
            </h2>
          </div>
          {financeMonth && (
            <div className="flex items-center gap-3 flex-wrap mr-10">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">
                {t('finance_year')}: {financeMonth.finance_yr}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                {financeMonth.start_date_m} — {financeMonth.end_date_m}
              </span>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${isMonthOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {isMonthOpen ? t('month_open') : t('month_closed')}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            تصدير إلى إكسل
          </button>
          <Link
            href={`/portal/attendance/${monthId}/${employeeCode}/print`}
            target="_blank"
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            {t('print')}
          </Link>
          <button
            onClick={openRawLogsModal}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            سجلات البصمة الخام
          </button>
          {isMonthOpen && (
            <button
              onClick={handleExtractEmployee}
              disabled={extracting}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-600/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {extracting ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              )}
              {extracting ? 'جاري الاستخراج...' : 'استخراج البصمات'}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">{t('stats_movements_count')}</p>
            <p className="text-2xl font-black text-slate-800">{attendances.length}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث بالتاريخ..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-10 outline-none text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium"
          />
          <svg className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-purple-500"></div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">{t('attendance_date')}</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">{t('attendance_status')}</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">{t('check_in_time')}</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">{t('check_out_time')}</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">{t('total_actual_hours')}</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">المدخل</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendances.map((item: Attendance) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-slate-600 font-medium">
                    {item.attendance_date}
                    <span className="text-slate-400 text-xs mr-2 ml-2 font-bold">
                      ({getDayName(item.attendance_date)})
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 font-medium">{getStatusBadge(item.attendance_status)}</td>
                  <td className="px-5 py-4 text-slate-600 font-medium">{item.check_in || '-'}</td>
                  <td className="px-5 py-4 text-slate-600 font-medium">{item.check_out || '-'}</td>
                  <td className="px-5 py-4 text-slate-700 font-bold">{item.total_hours || '0'}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    <div>{item.added_by_admin?.name}</div>
                    <div className="text-[10px] text-slate-400">{item.created_at}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAttendances.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 font-bold">لا توجد سجلات حضور مطابقة</p>
            </div>
          )}
        </div>
      </div>

      {/* Raw Logs Modal */}
      {showRawLogsModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-100 overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-black">سجلات البصمة الخام للموظف</h3>
              <button onClick={() => setShowRawLogsModal(false)} className="hover:bg-white/10 p-1.5 rounded-xl transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto font-sans">
              {loadingRawLogs ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <svg className="animate-spin h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-slate-500 font-bold">جاري تحميل سجلات البصمة الخام...</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">التاريخ</th>
                        <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">الوقت</th>
                        <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">نوع البصمة</th>
                        <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">الاضافة بواسطة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawLogs.map((log: any) => {
                        const dateTimeParts = log.actionDateTime ? log.actionDateTime.split(' ') : ['', ''];
                        const date = dateTimeParts[0];
                        const time = dateTimeParts[1];
                        
                        return (
                          <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4 text-slate-600 font-medium">{date}</td>
                            <td className="px-5 py-4 text-slate-600 font-medium">{time}</td>
                            <td className="px-5 py-4 text-slate-600 font-medium">
                              {log.actionType === 1 ? (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200">حضور</span>
                              ) : log.actionType === 2 ? (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-rose-50 text-rose-700 border-rose-200">انصراف</span>
                              ) : (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-slate-50 text-slate-700 border-slate-200">غير معروف</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-slate-500 text-xs">
                              {log.added_by_admin?.name || 'تلقائي / جهاز'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {rawLogs.length === 0 && (
                    <div className="text-center py-20">
                      <p className="text-slate-500 font-bold">لا توجد سجلات بصمة خام متوفرة لهذا الموظف</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowRawLogsModal(false)}
                className="px-6 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
