'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { VacationType } from '@/types';

interface VacationTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingType: VacationType | null;
}

export default function VacationTypeModal({
  isOpen,
  onClose,
  onSuccess,
  editingType,
}: VacationTypeModalProps) {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type_slug: 'annual',
    is_paid: '1',
    deduct_from_balance: '1',
    max_days_per_year: '0',
    requires_attachment: '0',
    active: '1',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (editingType) {
        setForm({
          name: editingType.name,
          type_slug: editingType.type_slug,
          is_paid: editingType.is_paid ? '1' : '0',
          deduct_from_balance: editingType.deduct_from_balance ? '1' : '0',
          max_days_per_year: (editingType.max_days_per_year || 0).toString(),
          requires_attachment: editingType.requires_attachment ? '1' : '0',
          active: editingType.active ? '1' : '0',
        });
      } else {
        setForm({
          name: '',
          type_slug: 'annual',
          is_paid: '1',
          deduct_from_balance: '1',
          max_days_per_year: '0',
          requires_attachment: '0',
          active: '1',
        });
      }
    }
  }, [isOpen, editingType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('auth_token');
    const url = editingType 
      ? `${process.env.NEXT_PUBLIC_API_URL || ''}/admin/vacation-types/${editingType.id}`
      : `${process.env.NEXT_PUBLIC_API_URL || ''}/admin/vacation-types`;
    const method = editingType ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          type_slug: form.type_slug,
          is_paid: parseInt(form.is_paid),
          deduct_from_balance: parseInt(form.deduct_from_balance),
          max_days_per_year: parseFloat(form.max_days_per_year) || 0,
          requires_attachment: parseInt(form.requires_attachment),
          active: parseInt(form.active),
        })
      });
      const data = await res.json();
      if (data.status) {
        showToast(data.message || (language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully'), 'success');
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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-7 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-xl font-black text-slate-900">
            {editingType ? t('edit_vacation_type') : t('new_vacation_type')}
          </h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-900 mb-1.5">{t('vacation_type_name')} <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="مثال: إجازة حج، إجازة سنوية اعتيادية..."
              className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">{t('is_paid_leave')}</label>
              <select
                value={form.is_paid}
                onChange={(e) => setForm({ ...form, is_paid: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              >
                <option value="1" className="font-bold">{t('paid')}</option>
                <option value="0" className="font-bold">{t('unpaid')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">{t('deduct_from_annual_balance')}</label>
              <select
                value={form.deduct_from_balance}
                onChange={(e) => setForm({ ...form, deduct_from_balance: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              >
                <option value="1" className="font-bold">{language === 'ar' ? 'نعم (تخصم)' : 'Yes'}</option>
                <option value="0" className="font-bold">{language === 'ar' ? 'لا (بدون خصم)' : 'No'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">{t('max_days_allowed')}</label>
              <input
                type="number"
                value={form.max_days_per_year}
                onChange={(e) => setForm({ ...form, max_days_per_year: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 mb-1.5">{t('requires_medical_attachment')}</label>
              <select
                value={form.requires_attachment}
                onChange={(e) => setForm({ ...form, requires_attachment: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              >
                <option value="0" className="font-bold">{language === 'ar' ? 'لا (اختياري)' : 'No (Optional)'}</option>
                <option value="1" className="font-bold">{language === 'ar' ? 'نعم (إلزامي)' : 'Yes (Required)'}</option>
              </select>
            </div>
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
