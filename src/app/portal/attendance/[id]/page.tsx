'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { FinanceMonth, Employee } from '@/types';

const API = (process.env.NEXT_PUBLIC_API_URL || '') + '/admin';

export default function AttendanceMonthEmployeesPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const params = useParams();
  const monthId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [financeMonth, setFinanceMonth] = useState<FinanceMonth | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [lastImport, setLastImport] = useState<string | null>(null);
  const [lastFingerprintDate, setLastFingerprintDate] = useState<string | null>(null);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/attendances/${monthId}`, { headers: headers() });
      const result = await res.json();
      if (result.status) {
        setEmployees(result.employees || []);
        setFinanceMonth(result.finance_month);
        setLastImport(result.last_import);
        setLastFingerprintDate(result.last_fingerprint_date);
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
    if (monthId) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthId]);

  const handleSyncBioTime = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API}/attendances/${monthId}/sync-biotime`, {
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
      setSyncing(false);
    }
  };

  const handleExtractMonth = async () => {
    setExtracting(true);
    try {
      const res = await fetch(`${API}/attendances/${monthId}/extract`, {
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

  // Extract unique branches and departments for filters
  const branches = Array.from(
    new Set(
      employees
        .map((e) => e.branch?.name)
        .filter((name): name is string => typeof name === 'string' && name.trim() !== '')
    )
  );

  const departments = Array.from(
    new Set(
      employees
        .map((e) => e.department?.name)
        .filter((name): name is string => typeof name === 'string' && name.trim() !== '')
    )
  );

  const filteredEmployees = employees.filter((emp: Employee) => {
    const matchesSearch =
      emp.emp_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code.toString().includes(searchQuery) ||
      (emp.zketo_code && emp.zketo_code.toString().includes(searchQuery));

    const matchesBranch = selectedBranch === 'all' || emp.branch?.name === selectedBranch;
    const matchesDepartment = selectedDepartment === 'all' || emp.department?.name === selectedDepartment;

    return matchesSearch && matchesBranch && matchesDepartment;
  });

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/portal/attendance"
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-2xl font-black text-slate-800">
              سجلات البصمة للشهر المالي: <span className="text-indigo-600">{financeMonth?.month?.name_en || financeMonth?.month?.name || ''}</span>
            </h2>
          </div>
          {financeMonth && (
            <div className="flex items-center gap-3 flex-wrap mr-10">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">
                السنة المالية: {financeMonth.finance_yr}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                الفترة: {financeMonth.start_date_m} — {financeMonth.end_date_m}
              </span>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  financeMonth.is_open === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {financeMonth.is_open === 1 ? 'مفتوح' : 'مغلق'}
              </span>
            </div>
          )}
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {financeMonth?.is_open === 1 && (
            <>
              {/* Sync BioTime */}
              <button
                onClick={handleSyncBioTime}
                disabled={syncing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {syncing ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18m0 0V2" />
                  </svg>
                )}
                {syncing ? 'جاري المزامنة...' : 'مزامنة جهاز البصمة'}
              </button>

              {/* Import Excel */}
              <Link
                href={`/portal/attendance/${monthId}/import`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                استيراد من إكسل
              </Link>

              {/* Extract Month */}
              <button
                onClick={handleExtractMonth}
                disabled={extracting}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-600/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {extracting ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {extracting ? 'جاري استخراج وحساب البصمات...' : 'استخراج وحساب البصمات'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Employees */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">إجمالي الموظفين</p>
            <p className="text-2xl font-black text-slate-800">{employees.length}</p>
          </div>
        </div>

        {/* Last Upload Date */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">آخر استيراد إكسل</p>
            <p className="text-base font-black text-slate-800">{lastImport || 'لا يوجد سجلات'}</p>
          </div>
        </div>

        {/* Last Fingerprint Date */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">تاريخ آخر حركة بصمة</p>
            <p className="text-base font-black text-slate-800">{lastFingerprintDate || 'لا يوجد سجلات'}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="بحث بالاسم، كود الموظف، أو رقم البصمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-10 outline-none text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium text-sm"
            />
            <svg className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-bold transition-all text-sm"
              >
                <option value="all">كل الفروع</option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-bold transition-all text-sm"
              >
                <option value="all">كل الإدارات</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative animate-fade-in">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-purple-500"></div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">كود الموظف</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">رقم البصمة</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">اسم الموظف</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">الفرع / الإدارة</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">الوظيفة</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">الحالة</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp: Employee) => (
                <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-slate-700">#{emp.employee_code}</td>
                  <td className="px-5 py-4 text-slate-600 font-medium">{emp.zketo_code || '-'}</td>
                  <td className="px-5 py-4 font-bold text-slate-800">{emp.emp_name}</td>
                  <td className="px-5 py-4 text-slate-600 font-medium">
                    <div>{emp.branch?.name || '-'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{emp.department?.name || '-'}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 font-medium">{emp.job?.name || '-'}</td>
                  <td className="px-5 py-4">
                    {emp.functional_status === 1 ? (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        في الخدمة
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                        خارج الخدمة
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Link
                      href={`/portal/attendance/${monthId}/${emp.employee_code}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors font-bold text-xs"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      عرض سجل البصمات
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 font-bold">لا يوجد موظفون مطابقون لخيارات البحث</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}