'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { VacationRequest, VacationType, EmployeeVacationBalance } from '@/types';
import VacationRequestModal from '@/components/vacations/VacationRequestModal';

export default function MyVacationsPage() {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [balance, setBalance] = useState<EmployeeVacationBalance | null>(null);
  const [types, setTypes] = useState<VacationType[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {}
      }
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept-Language': language,
      'Accept': 'application/json'
    };

    try {
      // 1. Fetch Types
      const typesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/user/vacation-types`, { headers });
      const typesData = await typesRes.json();
      if (typesData.status) {
        setTypes(typesData.data);
      }

      // 2. Fetch My Requests & Balance
      const reqRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/user/my-vacations`, { headers });
      const reqData = await reqRes.json();
      if (reqData.status) {
        setRequests(reqData.data || []);
        if (reqData.balance) {
          setBalance(reqData.balance);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || t('error_occurred'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [language]);

  // Handle Cancel Request
  const handleCancelRequest = async (id: number) => {
    const isConfirmed = await confirm({
      title: t('cancel_leave_action'),
      description: language === 'ar' ? 'هل أنت متأكد من رغبتك في إلغاء طلب الإجازة هذا؟' : 'Are you sure you want to cancel this leave request?',
      icon: 'warning'
    });
    if (!isConfirmed) return;

    setActionLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/user/vacation-requests/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json'
        },
      });
      const data = await res.json();
      if (data.status) {
        showToast(data.message || (language === 'ar' ? 'تم إلغاء الطلب بنجاح' : 'Request cancelled successfully'), 'success');
        fetchData();
      } else {
        showToast(data.message || t('error_occurred'), 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter(r => r.status.toString() === statusFilter);
  }, [requests, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-7 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide text-blue-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>{language === 'ar' ? 'إجازاتي الشخصية' : 'My Leaves'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{language === 'ar' ? 'إجازاتي ومستحقاتي السنوية' : 'My Leaves & Annual Balances'}</h1>
            <p className="text-blue-100 text-sm max-w-2xl font-medium">
              {language === 'ar' 
                ? 'استعراض رصيد إجازاتك المتاح، تقديم طلبات إجازة جديدة، ومتابعة حالة الاعتماد بسهولة.'
                : 'Track your available vacation balance, submit new leave requests, and follow up approval status.'}
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-800 font-bold shadow-lg hover:bg-blue-50 transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span>{t('new_vacation_request')}</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-white border border-emerald-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/40">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{t('remaining_balance_label')}</span>
            <p className="text-3xl font-black text-emerald-600">
              {balance?.remaining_balance ?? 0} <span className="text-xs font-normal text-slate-400">{t('days_unit')}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>

        {/* Used Balance */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('used_balance_label')}</span>
            <p className="text-2xl font-black text-blue-600">
              {balance?.used_balance ?? 0} <span className="text-xs font-normal text-slate-400">{t('days_unit')}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('pending_balance_label')}</span>
            <p className="text-2xl font-black text-amber-600">
              {balance?.pending_balance ?? 0} <span className="text-xs font-normal text-slate-400">{t('days_unit')}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>

        {/* Total Entitled */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('total_entitled_label')}</span>
            <p className="text-2xl font-black text-indigo-600">
              {balance?.total_entitled_balance ?? 0} <span className="text-xs font-normal text-slate-400">{t('days_unit')}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </div>
      </div>

      {/* Requests Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-lg text-slate-800">{language === 'ar' ? 'سجل طلبات الإجازات' : 'Leave Requests History'}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
              {requests.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'تصفية الحالة:' : 'Filter status:'}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('all_vacation_statuses')}</option>
              <option value="0">{t('pending_approval')}</option>
              <option value="1">{t('approved_leave')}</option>
              <option value="2">{t('rejected_leave')}</option>
              <option value="3">{t('cancelled_leave')}</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              <svg className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <p className="font-semibold text-sm">{language === 'ar' ? 'جاري تحميل الطلبات...' : 'Loading requests...'}</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="font-bold text-base text-slate-700">{t('no_vacation_requests')}</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
              >
                <span>{t('new_vacation_request')}</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right ltr:text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-xs">
                  <tr>
                    <th className="py-4 px-4">{t('vacation_type_name')}</th>
                    <th className="py-4 px-4">{t('from_date_label')}</th>
                    <th className="py-4 px-4">{t('to_date_label')}</th>
                    <th className="py-4 px-4 text-center">{t('days_count_label')}</th>
                    <th className="py-4 px-4">{t('vacation_reason')}</th>
                    <th className="py-4 px-4 text-center">{t('activation_status')}</th>
                    <th className="py-4 px-4 text-center">{t('actions') || 'الإجراء'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <span>{req.vacation_type?.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${req.vacation_type?.is_paid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {req.vacation_type?.is_paid ? t('paid') : t('unpaid')}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs font-mono text-slate-600">{req.from_date}</td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-600">{req.to_date}</td>
                      <td className="py-4 px-4 text-center font-bold text-slate-800">
                        {req.days_count} <span className="text-[11px] font-normal text-slate-400">{t('days_unit')}</span>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-600 max-w-xs truncate">
                        <div>{req.reason || '—'}</div>
                        {req.attachment_path && (
                          <a 
                            href={`${process.env.NEXT_PUBLIC_API_URL || ''}/storage/${req.attachment_path}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1 font-semibold"
                          >
                            <span>{t('download_attachment')}</span>
                          </a>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {req.status === 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {t('pending_approval')}
                          </span>
                        )}
                        {req.status === 1 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {t('approved_leave')}
                          </span>
                        )}
                        {req.status === 2 && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {t('rejected_leave')}
                            </span>
                            {req.action_reason && (
                              <p className="text-[11px] text-rose-600 max-w-[160px] mx-auto truncate" title={req.action_reason}>
                                {req.action_reason}
                              </p>
                            )}
                          </div>
                        )}
                        {req.status === 3 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {t('cancelled_leave')}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {req.status === 0 ? (
                          <button
                            onClick={() => handleCancelRequest(req.id)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors border border-amber-200 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            <span>{t('cancel_leave_action')}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* REUSABLE MODAL: SUBMIT LEAVE REQUEST */}
      <VacationRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchData}
        types={types}
        isManager={false}
        currentUser={currentUser}
        currentEmployeeBalance={balance}
      />
    </div>
  );
}
