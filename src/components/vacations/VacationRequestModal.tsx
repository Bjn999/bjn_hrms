'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { VacationType, Employee, EmployeeVacationBalance } from '@/types';

interface VacationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  types: VacationType[];
  isManager?: boolean;
  employees?: Employee[];
  currentUser?: any;
  currentEmployeeBalance?: EmployeeVacationBalance | null;
}

export default function VacationRequestModal({
  isOpen,
  onClose,
  onSuccess,
  types,
  isManager = false,
  employees = [],
  currentUser = null,
  currentEmployeeBalance = null,
}: VacationRequestModalProps) {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    employee_id: '',
    vacation_type_id: '',
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
    reason: '',
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const activeTypes = types.filter(t => t.active);
      setForm({
        employee_id: '',
        vacation_type_id: activeTypes[0]?.id?.toString() || '',
        from_date: new Date().toISOString().split('T')[0],
        to_date: new Date().toISOString().split('T')[0],
        reason: '',
      });
      setAttachmentFile(null);
    }
  }, [isOpen, types]);

  // Dynamic calculation of requested days
  const calculatedDays = useMemo(() => {
    if (!form.from_date || !form.to_date) return 0;
    const from = new Date(form.from_date);
    const to = new Date(form.to_date);
    if (to < from) return 0;
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [form.from_date, form.to_date]);

  const selectedVacationType = useMemo(() => {
    if (!form.vacation_type_id) return null;
    return types.find(t => t.id.toString() === form.vacation_type_id.toString());
  }, [form.vacation_type_id, types]);

  const selectedEmployee = useMemo(() => {
    if (!form.employee_id) return null;
    return employees.find(e => e.id?.toString() === form.employee_id.toString());
  }, [form.employee_id, employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isManager && !form.employee_id) {
      showToast(language === 'ar' ? 'يرجى اختيار الموظف أولاً' : 'Please select an employee', 'error');
      return;
    }
    if (!form.vacation_type_id) {
      showToast(language === 'ar' ? 'يرجى اختيار نوع الإجازة' : 'Please select a leave type', 'error');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('auth_token');

    const formData = new FormData();
    if (form.employee_id) formData.append('employee_id', form.employee_id);
    formData.append('vacation_type_id', form.vacation_type_id);
    formData.append('from_date', form.from_date);
    formData.append('to_date', form.to_date);
    if (form.reason) formData.append('reason', form.reason);
    if (attachmentFile) formData.append('attachment', attachmentFile);

    const endpoint = isManager
      ? `${process.env.NEXT_PUBLIC_API_URL || ''}/admin/vacation-requests`
      : `${process.env.NEXT_PUBLIC_API_URL || ''}/user/vacation-requests`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json'
        },
        body: formData
      });
      const data = await res.json();
      if (data.status) {
        showToast(data.message || (language === 'ar' ? 'تم تقديم طلب الإجازة بنجاح' : 'Leave request submitted successfully'), 'success');
        onClose();
        onSuccess();
      } else {
        showToast(data.message || t('error_occurred'), 'error');
      }
    } catch (e: any) {
      showToast(e.message || t('error_occurred'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900">{t('new_vacation_request')}</h2>
              <p className="text-xs text-slate-500 font-medium">
                {isManager 
                  ? (language === 'ar' ? 'تقديم طلب إجازة رسمي نيابة عن موظف' : 'Submit official leave request on behalf of an employee') 
                  : (language === 'ar' ? 'قم بتعبئة بيانات الإجازة المطلوبة' : 'Fill in the required leave details')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Employee Selection / Info & Leave Type (2-Col Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee Field */}
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                {isManager ? t('select_employee_vacation') : (language === 'ar' ? 'بيانات صاحب الطلب' : 'Employee')} <span className="text-rose-500">*</span>
              </label>
              {isManager ? (
                <select
                  value={form.employee_id}
                  onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                  required
                  className="w-full px-3.5 py-3 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                >
                  <option value="" className="text-slate-500 font-bold">{t('select_employee_vacation')}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} className="text-slate-900 font-bold">
                      {emp.emp_name} (#{emp.employee_code})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 truncate max-w-[130px]">{currentUser?.name}</p>
                      <p className="text-[11px] font-bold text-slate-500">#{currentUser?.employee?.employee_code || currentUser?.employee_id || '—'}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-300">
                    {currentEmployeeBalance?.remaining_balance ?? 0} {t('days_unit')}
                  </span>
                </div>
              )}
            </div>

            {/* Leave Type Field */}
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">{t('select_vacation_type')} <span className="text-rose-500">*</span></label>
              <select
                value={form.vacation_type_id}
                onChange={(e) => setForm({ ...form, vacation_type_id: e.target.value })}
                required
                className="w-full px-3.5 py-3 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              >
                {types.filter(tp => tp.active).map(tp => (
                  <option key={tp.id} value={tp.id} className="text-slate-900 font-bold">
                    {tp.name} {tp.is_paid ? `(${t('paid')})` : `(${t('unpaid')})`} {tp.deduct_from_balance ? `[${language === 'ar' ? 'تخصم' : 'Deducts'}]` : `[${language === 'ar' ? 'بدون خصم' : 'No Deduct'}]`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Live Policy & Balance Notice */}
          {selectedVacationType && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-black text-blue-950">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                  {selectedVacationType.name}
                </span>
                <span className="bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 text-blue-800 font-black">
                  {selectedVacationType.is_paid ? t('paid') : t('unpaid')} • {selectedVacationType.deduct_from_balance ? t('deduct_from_annual_balance') : (language === 'ar' ? 'لا تخصم من الرصيد' : 'No Balance Deduction')}
                </span>
              </div>
              <p className="text-slate-700 font-medium text-[11px]">
                {selectedVacationType.deduct_from_balance 
                  ? (language === 'ar' ? `سيتم احتساب وخصم (${calculatedDays} يوم) من رصيد الإجازات السنوية.` : `(${calculatedDays} days) will be deducted from annual leave balance upon approval.`)
                  : (language === 'ar' ? '✓ هذه الإجازة مستقلة ولا تخصم من رصيد الإجازات السنوية الاعتيادي.' : '✓ This leave is independent and does not deduct from annual balance.')}
              </p>
            </div>
          )}

          {/* Row 3: From Date & To Date & Calculated Days (2-Col Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">{t('from_date_label')} <span className="text-rose-500">*</span></label>
              <input
                type="date"
                value={form.from_date}
                onChange={(e) => setForm({ ...form, from_date: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-slate-900">{t('to_date_label')} <span className="text-rose-500">*</span></label>
                <span className="text-xs font-black text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-lg">
                  {t('days_count_label')}: {calculatedDays} {t('days_unit')}
                </span>
              </div>
              <input
                type="date"
                value={form.to_date}
                onChange={(e) => setForm({ ...form, to_date: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
            </div>
          </div>

          {/* Row 4: Reason & Attachment (2-Col Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reason */}
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">{t('vacation_reason')}</label>
              <textarea
                rows={2}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder={language === 'ar' ? 'اكتب سبب طلب الإجازة...' : 'State the reason for your leave...'}
                className="w-full px-3.5 py-2 bg-white border-2 border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
            </div>

            {/* Attachment */}
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">
                {t('vacation_attachment')}
                {selectedVacationType?.requires_attachment ? (
                  <span className="text-rose-600 font-bold text-[10px] mx-1">({language === 'ar' ? 'مطلوب إلزامي' : 'Mandatory'})</span>
                ) : (
                  <span className="text-slate-400 font-normal text-[10px] mx-1">({language === 'ar' ? 'اختياري' : 'Optional'})</span>
                )}
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                required={Boolean(selectedVacationType?.requires_attachment)}
                onChange={(e) => setAttachmentFile(e.target.files ? e.target.files[0] : null)}
                className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer shadow-sm"
              />
              <p className="text-[10px] text-slate-500 mt-1 font-medium">{language === 'ar' ? 'الملفات المدعومة: PDF, JPG, PNG (حد أقصى 5MB)' : 'Supported: PDF, JPG, PNG (Max 5MB)'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-black text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : t('new_vacation_request')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
