'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { FinanceMonth, Absence, Employee } from '@/types';

interface AbsenceItem extends Absence {
  value?: number;
  day_price?: number;
}

interface AbsenceEmployee {
  employee_code?: string;
  day_price?: number;
  emp_name?: string;
  employee?: Employee;
}

const API = process.env.NEXT_PUBLIC_API_URL || '';

const emptyForm = {
  finance_month_period_id: '',
  employee_code: '',
  day_price: '',
  value: '',
  notes: '',
};

export default function AbsencesDetailPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const params = useParams();
  const router = useRouter();
  const monthId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [financeMonth, setFinanceMonth] = useState<FinanceMonth | null>(null);
  const [absences, setAbsences] = useState<AbsenceItem[]>([]);
  const [employees, setEmployees] = useState<AbsenceEmployee[]>([]);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');



  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/absences/${monthId}`, { headers: headers() });
      const result = await res.json();
      if (result.status) {
        setFinanceMonth(result.finance_month);
        setAbsences(result.absences || []);
        setEmployees(result.employees || []);
        const fm = result.finance_month;
        setIsMonthOpen(fm?.is_open == 1);
      } else {
        showToast(result.message, 'error');
        router.push('/admin/absences');
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
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, finance_month_period_id: monthId });
    setShowModal(true);
  };

  const openEditModal = (a: AbsenceItem) => {
    if (a.is_archived == 1) { showToast(t('cannot_edit_archived'), 'error'); return; }
    if (!isMonthOpen) { showToast(t('cannot_edit_closed'), 'error'); return; }
    setEditingId(a.id);
    setForm({
      finance_month_period_id: monthId,
      employee_code: a.employee_code,
      day_price: String(a.day_price || ''),
      value: String(a.value || ''),
      notes: a.notes || '',
    });
    setShowModal(true);
  };

  const handleEmployeeChange = (code: string) => {
    const emp = employees.find((e: AbsenceEmployee) => e.employee?.employee_code == code || e.employee_code == code);
    const dayPrice = emp?.employee?.day_price || emp?.day_price || '';
    setForm(f => ({ ...f, employee_code: code, day_price: String(dayPrice) }));
  };

  const handleSave = async () => {
    if (!form.employee_code || !form.value || !form.day_price) {
      showToast('يرجى تعبئة جميع الحقول المطلوبة', 'error');
      return;
    }

    if (!editingId) {
      const exists = absences.some((a: AbsenceItem) => String(a.employee_code) === String(form.employee_code));
      if (exists) {
        const ok = await confirm({ title: 'تنبيه', description: 'هذا الموظف لديه سجل غياب بالفعل في هذا الشهر. هل تريد الإضافة على أي حال؟', icon: 'warning' });
        if (!ok) return;
      }
    }

    setSaving(true);
    try {
      const url = editingId ? `${API}/absences/${editingId}` : `${API}/absences`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
      const result = await res.json();
      if (result.status) {
        showToast(editingId ? t('absence_updated') : t('absence_added'), 'success');
        setShowModal(false);
        fetchData();
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a: AbsenceItem) => {
    if (a.is_archived == 1) { showToast(t('cannot_delete_archived'), 'error'); return; }
    if (!isMonthOpen) { showToast(t('cannot_delete_closed'), 'error'); return; }
    const ok = await confirm({ title: t('confirm_delete'), description: 'هل أنت متأكد من حذف سجل الغياب؟', icon: 'danger' });
    if (!ok) return;
    try {
      const res = await fetch(`${API}/absences/${a.id}`, { method: 'DELETE', headers: headers() });
      const result = await res.json();
      if (result.status) { showToast(t('absence_deleted'), 'success'); fetchData(); }
      else showToast(result.message, 'error');
    } catch {
      showToast(t('conn_error'), 'error');
    }
  };

  const filteredAbsences = absences.filter((a: AbsenceItem) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const empName = a.employee?.emp_name?.toLowerCase() || '';
    const empCode = a.employee_code?.toString() || '';
    const notes = a.notes?.toLowerCase() || '';
    const value = a.value?.toString() || '';
    const total = a.total?.toString() || '';
    return empName.includes(query) || empCode.includes(query) || notes.includes(query) || value.includes(query) || total.includes(query);
  });

  const totalDays = filteredAbsences.reduce((s: number, a: AbsenceItem) => s + parseFloat((a.value || 0).toString()), 0);
  const totalAmount = filteredAbsences.reduce((s: number, a: AbsenceItem) => s + parseFloat((a.total || 0).toString()), 0);

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/absences" className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h2 className="text-2xl font-black text-slate-800">{t('absences_days_title')}</h2>
          </div>
          {financeMonth && (
            <div className="flex items-center gap-3 flex-wrap mr-10">
              <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm font-bold">
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
            <Link
              href={`/admin/absences/print/${monthId}`}
              target="_blank"
              className="bg-slate-800 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-slate-800/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              طباعة الكشف
            </Link>
            {isMonthOpen && (
              <button
                onClick={openAddModal}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                {t('add_absence')}
              </button>
            )}
          </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">{t('absences_list')}</p>
            <p className="text-2xl font-black text-slate-800">{absences.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">{t('absence_days_count')}</p>
            <p className="text-2xl font-black text-slate-800">{totalDays.toFixed(1)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">{t('absence_total')}</p>
            <p className="text-2xl font-black text-slate-800">{totalAmount.toFixed(2)}</p>
          </div>
        </div>
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
            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-700 font-bold transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-orange-500 to-amber-400"></div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">{t('employee_name')}</th>
                <th className="px-5 py-4">{t('absence_days_count')}</th>
                <th className="px-5 py-4">{t('absence_total')}</th>
                <th className="px-5 py-4">{t('added_by')}</th>
                <th className="px-5 py-4">{t('updated_by')}</th>
                <th className="px-5 py-4">{t('status')}</th>
                <th className="px-5 py-4 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAbsences.map((a: AbsenceItem) => {
                const isArchived = a.is_archived == 1;
                const canAct = isMonthOpen && !isArchived;
                return (
                  <tr key={a.id} className={`border-b border-slate-50 transition-colors ${isArchived ? 'opacity-60 bg-slate-50/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">
                        {a.employee ? `(${a.employee_code}) - ${a.employee.emp_name}` : a.employee_code}
                      </div>
                      {a.notes && (
                        <div className="relative group inline-block mt-2">
                          <button className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            <span>عرض الملاحظة</span>
                          </button>
                          <div className="absolute z-50 bottom-full mb-2 right-0 w-64 p-3 bg-slate-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl whitespace-pre-wrap leading-relaxed">
                            {a.notes}
                            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-slate-800 rotate-45"></div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-orange-700">{a.value}</td>
                    <td className="px-5 py-4 font-bold text-rose-600">{a.total.toFixed(2)}</td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-500">
                      <div>{new Date(a.created_at).toLocaleDateString('ar-SA')}</div>
                      <div>{new Date(a.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-emerald-600 mt-1">{a.added?.name}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-500">
                      {a.updated_by && a.updated_by > 0 && a.updated_at ? (
                        <>
                          <div>{new Date(a.updated_at).toLocaleDateString('ar-SA')}</div>
                          <div>{new Date(a.updated_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-emerald-600 mt-1">{a.updatedby?.name}</div>
                        </>
                      ) : (
                        <span>لا يوجد تحديث</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${isArchived ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isArchived ? t('is_archived') : t('not_archived')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(a)}
                          className={`p-2 rounded-lg transition-colors ${canAct ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-300 cursor-not-allowed'}`}
                          title={!canAct ? (isArchived ? t('cannot_edit_archived') : t('cannot_edit_closed')) : t('edit')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(a)}
                          className={`p-2 rounded-lg transition-colors ${canAct ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-300 cursor-not-allowed'}`}
                          title={!canAct ? (isArchived ? t('cannot_delete_archived') : t('cannot_delete_closed')) : t('delete')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAbsences.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <p className="text-slate-500 font-bold">{t('no_absences_found')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-scale-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800">{editingId ? t('edit_absence') : t('add_absence')}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">{t('employee_name')} *</label>
                <select
                  value={form.employee_code}
                  onChange={e => handleEmployeeChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="">{t('select_employee')}</option>
                  {employees.map((e: AbsenceEmployee) => (
                    <option key={e.employee_code || e.employee?.employee_code} value={e.employee_code || e.employee?.employee_code}>
                      {e.employee?.emp_name || e.emp_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">{t('absence_days_count')} *</label>
                  <input
                    type="number" min="0.1" step="0.1"
                    value={form.value}
                    onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold focus:ring-2 focus:ring-orange-500/20"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">{t('day_price')} *</label>
                  <input
                    readOnly
                    type="number" min="0" step="0.01"
                    value={form.day_price}
                    onChange={e => setForm(f => ({ ...f, day_price: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold focus:ring-2 focus:ring-orange-500/20"
                    placeholder="0.00"
                  />
                </div>
              </div>
              {form.value && form.day_price && (
                <div className="bg-rose-50 rounded-xl px-4 py-3">
                  <span className="text-xs text-rose-600 font-bold">{t('absence_total')}: </span>
                  <span className="text-lg font-black text-rose-700">{(parseFloat(form.value) * parseFloat(form.day_price)).toFixed(2)}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">{t('notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  maxLength={100}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold focus:ring-2 focus:ring-orange-500/20 resize-none"
                  placeholder={t('notes')}
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-60"
              >
                {saving ? t('saving') : (editingId ? t('save_changes') : t('save'))}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
