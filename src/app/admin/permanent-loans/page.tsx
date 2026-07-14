'use client';

import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { Employee } from '@/types';

interface PermanentLoan {
  id: number;
  employee_code: string;
  emp_sal: number;
  total: number;
  months_number: number;
  monthly_installment_value: number;
  year_and_month_start_date: string;
  notes?: string;
  is_archived: number;
  is_disbursed: number;
  created_at: string;
  employee?: Employee;
  added?: { name: string };
  updatedby?: { name: string };
  updated_at?: string;
}

interface Installment {
  id: number;
  permanent_loan_id: number;
  year_and_month: string;
  total: number;
  is_archived: number;
  created_at: string;
  added?: { name: string };
  status?: number;
  counterbefornotpaid?: number;
  is_parent_disbursed?: number;
  monthly_installment_value?: number | string;
}

const API = process.env.NEXT_PUBLIC_API_URL || '';

const emptyForm = {
  employee_code: '',
  emp_sal: '',
  total: '',
  months_number: '',
  monthly_installment_value: '',
  year_and_month_start_date: '',
  notes: '',
};

export default function PermanentLoansPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loans, setLoans] = useState<PermanentLoan[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  // Installments Modal
  const [showInstModal, setShowInstModal] = useState(false);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [activeLoan, setActiveLoan] = useState<PermanentLoan | null>(null);
  const [loadingInst, setLoadingInst] = useState(false);

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/permanent-loans`, { headers: headers() });
      const result = await res.json();
      if (result.status) {
        setLoans(result.data || []);
        setEmployees(result.employees || []);
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
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = (a: PermanentLoan) => {
    if (a.is_archived == 1) { showToast(t('loan_already_archived'), 'error'); return; }
    if (a.is_disbursed == 1) { showToast(t('cannot_edit_disbursed'), 'error'); return; }
    setEditingId(a.id);
    setForm({
      employee_code: a.employee_code,
      emp_sal: String(a.emp_sal),
      total: String(a.total),
      months_number: String(a.months_number),
      monthly_installment_value: String(a.monthly_installment_value),
      year_and_month_start_date: a.year_and_month_start_date,
      notes: a.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.employee_code || !form.total || !form.months_number || !form.monthly_installment_value || !form.year_and_month_start_date) {
      showToast(t('fill_required_fields'), 'error');
      return;
    }

    if (!editingId) {
      const exists = loans.some((a: PermanentLoan) => String(a.employee_code) === String(form.employee_code) && a.is_disbursed == 0);
      if (exists) {
        const ok = await confirm({ title: t('warning'), description: t('confirm_duplicate_permanent_loan'), icon: 'warning' });
        if (!ok) return;
      }
    }

    setSaving(true);
    try {
      const url = editingId ? `${API}/permanent-loans/${editingId}` : `${API}/permanent-loans`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
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

  const handleDelete = async (a: PermanentLoan) => {
    if (a.is_archived == 1) { showToast(t('loan_already_archived'), 'error'); return; }
    if (a.is_disbursed == 1) { showToast(t('cannot_delete_disbursed'), 'error'); return; }
    const ok = await confirm({ title: t('confirm_delete'), description: t('confirm_delete_permanent_loan'), icon: 'danger' });
    if (!ok) return;
    try {
      const res = await fetch(`${API}/permanent-loans/${a.id}`, { method: 'DELETE', headers: headers() });
      const result = await res.json();
      if (result.status) { showToast(t('permanent_loan_deleted'), 'success'); fetchData(); }
      else showToast(result.message, 'error');
    } catch {
      showToast(t('conn_error'), 'error');
    }
  };

  const handleDisburse = async (a: PermanentLoan) => {
    if (a.is_archived == 1) { showToast(t('loan_already_archived'), 'error'); return; }
    if (a.is_disbursed == 1) { showToast(t('loan_already_disbursed'), 'error'); return; }
    const ok = await confirm({ title: t('confirm_disbursement_title'), description: t('confirm_disbursement_desc'), icon: 'warning' });
    if (!ok) return;
    try {
      const res = await fetch(`${API}/permanent-loans/${a.id}/disburse`, { method: 'POST', headers: headers() });
      const result = await res.json();
      if (result.status) { showToast(t('loan_disbursed_success'), 'success'); fetchData(); }
      else showToast(result.message, 'error');
    } catch {
      showToast(t('conn_error'), 'error');
    }
  };

  const handlePayCash = async (installmentId: number) => {
    const ok = await confirm({
      title: t('pay_cash'),
      description: t('confirm_pay_cash'),
      icon: 'warning'
    });
    if (!ok) return;

    try {
      const res = await fetch(`${API}/permanent-loans/installments/${installmentId}/pay-cash`, {
        method: 'POST',
        headers: headers()
      });
      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
        if (activeLoan) {
          openInstallments(activeLoan);
        }
        fetchData();
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    }
  };

  const openInstallments = async (a: PermanentLoan) => {
    setActiveLoan(a);
    setShowInstModal(true);
    setLoadingInst(true);
    try {
      const res = await fetch(`${API}/permanent-loans/${a.id}/installments`, { headers: headers() });
      const result = await res.json();
      if (result.status) {
        setInstallments(result.installments);
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setLoadingInst(false);
    }
  };

  // this function to show counter of installments before not paid ()
  const computedInstallments = useMemo(() => {
    return installments.map((inst: Installment) => ({
      ...inst,
      counterbefornotpaid: installments.filter((i: Installment) => i.id < inst.id && i.status == 0 && i.is_archived == 0).length,
    }));
  }, [installments]);

  const handleEmployeeChange = (code: string) => {
    const emp = employees.find((e: Employee) => e.employee_code == code);
    setForm(f => ({ ...f, employee_code: code, emp_sal: emp?.emp_sal ? String(emp.emp_sal) : '' }));
  };

  const handleTotalChange = (total: string) => {
    const t = parseFloat(total) || 0;
    const m = parseInt(form.months_number) || 0;
    const install = m > 0 ? (t / m).toFixed(2) : '';
    setForm(f => ({ ...f, total, monthly_installment_value: install }));
  };

  const handleMonthsChange = (months: string) => {
    const m = parseInt(months) || 0;
    const t = parseFloat(form.total) || 0;
    const install = m > 0 ? (t / m).toFixed(2) : '';
    setForm(f => ({ ...f, months_number: months, monthly_installment_value: install }));
  };

  const filteredLoans = loans.filter((a: PermanentLoan) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const empName = a.employee?.emp_name?.toLowerCase() || '';
    const empCode = a.employee_code?.toString() || '';
    const notes = a.notes?.toLowerCase() || '';
    const total = a.total?.toString() || '';
    const isDisbursed = a.is_disbursed == 1 ? 'تم الصرف' : 'انتظار';
    const isArchived = a.is_archived == 1 ? 'مؤرشف' : 'مفتوح';
    return empName.includes(query) || empCode.includes(query) || notes.includes(query) || total.includes(query) || isDisbursed.includes(query) || isArchived.includes(query);
  });

  const totalAmount = filteredLoans.reduce((s: number, a: PermanentLoan) => s + parseFloat(String(a.total || 0)), 0);

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">{t('permanent_loans_title')}</h2>
            <p className="text-sm font-bold text-slate-500 mt-1">{t('permanent_loans_desc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/permanent-loans/print`}
            target="_blank"
            className="bg-slate-800 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-slate-800/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            {t('print_report')}
          </Link>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('add_loan')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">{t('stats_movements_count')}</p>
            <p className="text-2xl font-black text-slate-800">{filteredLoans.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">{t('stats_total_amounts')}</p>
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
            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-bold transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-blue-400"></div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">{t('employee_name')}</th>
                <th className="px-5 py-4">{t('loan_amount')}</th>
                <th className="px-5 py-4">{t('months_count')}</th>
                <th className="px-5 py-4">{t('monthly_installment')}</th>
                <th className="px-5 py-4">{t('disbursement_status')}</th>
                <th className="px-5 py-4">{t('is_ended')}</th>
                <th className="px-5 py-4 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((a: PermanentLoan) => {
                const isArchived = a.is_archived == 1;
                const isDisbursed = a.is_disbursed == 1;
                const canAct = !isArchived && !isDisbursed;
                const emp = employees.find((e: Employee) => String(e.employee_code) === String(a.employee_code));
                const empName = a.employee?.emp_name || emp?.emp_name || a.employee_code;

                return (
                  <tr key={a.id} className={`border-b border-slate-50 transition-colors ${isArchived ? 'opacity-60 bg-slate-50/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">
                        ({a.employee_code}) - {empName}
                      </div>
                      {a.notes && (
                        <div className="relative group inline-block mt-2">
                          <button className="flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            <span>{t('view_notes')}</span>
                          </button>
                          <div className="absolute z-50 bottom-full mb-2 right-0 w-64 p-3 bg-slate-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl whitespace-pre-wrap leading-relaxed">
                            {a.notes}
                            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-slate-800 rotate-45"></div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-indigo-600 text-base">{parseFloat(String(a.total)).toFixed(2)}</div>
                      <div className="text-xs text-emerald-600 mt-1">بدء الخصم: {a.year_and_month_start_date}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-600">
                      {a.months_number}
                    </td>
                    <td className="px-5 py-4 font-bold text-rose-600">
                      {parseFloat(String(a.monthly_installment_value)).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      {isDisbursed ? (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1 w-max">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          {t('disbursed')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1 w-max">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {t('pending_disbursement')}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {isArchived ? (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 flex items-center gap-1 w-max">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                          {t('ended')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700 flex items-center gap-1 w-max">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          {t('active_loan')}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {canAct && (
                          <button
                            onClick={() => handleDisburse(a)}
                            className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-200 hover:border-transparent flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {t('payout_action')}
                          </button>
                        )}
                        <button
                          onClick={() => openInstallments(a)}
                          className="text-xs font-bold bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors border border-slate-200 hover:border-transparent flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                          {t('installments')}
                        </button>
                        <button
                          onClick={() => openEditModal(a)}
                          className={`p-2 rounded-lg transition-colors ${canAct ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-300 cursor-not-allowed'}`}
                          title={!canAct ? t('cannot_edit_loan') : t('edit')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(a)}
                          className={`p-2 rounded-lg transition-colors ${canAct ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-300 cursor-not-allowed'}`}
                          title={!canAct ? t('cannot_delete_loan') : t('delete')}
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
          {filteredLoans.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <p className="text-slate-500 font-bold">{t('no_permanent_loans_found')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-scale-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800">{editingId ? t('edit_permanent_loan') : t('add_permanent_loan')}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 border-b border-slate-100 pb-4 mb-2">
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">{t('employee_name')} *</label>
                  <select
                    value={form.employee_code}
                    onChange={e => handleEmployeeChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">{t('select_employee')}</option>
                    {employees.map((e: Employee) => (
                      <option key={e.employee_code} value={e.employee_code}>{e.emp_name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">{t('total_loan_amount')}</label>
                  <input
                    type="number" min="1" step="1"
                    value={form.total}
                    onChange={e => handleTotalChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20"
                    placeholder={t('placeholder_example_amount')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">{t('months_payment_count')}</label>
                  <input
                    type="number" min="1" step="1"
                    value={form.months_number}
                    onChange={e => handleMonthsChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20"
                    placeholder={t('placeholder_example_months')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">{t('monthly_installment_val_label')}</label>
                  <input
                    type="number" readOnly
                    value={form.monthly_installment_value}
                    className="w-full px-4 py-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl outline-none text-indigo-700 font-bold cursor-not-allowed"
                    placeholder={t('placeholder_calculated_automatically')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">{t('deduction_start_date_label')}</label>
                  <input
                    type="date"
                    value={form.year_and_month_start_date}
                    onChange={e => setForm(f => ({ ...f, year_and_month_start_date: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-xs text-slate-400 font-bold mt-1">{t('deduction_start_date_note')}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">{t('notes')}</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    maxLength={200}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    placeholder={t('notes')}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-60"
              >
                {saving ? t('saving') : (editingId ? t('save_changes') : t('save'))}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Installments Modal */}
      {showInstModal && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowInstModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden relative z-10 animate-scale-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-800">{t('loan_installments')}</h3>
                {activeLoan && <p className="text-xs font-bold text-slate-500 mt-1">{t('employee')}: ({activeLoan.employee_code}) - {t('stats_total_amounts')}: {activeLoan.total}</p>}
              </div>
              <button onClick={() => setShowInstModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {loadingInst ? (
                <div className="py-20 text-center text-slate-400 font-bold">{t('loading_installments')}</div>
              ) : (
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100 rounded-xl">
                    <tr>
                      <th className="px-5 py-4">{t('due_month')}</th>
                      <th className="px-5 py-4">{t('installment_value')}</th>
                      <th className="px-5 py-4">{t('payment_status')}</th>
                      <th className="px-5 py-4">{t('archive_status')}</th>
                      <th className="px-5 py-4 text-center">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedInstallments.map((inst: Installment) => {
                      return (
                        <tr key={inst.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-black text-slate-800">
                            {inst.year_and_month}
                          </td>
                          <td className="px-5 py-4 font-bold text-indigo-600">
                            {parseFloat(String(inst.monthly_installment_value || 0)).toFixed(2)}
                          </td>
                          <td className="px-5 py-4">
                            {inst.status == 1 ? (
                              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700">{t('deducted_and_paid')}</span>
                            ) : inst.status == 2 ? (
                              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700">{t('paid_cash')}</span>
                            ) : (
                              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700">{t('pending_payment')}</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {inst.is_archived == 1 ? (
                              <span className="text-xs font-bold text-slate-500">{t('is_archived')}</span>
                            ) : (
                              <span className="text-xs font-bold text-slate-500">{t('open')}</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            {inst.status == 0 && inst.is_archived == 0 && activeLoan?.is_disbursed == 1 && inst.counterbefornotpaid == 0 && (
                              <button
                                onClick={() => handlePayCash(inst.id)}
                                className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-colors border border-blue-200 hover:border-transparent"
                              >
                                {t('pay_cash')}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
