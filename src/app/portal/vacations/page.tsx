'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { VacationRequest, VacationType, EmployeeVacationBalance, Employee } from '@/types';
import VacationRequestModal from '@/components/vacations/VacationRequestModal';
import VacationTypeModal from '@/components/vacations/VacationTypeModal';
import VacationBalanceModal from '@/components/vacations/VacationBalanceModal';
import RejectVacationModal from '@/components/vacations/RejectVacationModal';

export default function VacationsPage() {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'balances' | 'types'>('requests');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [isManager, setIsManager] = useState<boolean>(true);
  const [myBalance, setMyBalance] = useState<any>(null);

  // Data states
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [balances, setBalances] = useState<EmployeeVacationBalance[]>([]);
  const [types, setTypes] = useState<VacationType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Filters
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState<VacationRequest | null>(null);
  const [selectedBalance, setSelectedBalance] = useState<EmployeeVacationBalance | null>(null);
  const [editingType, setEditingType] = useState<VacationType | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          const managerCheck = user.role === 'company_admin' || user.role === 'hr_manager' || user.permissions?.includes('view_employees');
          setIsManager(managerCheck);
        } catch (e) {}
      }
    }
  }, []);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Accept-Language': language,
      'Accept': 'application/json'
    };

    try {
      // 1. Fetch Vacation Types
      const typesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/vacation-types`, { headers });
      const typesData = await typesRes.json();
      if (typesData.status) setTypes(typesData.data);

      // 2. Fetch Requests
      const reqRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/vacation-requests`, { headers });
      const reqData = await reqRes.json();
      if (reqData.status) {
        setRequests(reqData.data);
        if (reqData.my_balance) setMyBalance(reqData.my_balance);
        if (typeof reqData.is_manager === 'boolean') setIsManager(reqData.is_manager);
      }

      // 3. Fetch Balances (only if manager)
      const balRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/vacation-balances?year=${selectedYear}`, { headers });
      const balData = await balRes.json();
      if (balData.status) setBalances(balData.data);

      // 4. Fetch Employees list for dropdowns
      const empRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/employees`, { headers });
      const empData = await empRes.json();
      if (empData.status) {
        setEmployees(Array.isArray(empData.data) ? empData.data : (empData.data?.data || []));
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
  }, [language, selectedYear]);

  // Handle Recalculate Balances
  const handleRecalculate = async () => {
    setRecalculating(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/vacation-balances/recalculate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ year: selectedYear })
      });
      const data = await res.json();
      if (data.status) {
        showToast(data.message || 'تمت إعادة احتساب الأرصدة بنجاح', 'success');
        fetchData();
      } else {
        showToast(data.message || t('error_occurred'), 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setRecalculating(false);
    }
  };

  // Handle Approve Request
  const handleApprove = async (id: number) => {
    const isConfirmed = await confirm({
      title: t('approve_leave_action'),
      description: t('confirm_approve_leave'),
      icon: 'warning'
    });
    if (!isConfirmed) return;

    setActionLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/vacation-requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      const data = await res.json();
      if (data.status) {
        showToast(data.message || 'تم اعتماد الإجازة بنجاح', 'success');
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

  // Open Reject Modal
  const openRejectModal = (req: VacationRequest) => {
    setRejectingRequest(req);
    setShowRejectModal(true);
  };

  // Handle Delete Request
  const handleDeleteRequest = async (id: number) => {
    const isConfirmed = await confirm({
      title: t('confirm_delete_title'),
      description: t('confirm_delete'),
      icon: 'danger'
    });
    if (!isConfirmed) return;

    setActionLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/vacation-requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json'
        },
      });
      const data = await res.json();
      if (data.status) {
        showToast(data.message || 'تم الحذف بنجاح', 'success');
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

  // Handle Cancel Request (Employee can cancel their own pending request)
  const handleCancelRequest = async (id: number) => {
    const isConfirmed = await confirm({
      title: t('cancel_leave_action'),
      description: 'هل أنت متأكد من رغبتك في إلغاء طلب الإجازة هذا؟',
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
        showToast(data.message || 'تم إلغاء الطلب بنجاح', 'success');
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

  // Handle Delete Vacation Type
  const handleDeleteType = async (id: number) => {
    const isConfirmed = await confirm({
      title: t('confirm_delete_title'),
      description: 'هل أنت متأكد من حذف نوع الإجازة هذا؟',
      icon: 'danger'
    });
    if (!isConfirmed) return;

    setActionLoading(true);
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/vacation-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept-Language': language,
          'Accept': 'application/json'
        },
      });
      const data = await res.json();
      if (data.status) {
        showToast(data.message || 'تم الحذف بنجاح', 'success');
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

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchStatus = statusFilter === 'all' || r.status.toString() === statusFilter;
      const matchType = typeFilter === 'all' || r.vacation_type_id.toString() === typeFilter;
      const matchSearch = searchQuery === '' || 
        r.employee?.emp_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.employee?.employee_code?.toString().includes(searchQuery) ||
        r.vacation_type?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchType && matchSearch;
    });
  }, [requests, statusFilter, typeFilter, searchQuery]);

  // Statistics (For Managers & For Employees)
  const stats = useMemo(() => {
    const pending = requests.filter(r => r.status === 0).length;
    const approved = requests.filter(r => r.status === 1).length;
    const totalRemaining = balances.reduce((sum, b) => sum + parseFloat(b.remaining_balance?.toString() || '0'), 0);
    const totalUsed = balances.reduce((sum, b) => sum + parseFloat(b.used_balance?.toString() || '0'), 0);
    return { 
      pending, 
      approved, 
      totalRemaining: Math.round(totalRemaining * 10) / 10, 
      totalUsed: Math.round(totalUsed * 10) / 10 
    };
  }, [requests, balances]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-7 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide text-blue-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>{isManager ? t('vacations_management') : 'إجازاتي ومستحقاتي'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{isManager ? t('vacations_management') : 'نظام الإجازات والمغادرات'}</h1>
            <p className="text-blue-100 text-sm max-w-2xl font-medium">
              {isManager 
                ? t('vacations_management_desc') 
                : 'متابعة رصيد إجازاتك السنوية، تقديم طلبات الإجازات الجديدة، ومتابعة حالة اعتمادها من الإدارة.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-800 font-bold shadow-lg hover:bg-blue-50 transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span>{t('new_vacation_request')}</span>
            </button>

            {isManager && activeTab === 'types' && (
              <button
                onClick={() => {
                  setEditingType(null);
                  setShowTypeModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold hover:bg-white/30 transition-all active:scale-95 cursor-pointer border border-white/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span>{t('new_vacation_type')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards: Responsive for Employee vs Manager */}
      {!isManager ? (
        /* Employee Personal Summary Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-emerald-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/30">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{t('remaining_balance_label')}</span>
              <p className="text-3xl font-black text-emerald-600">{myBalance?.remaining_balance ?? 0} <span className="text-xs font-normal text-slate-400">{t('days_unit')}</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('used_balance_label')}</span>
              <p className="text-2xl font-black text-blue-600">{myBalance?.used_balance ?? 0} <span className="text-xs font-normal text-slate-400">{t('days_unit')}</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('pending_balance_label')}</span>
              <p className="text-2xl font-black text-amber-600">{myBalance?.pending_balance ?? 0} <span className="text-xs font-normal text-slate-400">{t('days_unit')}</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('total_entitled_label')}</span>
              <p className="text-2xl font-black text-indigo-600">{myBalance?.total_entitled_balance ?? 0} <span className="text-xs font-normal text-slate-400">{t('days_unit')}</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </div>
      ) : (
        /* Company Management Metric Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('pending_approval')}</span>
              <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('approved_leave')}</span>
              <p className="text-2xl font-black text-emerald-600">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('used_balance_label')} ({selectedYear})</span>
              <p className="text-2xl font-black text-blue-600">{stats.totalUsed} <span className="text-xs font-normal text-slate-400">{t('days_unit')}</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('remaining_balance_label')} ({selectedYear})</span>
              <p className="text-2xl font-black text-indigo-600">{stats.totalRemaining} <span className="text-xs font-normal text-slate-400">{t('days_unit')}</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-2xl">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{isManager ? t('vacation_requests_tab') : 'طلبات إجازاتي'}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'requests' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200 text-slate-700'}`}>
              {requests.length}
            </span>
          </button>

          {isManager && (
            <button
              onClick={() => setActiveTab('balances')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'balances'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{t('vacation_balances_tab')}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('types')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'types'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{isManager ? t('vacation_types_tab') : 'سياسات وأنواع الإجازات'}</span>
          </button>
        </div>

        {/* Year Filter for Balances */}
        {isManager && activeTab === 'balances' && (
          <div className="flex items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              {[2024, 2025, 2026, 2027, 2028].map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>

            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span>{recalculating ? t('recalculating') : t('recalculate_balances')}</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: VACATION REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('placeholder_search') || 'بحث...'}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('all_vacation_statuses')}</option>
                <option value="0">{t('pending_approval')}</option>
                <option value="1">{t('approved_leave')}</option>
                <option value="2">{t('rejected_leave')}</option>
                <option value="3">{t('cancelled_leave')}</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('all_vacation_types')}</option>
                {types.map(tp => (
                  <option key={tp.id} value={tp.id}>{tp.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-slate-500">
                <svg className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <p className="font-semibold text-sm">{t('loading_dashboard') || 'جاري التحميل...'}</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <p className="font-bold text-base text-slate-700">{t('no_vacation_requests')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-xs">
                    <tr>
                      <th className="py-4 px-4">{t('employee')}</th>
                      <th className="py-4 px-4">{t('vacation_type_name')}</th>
                      <th className="py-4 px-4">{t('from_date_label')} / {t('to_date_label')}</th>
                      <th className="py-4 px-4 text-center">{t('days_count_label')}</th>
                      <th className="py-4 px-4">{t('vacation_reason')}</th>
                      <th className="py-4 px-4 text-center">{t('status')}</th>
                      <th className="py-4 px-4 text-center">{t('actions') || 'الإجراءات'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {req.employee?.emp_name?.charAt(0) || 'E'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{req.employee?.emp_name || '—'}</p>
                              <p className="text-xs text-slate-400">#{req.employee?.employee_code} • {req.employee?.department?.name || '—'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-800">{req.vacation_type?.name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              req.vacation_type?.is_paid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {req.vacation_type?.is_paid ? t('paid') : t('unpaid')}
                            </span>
                            {req.vacation_type?.deduct_from_balance ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                                تخصم من الرصيد
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-xs font-mono text-slate-600">
                          <div>{req.from_date}</div>
                          <div className="text-slate-400 mt-0.5">{req.to_date}</div>
                        </td>

                        <td className="py-4 px-4 text-center font-bold text-base text-blue-700">
                          {req.days_count} <span className="text-xs font-normal text-slate-400">{t('days_unit')}</span>
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
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200" title={req.action_reason || ''}>
                              {t('rejected_leave')}
                            </span>
                          )}
                          {req.status === 3 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {t('cancelled_leave')}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Manager Actions: Approve / Reject */}
                            {isManager && req.status === 0 && (
                              <>
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  disabled={actionLoading}
                                  title={t('approve_leave_action')}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                                <button
                                  onClick={() => openRejectModal(req)}
                                  disabled={actionLoading}
                                  title={t('reject_leave_action')}
                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </>
                            )}

                            {/* Employee Action: Cancel pending request */}
                            {!isManager && req.status === 0 && (
                              <button
                                onClick={() => handleCancelRequest(req.id)}
                                disabled={actionLoading}
                                title={t('cancel_leave_action')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs transition-colors cursor-pointer border border-amber-200"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                <span>{t('cancel_leave_action')}</span>
                              </button>
                            )}

                            {/* Delete Action */}
                            {(isManager ? req.status !== 1 : (req.status === 0 || req.status === 3)) && (
                              <button
                                onClick={() => handleDeleteRequest(req.id)}
                                disabled={actionLoading}
                                title={t('delete')}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE BALANCES */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-slate-500">
                <svg className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <p className="font-semibold text-sm">{t('loading_dashboard') || 'جاري التحميل...'}</p>
              </div>
            ) : balances.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <p className="font-bold text-base text-slate-700">{t('no_vacation_balances')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-xs">
                    <tr>
                      <th className="py-4 px-4">{t('employee')}</th>
                      <th className="py-4 px-4">{t('start_date')}</th>
                      <th className="py-4 px-4 text-center">{t('carried_over_balance_label')}</th>
                      <th className="py-4 px-4 text-center">{t('initial_balance_label')}</th>
                      <th className="py-4 px-4 text-center">{t('monthly_accrued_label')}</th>
                      <th className="py-4 px-4 text-center font-black">{t('total_entitled_label')}</th>
                      <th className="py-4 px-4 text-center text-rose-600">{t('used_balance_label')}</th>
                      <th className="py-4 px-4 text-center text-amber-600">{t('pending_balance_label')}</th>
                      <th className="py-4 px-4 text-center text-emerald-600 font-black">{t('remaining_balance_label')}</th>
                      <th className="py-4 px-4 text-center">{t('actions') || 'الإجراءات'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {balances.map((bal) => (
                      <tr key={bal.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {bal.employee?.emp_name?.charAt(0) || 'E'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{bal.employee?.emp_name || '—'}</p>
                              <p className="text-xs text-slate-400">#{bal.employee?.employee_code} • {bal.employee?.department?.name || '—'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-xs font-mono text-slate-500">
                          {bal.employee?.emp_start_date || '—'}
                        </td>

                        <td className="py-4 px-4 text-center font-semibold text-slate-600">
                          {bal.carried_over_balance}
                        </td>

                        <td className="py-4 px-4 text-center font-semibold text-slate-600">
                          {bal.initial_assigned_balance}
                        </td>

                        <td className="py-4 px-4 text-center font-semibold text-blue-600">
                          +{bal.monthly_accrued_balance}
                        </td>

                        <td className="py-4 px-4 text-center font-black text-slate-900">
                          {bal.total_entitled_balance}
                        </td>

                        <td className="py-4 px-4 text-center font-bold text-rose-600">
                          {bal.used_balance}
                        </td>

                        <td className="py-4 px-4 text-center font-bold text-amber-600">
                          {bal.pending_balance}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black text-sm border border-emerald-200">
                            {bal.remaining_balance} {t('days_unit')}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedBalance(bal);
                              setShowBalanceModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title={t('edit_balance_notes')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE TYPES */}
      {activeTab === 'types' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((tp) => (
              <div key={tp.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 relative group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                      {tp.type_slug}
                    </span>
                    <h3 className="font-bold text-lg text-slate-900">{tp.name}</h3>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingType(tp);
                        setShowTypeModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      onClick={() => handleDeleteType(tp.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('is_paid_leave')}:</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${tp.is_paid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {tp.is_paid ? t('paid') : t('unpaid')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('deduct_from_annual_balance')}:</span>
                    <span className={`font-bold ${tp.deduct_from_balance ? 'text-blue-600' : 'text-slate-400'}`}>
                      {tp.deduct_from_balance ? (language === 'ar' ? 'نعم' : 'Yes') : (language === 'ar' ? 'لا' : 'No')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('max_days_allowed')}:</span>
                    <span className="font-bold text-slate-700">
                      {tp.max_days_per_year > 0 ? `${tp.max_days_per_year} ${t('days_unit')}` : 'غير محدد (مفتوح)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('requires_medical_attachment')}:</span>
                    <span className={`font-bold ${tp.requires_attachment ? 'text-amber-600' : 'text-slate-400'}`}>
                      {tp.requires_attachment ? 'مطلوب إرفاق تقرير' : 'اختياري'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REUSABLE VACATION MODALS */}
      <VacationRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={fetchData}
        types={types}
        isManager={isManager}
        employees={employees}
        currentUser={currentUser}
        currentEmployeeBalance={myBalance}
      />

      <VacationTypeModal
        isOpen={showTypeModal}
        onClose={() => { setShowTypeModal(false); setEditingType(null); }}
        onSuccess={fetchData}
        editingType={editingType}
      />

      <VacationBalanceModal
        isOpen={showBalanceModal}
        onClose={() => { setShowBalanceModal(false); setSelectedBalance(null); }}
        onSuccess={fetchData}
        balance={selectedBalance}
      />

      <RejectVacationModal
        isOpen={showRejectModal}
        onClose={() => { setShowRejectModal(false); setRejectingRequest(null); }}
        onSuccess={fetchData}
        request={rejectingRequest}
      />
    </div>
  );
}
