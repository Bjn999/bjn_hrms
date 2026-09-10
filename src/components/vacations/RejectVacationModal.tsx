'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { VacationRequest } from '@/types';

interface RejectVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  request: VacationRequest | null;
}

export default function RejectVacationModal({
  isOpen,
  onClose,
  onSuccess,
  request,
}: RejectVacationModalProps) {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setRejectionReason(language === 'ar' ? 'تم الرفض لظروف وضغط العمل' : 'Rejected due to current workload');
    }
  }, [isOpen, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;
    if (!rejectionReason.trim()) {
      showToast(language === 'ar' ? 'يرجى كتابة سبب الرفض' : 'Please provide a rejection reason', 'error');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('auth_token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/vacation-requests/${request.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ action_reason: rejectionReason })
      });
      const data = await res.json();
      if (data.status) {
        showToast(data.message || (language === 'ar' ? 'تم رفض طلب الإجازة بنجاح' : 'Leave request rejected'), 'success');
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

  if (!mounted || !isOpen || !request) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-7 max-w-lg w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('rejection_modal_title')}</h2>
              <p className="text-xs text-slate-500 font-medium">{t('rejection_modal_desc')}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Request Summary Box */}
        <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold">{t('employee')}:</span>
            <span className="font-black text-slate-900 text-sm">{request.employee?.emp_name} (#{request.employee?.employee_code})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold">{t('vacation_type_name')}:</span>
            <span className="font-bold text-blue-700">{request.vacation_type?.name}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
            <span className="text-slate-500 font-bold">{t('days_count_label')}:</span>
            <span className="font-black text-rose-700">{request.days_count} {t('days_unit')} ({request.from_date} ~ {request.to_date})</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">{t('rejection_reason_label')} <span className="text-rose-500">*</span></label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('rejection_reason_placeholder')}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 shadow-sm"
              required
            />
          </div>

          {/* Quick Reasons Suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500">{t('quick_reasons_title')}</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                t('quick_reason_workload'),
                t('quick_reason_conflict'),
                t('quick_reason_insufficient_balance'),
                t('quick_reason_missing_docs'),
              ].map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRejectionReason(r)}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer text-right"
                >
                  + {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-black text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting || !rejectionReason.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs shadow-md shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <svg className="w-4 h-4 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              <span>{t('confirm_rejection_btn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
