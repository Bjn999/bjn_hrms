'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';

const API = 'http://localhost:8000/api/admin';

const MONTHS_AR: Record<number, string> = {
  1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
  5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
  9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
};

export default function SalaryRecordsDetailPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const params = useParams();
  const router = useRouter();
  const monthId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [financeMonth, setFinanceMonth] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  const [nothavesal, setNothavesal] = useState(0);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add salary modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/employee-salaries/${monthId}`, { headers: headers() });
      const result = await res.json();
      if (result.status) {
        setFinanceMonth(result.finance_month);
        setData(result.data || []);
        setAvailableEmployees(result.available_employees || []);
        setNothavesal(result.nothavesal || 0);
        setIsMonthOpen(result.finance_month?.is_open == 1);
      } else {
        showToast(result.message, 'error');
        router.push('/admin/employee-salaries');
      }
    } catch {
      showToast('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddSalary = async () => {
    if (!selectedEmployee) { showToast('يرجى اختيار الموظف', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/employee-salaries`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ finance_month_id: monthId, employee_code: selectedEmployee }),
      });
      const result = await res.json();
      if (result.status) {
        showToast('تم إضافة راتب الموظف بنجاح', 'success');
        setShowAddModal(false);
        setSelectedEmployee('');
        fetchData();
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast('حدث خطأ في الاتصال', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({ title: t('confirm_delete_title'), description: 'هل أنت متأكد من حذف راتب هذا الموظف؟', icon: 'danger' });
    if (!ok) return;
    try {
      const res = await fetch(`${API}/employee-salaries/${id}`, { method: 'DELETE', headers: headers() });
      const result = await res.json();
      if (result.status) { showToast(t('delete_success'), 'success'); fetchData(); }
      else showToast(result.message, 'error');
    } catch {
      showToast('حدث خطأ في الاتصال', 'error');
    }
  };

  const handleArchive = async (id: number) => {
    const ok = await confirm({ title: 'تأكيد الأرشفة', description: 'هل أنت متأكد من أرشفة راتب هذا الموظف؟ ستُغلق جميع الجزاءات والخصومات والغياب المرتبطة.', icon: 'warning' });
    if (!ok) return;
    try {
      const res = await fetch(`${API}/employee-salaries/${id}/archive`, { method: 'POST', headers: headers() });
      const result = await res.json();
      if (result.status) { showToast('تم أرشفة الراتب بنجاح', 'success'); fetchData(); }
      else showToast(result.message, 'error');
    } catch {
      showToast('حدث خطأ في الاتصال', 'error');
    }
  };

  const handleStop = async (id: number, currentlyStopped: boolean) => {
    const action = currentlyStopped ? 'resume' : 'stop';
    const msg = currentlyStopped ? 'هل تريد تفعيل هذا الراتب؟' : 'هل تريد إيقاف هذا الراتب؟';
    const ok = await confirm({ title: 'تأكيد', description: msg, icon: 'warning' });
    if (!ok) return;
    try {
      const res = await fetch(`${API}/employee-salaries/${id}/${action}`, { method: 'POST', headers: headers() });
      const result = await res.json();
      if (result.status) { showToast(result.message, 'success'); fetchData(); }
      else showToast(result.message, 'error');
    } catch {
      showToast('حدث خطأ في الاتصال', 'error');
    }
  };

  const filteredData = data.filter((item: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const empName = item.employee?.emp_name?.toLowerCase() || '';
    const empCode = item.employee_code?.toString() || '';
    const isArchived = item.is_archived == 1 ? 'مؤرشف' : 'غير مؤرشف';
    const isStoped = item.is_stoped == 1 ? 'موقوف' : 'ساري';
    const finalNet = item.final_the_net?.toString() || '';
    const totalBenefits = item.total_benefits?.toString() || '';
    const totalDeduction = item.total_deduction?.toString() || '';
    
    return empName.includes(query) || empCode.includes(query) || isArchived.includes(query) || isStoped.includes(query) || finalNet.includes(query) || totalBenefits.includes(query) || totalDeduction.includes(query);
  });

  const totalBenefits = filteredData.reduce((s: number, r: any) => s + parseFloat(r.total_benefits || 0), 0);
  const totalDeduction = filteredData.reduce((s: number, r: any) => s + parseFloat(r.total_deduction || 0), 0);
  const totalNet = filteredData.reduce((s: number, r: any) => s + parseFloat(r.final_the_net || 0), 0);

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/employee-salaries" className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h2 className="text-2xl font-black text-slate-800">سجلات الرواتب</h2>
          </div>
          {financeMonth && (
            <div className="flex items-center gap-3 flex-wrap mr-10">
              <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-lg text-sm font-bold">
                السنة المالية: {financeMonth.finance_yr}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                {MONTHS_AR[financeMonth.month_id]} — {financeMonth.start_date_m} إلى {financeMonth.end_date_m}
              </span>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${isMonthOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                {isMonthOpen ? 'مفتوح' : 'مغلق'}
              </span>
            </div>
          )}
        </div>
        {isMonthOpen && nothavesal > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            إضافة راتب موظف
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-lg text-xs">{nothavesal}</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'إجمالي الموظفين', value: filteredData.length, color: 'text-violet-700', bg: 'bg-violet-50', icon: <svg className="w-6 h-6 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
          { label: 'إجمالي الاستحقاقات', value: totalBenefits.toFixed(2), color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
          { label: 'إجمالي الخصومات', value: totalDeduction.toFixed(2), color: 'text-rose-700', bg: 'bg-rose-50', icon: <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg> },
          { label: 'الصافي النهائي', value: totalNet.toFixed(2), color: 'text-blue-700', bg: 'bg-blue-50', icon: <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs text-slate-500 font-bold">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder_comprehensive')}
            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500/20 outline-none text-slate-700 font-bold transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-violet-500 to-purple-600"></div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-100">
              <tr>
                <th className="px-4 py-4 font-bold text-xs uppercase tracking-wider">الموظف</th>
                <th className="px-4 py-4 font-bold text-xs uppercase tracking-wider">الراتب الأساسي</th>
                <th className="px-4 py-4 font-bold text-xs uppercase tracking-wider">الاستحقاقات</th>
                <th className="px-4 py-4 font-bold text-xs uppercase tracking-wider">الخصومات</th>
                <th className="px-4 py-4 font-bold text-xs uppercase tracking-wider">الصافي</th>
                <th className="px-4 py-4 font-bold text-xs uppercase tracking-wider">الحالة</th>
                <th className="px-4 py-4 font-bold text-xs uppercase tracking-wider text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row: any) => {
                const isArchived = row.is_archived == 1;
                const isStopped = row.is_stoped == 1;
                const canAct = isMonthOpen && !isArchived;
                return (
                  <tr key={row.id} className={`border-b border-slate-50 transition-colors ${isArchived ? 'opacity-60 bg-slate-50/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-800">{row.emp_name_display || row.employee_code}</p>
                      <p className="text-xs text-slate-400">{row.employee_code}</p>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-700">{parseFloat(row.emp_sal || 0).toFixed(2)}</td>
                    <td className="px-4 py-4 font-bold text-emerald-600">{parseFloat(row.total_benefits || 0).toFixed(2)}</td>
                    <td className="px-4 py-4 font-bold text-rose-600">{parseFloat(row.total_deduction || 0).toFixed(2)}</td>
                    <td className="px-4 py-4 font-black text-blue-700">{parseFloat(row.final_the_net || 0).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {isArchived ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold w-fit bg-slate-200 text-slate-600">مؤرشف</span>
                        ) : isStopped ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold w-fit bg-rose-100 text-rose-700">موقوف</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold w-fit bg-emerald-100 text-emerald-700">نشط</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        <Link
                          href={`/admin/employee-salaries/details/${row.id}`}
                          className="p-2 rounded-lg text-violet-500 hover:bg-violet-50 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        {canAct && !isStopped && (
                          <button onClick={() => handleArchive(row.id)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" title="أرشفة الراتب">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                          </button>
                        )}
                        {canAct && (
                          <button onClick={() => handleStop(row.id, isStopped)} className={`p-2 rounded-lg transition-colors ${isStopped ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'}`} title={isStopped ? 'تفعيل الراتب' : 'إيقاف الراتب'}>
                            {isStopped ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                          </button>
                        )}
                        {canAct && !isStopped && (
                          <button onClick={() => handleDelete(row.id)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors" title="حذف">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-slate-500 font-bold">لا توجد سجلات رواتب لهذا الشهر</p>
              {isMonthOpen && nothavesal > 0 && (
                <button onClick={() => setShowAddModal(true)} className="mt-4 bg-violet-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-violet-600 transition-all text-sm">
                  إضافة راتب موظف
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Salary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800">إضافة راتب موظف</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">اختر الموظف *</label>
              <select
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="">-- اختر موظفاً --</option>
                {availableEmployees.map((e: any) => (
                  <option key={e.employee_code} value={e.employee_code}>
                    {e.emp_name} ({e.employee_code}) — راتب: {parseFloat(e.emp_sal || 0).toFixed(2)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-2">يُعرض فقط الموظفون الذين لا يملكون سجلاً في هذا الشهر</p>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">{t('cancel')}</button>
              <button
                onClick={handleAddSalary}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-60"
              >
                {saving ? 'جاري الإضافة...' : t('add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
