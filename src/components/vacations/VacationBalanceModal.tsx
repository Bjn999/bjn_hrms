'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { EmployeeVacationBalance } from '@/types';

interface VacationBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  balance: EmployeeVacationBalance | null;
}

export default function VacationBalanceModal({
  isOpen,
  onClose,
  onSuccess,
  balance,
}: VacationBalanceModalProps) {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    carried_over_balance: '0',
    notes: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && balance) {
      setForm({
        carried_over_balance: balance.carried_over_balance?.toString() || '0',
        notes: balance.notes || '',
      });
    }
  }, [isOpen, balance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balance) return;

    setSubmitting(true);
    const token = localStorage.getItem('auth_token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/vacation-balances/${balance.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          carried_over_balance: parseFloat(form.carried_over_balance) || 0,
          notes: form.notes
        })
      });
      const data = await res.json();
      if (data.status) {
        showToast(data.message || (language === 'ar' ? 'تم تحديث الرصيد والتسوية بنجاح' : 'Balance updated successfully'), 'success');
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

  if (!mounted || !isOpen || !balance) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-7 max-w-md w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-xl font-black text-slate-900">{t('edit_balance_notes')}</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs space-y-1 font-bold">
            <p className="text-slate-900 font-black text-sm">{balance.employee?.emp_name}</p>
            <p className="text-slate-500">{t('start_date')}: {balance.employee?.emp_start_date || '—'}</p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">{t('carried_over_balance_label')}</label>
            <input
              type="number"
              step="0.5"
              value={form.carried_over_balance}
              onChange={(e) => setForm({ ...form, carried_over_balance: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">{t('notes')}</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="سبب تعديل الرصيد أو ملاحظات التسوية..."
              className="w-full px-3.5 py-2 bg-white border-2 border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>

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
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
