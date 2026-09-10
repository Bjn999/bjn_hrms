'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

interface UpgradeRequest {
  id: number;
  company_id: string;
  user_id: number;
  current_plan_id: number | null;
  requested_plan_id: number;
  requested_billing_cycle: 'monthly' | 'yearly' | 'free';
  request_type: 'upgrade' | 'renewal';
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  company?: {
    id: string;
    company_name: string;
    email: string;
    phone_number: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  current_plan?: {
    id: number;
    name: string;
    max_users: number;
  } | null;
  requested_plan?: {
    id: number;
    name: string;
    max_users: number;
    price_monthly: number;
    price_yearly: number;
  };
  reviewer?: {
    id: number;
    name: string;
  } | null;
}

interface CompanySubscriptionItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  total_employees: number;
  total_users: number;
  max_users: number;
  current_subscription?: {
    id: number;
    plan_id: number;
    billing_cycle: string;
    price: number;
    currency: string;
    start_date: string;
    end_date: string | null;
    status: string;
    plan?: {
      id: number;
      name: string;
      slug: string;
      max_users: number;
    };
  } | null;
}

interface PlanFilter {
  id: number;
  name: string;
  slug: string;
}

function SubscriptionsPageContent() {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [activeMainTab, setActiveMainTab] = useState<'requests' | 'active_subscriptions'>('requests');

  // Tab 1: Upgrade Requests State
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [requestStats, setRequestStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [requestStatusFilter, setRequestStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Approve / Reject modal state
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject';
    request: UpgradeRequest | null;
    adminNotes: string;
    processing: boolean;
  }>({
    isOpen: false,
    type: 'approve',
    request: null,
    adminNotes: '',
    processing: false,
  });

  // Tab 2: Company Subscriptions State
  const [companies, setCompanies] = useState<CompanySubscriptionItem[]>([]);
  const [plansList, setPlansList] = useState<PlanFilter[]>([]);
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const statusParam = searchParams.get('status');

    if (tabParam === 'requests' || tabParam === 'active_subscriptions') {
      setActiveMainTab(tabParam);
    }
    if (statusParam === 'pending' || statusParam === 'approved' || statusParam === 'rejected' || statusParam === 'all') {
      setRequestStatusFilter(statusParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRequests();
  }, [requestStatusFilter]);

  useEffect(() => {
    if (activeMainTab === 'active_subscriptions') {
      fetchCompaniesSubscriptions();
    }
  }, [activeMainTab, selectedPlanFilter]);

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const token = localStorage.getItem('auth_token');
      const queryParam = requestStatusFilter !== 'all' ? `?status=${requestStatusFilter}` : '';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/subscription-requests${queryParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Accept-Language': language,
          },
        }
      );
      const json = await res.json();
      if (json.status) {
        setRequests(json.data.requests || []);
        if (json.data.stats) {
          setRequestStats(json.data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching upgrade requests:', error);
      showToast(language === 'ar' ? 'فشل تحميل طلبات الترقية' : 'Failed to fetch upgrade requests', 'error');
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchCompaniesSubscriptions = async () => {
    setLoadingCompanies(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (selectedPlanFilter !== 'all') params.append('plan_id', selectedPlanFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/company-subscriptions-list?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Accept-Language': language,
          },
        }
      );
      const json = await res.json();
      if (json.status) {
        setCompanies(json.data.companies || []);
        if (json.data.plans) {
          setPlansList(json.data.plans);
        }
      }
    } catch (error) {
      console.error('Error fetching companies subscriptions:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const openApproveModal = (req: UpgradeRequest) => {
    setActionModal({
      isOpen: true,
      type: 'approve',
      request: req,
      adminNotes: '',
      processing: false,
    });
  };

  const openRejectModal = (req: UpgradeRequest) => {
    setActionModal({
      isOpen: true,
      type: 'reject',
      request: req,
      adminNotes: '',
      processing: false,
    });
  };

  const handleActionConfirm = async () => {
    if (!actionModal.request) return;

    setActionModal((prev) => ({ ...prev, processing: true }));
    try {
      const token = localStorage.getItem('auth_token');
      const endpoint =
        actionModal.type === 'approve'
          ? `${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/subscription-requests/${actionModal.request.id}/approve`
          : `${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/subscription-requests/${actionModal.request.id}/reject`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': language,
        },
        body: JSON.stringify({
          admin_notes: actionModal.adminNotes || null,
        }),
      });

      const json = await res.json();
      if (json.status) {
        showToast(
          json.message ||
            (actionModal.type === 'approve'
              ? language === 'ar'
                ? 'تمت الموافقة وترقية الاشتراك بنجاح'
                : 'Approved and subscription upgraded'
              : language === 'ar'
              ? 'تم رفض الطلب'
              : 'Request rejected'),
          'success'
        );
        setActionModal({ isOpen: false, type: 'approve', request: null, adminNotes: '', processing: false });
        fetchRequests();
      } else {
        showToast(json.message || 'Error', 'error');
        setActionModal((prev) => ({ ...prev, processing: false }));
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
      setActionModal((prev) => ({ ...prev, processing: false }));
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 backdrop-blur border border-slate-700/70 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            {language === 'ar' ? 'الاشتراكات' : 'Subscriptions'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {language === 'ar'
              ? 'إدارة اشتراكات الشركات ومراجعة واعتماد طلبات الترقية والتجديد الواردة'
              : 'Manage company subscriptions and review incoming upgrade/renewal requests'}
          </p>
        </div>

        {/* Main Tab Switcher */}
        <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-700 inline-flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setActiveMainTab('requests')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'requests'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{language === 'ar' ? 'الطلبات' : 'Requests'}</span>
            {requestStats.pending > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-amber-500 text-slate-900">
                {requestStats.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveMainTab('active_subscriptions')}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'active_subscriptions'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{language === 'ar' ? 'الاشتراكات' : 'Subscriptions'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: UPGRADE & RENEWAL REQUESTS */}
      {activeMainTab === 'requests' && (
        <div className="space-y-6">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              onClick={() => setRequestStatusFilter('all')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                requestStatusFilter === 'all'
                  ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <div className="text-xs text-slate-400 font-medium">{language === 'ar' ? 'إجمالي الطلبات' : 'Total Requests'}</div>
              <div className="text-2xl font-black text-white mt-1">{requestStats.total}</div>
            </div>

            <div
              onClick={() => setRequestStatusFilter('pending')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                requestStatusFilter === 'pending'
                  ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>{language === 'ar' ? 'طلبات قيد الانتظار' : 'Pending Review'}</span>
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1">{requestStats.pending}</div>
            </div>

            <div
              onClick={() => setRequestStatusFilter('approved')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                requestStatusFilter === 'approved'
                  ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <div className="text-xs text-emerald-400 font-medium">{language === 'ar' ? 'تمت الموافقة' : 'Approved'}</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{requestStats.approved}</div>
            </div>

            <div
              onClick={() => setRequestStatusFilter('rejected')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                requestStatusFilter === 'rejected'
                  ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <div className="text-xs text-rose-400 font-medium">{language === 'ar' ? 'طلبات مرفوضة' : 'Rejected'}</div>
              <div className="text-2xl font-black text-rose-400 mt-1">{requestStats.rejected}</div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-slate-800 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-700/80 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {language === 'ar' ? 'قائمة طلبات الترقية والتجديد' : 'Upgrade & Renewal Requests List'}
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {language === 'ar'
                    ? 'مراجعة طلبات الشركات مع إمكانية الترقية الفورية التلقائية أو الرفض'
                    : 'Review requests from companies with instant automatic upgrade or rejection'}
                </p>
              </div>

              <button
                onClick={fetchRequests}
                className="p-2 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                title={language === 'ar' ? 'تحديث' : 'Refresh'}
              >
                <svg className={`w-4 h-4 ${loadingRequests ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {loadingRequests ? (
              <div className="py-20 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {language === 'ar' ? 'لا توجد طلبات ترقية أو تجديد مطابقة للفلتر' : 'No requests found matching filter'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right rtl:text-right ltr:text-left">
                  <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase font-medium border-b border-slate-700/80">
                    <tr>
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'الشركة' : 'Company'}</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'نوع الطلب' : 'Request Type'}</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'الباقة الحالية' : 'Current Plan'}</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'الباقة المطلوبة' : 'Requested Plan'}</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'الفوترة' : 'Cycle'}</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'تاريخ الطلب' : 'Date'}</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="px-6 py-4 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 text-sm">
                    {requests.map((req, idx) => {
                      const isUpgrade = req.request_type === 'upgrade';
                      const isPending = req.status === 'pending';

                      return (
                        <tr key={req.id} className="hover:bg-slate-700/30 transition-all">
                          <td className="px-6 py-4 text-slate-500 text-xs">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{req.company?.company_name || '---'}</div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {req.user?.name || req.company?.email || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                isUpgrade
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              }`}
                            >
                              {isUpgrade
                                ? language === 'ar'
                                  ? 'ترقية باقة'
                                  : 'Upgrade'
                                : language === 'ar'
                                ? 'تجديد باقة'
                                : 'Renewal'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-300 text-xs font-medium">
                            {req.current_plan ? (
                              <span>
                                {req.current_plan.name} ({req.current_plan.max_users} موظف)
                              </span>
                            ) : (
                              <span className="text-slate-500">الباقة المجانية</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-black text-indigo-300">
                              {req.requested_plan?.name || '---'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {req.requested_plan?.max_users} {language === 'ar' ? 'موظف' : 'users'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-300">
                            {req.requested_billing_cycle === 'yearly'
                              ? language === 'ar'
                                ? 'سنوي'
                                : 'Yearly'
                              : req.requested_billing_cycle === 'monthly'
                              ? language === 'ar'
                                ? 'شهري'
                                : 'Monthly'
                              : 'مجاني'}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {formatDate(req.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                req.status === 'pending'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : req.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {req.status === 'pending'
                                ? language === 'ar'
                                  ? 'قيد الانتظار'
                                  : 'Pending'
                                : req.status === 'approved'
                                ? language === 'ar'
                                  ? 'تمت الموافقة'
                                  : 'Approved'
                                : language === 'ar'
                                ? 'مرفوض'
                                : 'Rejected'}
                            </span>
                            {req.notes && (
                              <div className="text-[11px] text-slate-400 mt-1 max-w-xs truncate" title={req.notes}>
                                <strong className="text-slate-300">{language === 'ar' ? 'ملاحظة:' : 'Note:'}</strong> {req.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isPending ? (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openApproveModal(req)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                                  title={language === 'ar' ? 'قبول وترقية فورية' : 'Approve & Upgrade'}
                                >
                                  {language === 'ar' ? 'قبول' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => openRejectModal(req)}
                                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                                  title={language === 'ar' ? 'رفض الطلب' : 'Reject'}
                                >
                                  {language === 'ar' ? 'رفض' : 'Reject'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">
                                {req.reviewer ? `${language === 'ar' ? 'تم بواسطة' : 'By'}: ${req.reviewer.name}` : '-'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE COMPANY SUBSCRIPTIONS */}
      {activeMainTab === 'active_subscriptions' && (
        <div className="space-y-6">
          {/* Filter Cards by Plan */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSelectedPlanFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedPlanFilter === 'all'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {language === 'ar' ? 'الكل' : 'All Plans'}
            </button>

            {plansList.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanFilter(String(plan.id))}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedPlanFilter === String(plan.id)
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-500 text-white shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {plan.name}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCompaniesSubscriptions()}
                placeholder={language === 'ar' ? 'بحث باسم الشركة، البريد أو الهاتف...' : 'Search company, email or phone...'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={fetchCompaniesSubscriptions}
                className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Companies Subscriptions Table */}
          <div className="bg-slate-800 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-700/80">
              <h2 className="text-lg font-bold text-white">
                {language === 'ar' ? 'اشتراكات الشركات الحالية' : 'Active Company Subscriptions'}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                {language === 'ar'
                  ? 'عرض باقات الشركات الحالية وسعة الموظفين وتواريخ التجديد'
                  : 'Overview of active company tiers, employee capacity, and renewal dates'}
              </p>
            </div>

            {loadingCompanies ? (
              <div className="py-20 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : companies.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                {language === 'ar' ? 'لا توجد شركات مطابقة للبحث' : 'No companies found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right rtl:text-right ltr:text-left">
                  <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase font-medium border-b border-slate-700/80">
                    <tr>
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'الشركة' : 'Company'}</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'الباقة الحالية' : 'Current Plan'}</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'دورة الفوترة' : 'Billing'}</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'سعة الموظفين' : 'Employees Usage'}</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'تاريخ البدء' : 'Start Date'}</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</th>
                      <th className="px-6 py-4">{language === 'ar' ? 'حالة الاشتراك' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 text-sm">
                    {companies.map((comp, idx) => {
                      const sub = comp.current_subscription;
                      const plan = sub?.plan;
                      const maxUsers = plan?.max_users || 5;
                      const percent = Math.min(100, Math.round((comp.total_employees / maxUsers) * 100));

                      return (
                        <tr key={comp.id} className="hover:bg-slate-700/30 transition-all">
                          <td className="px-6 py-4 text-slate-500 text-xs">{idx + 1}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{comp.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{comp.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-xs font-black">
                              {plan?.name || 'الباقة المجانية'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-300 font-semibold">
                            {sub?.billing_cycle === 'yearly'
                              ? language === 'ar' ? 'سنوي' : 'Yearly'
                              : sub?.billing_cycle === 'monthly'
                              ? language === 'ar' ? 'شهري' : 'Monthly'
                              : 'مجاني'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-white">{comp.total_employees}</span>
                              <span className="text-slate-400">/ {maxUsers}</span>
                              <span className="text-[11px] text-slate-500">({percent}%)</span>
                            </div>
                            <div className="w-24 bg-slate-700 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percent >= 90 ? 'bg-rose-500' : percent >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {formatDate(sub?.start_date)}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {sub?.end_date ? formatDate(sub.end_date) : language === 'ar' ? 'بدون انتهاء' : 'Indefinite'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                comp.is_active
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {comp.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Disabled')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approve / Reject Action Modal */}
      {actionModal.isOpen && actionModal.request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {actionModal.type === 'approve' ? (
                  <>
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{language === 'ar' ? 'الموافقة على الطلب وترقية الاشتراك' : 'Approve & Upgrade Subscription'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{language === 'ar' ? 'رفض طلب الترقية / التجديد' : 'Reject Request'}</span>
                  </>
                )}
              </h3>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-xs">{language === 'ar' ? 'الشركة:' : 'Company:'}</span>
                  <span className="font-bold text-white">{actionModal.request.company?.company_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-xs">{language === 'ar' ? 'نوع الطلب:' : 'Request Type:'}</span>
                  <span className="font-bold text-indigo-400">
                    {actionModal.request.request_type === 'upgrade' ? (language === 'ar' ? 'ترقية باقة' : 'Upgrade') : (language === 'ar' ? 'تجديد باقة' : 'Renewal')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-xs">{language === 'ar' ? 'الباقة المطلوبة:' : 'Requested Plan:'}</span>
                  <span className="font-bold text-emerald-400">
                    {actionModal.request.requested_plan?.name} ({actionModal.request.requested_billing_cycle === 'yearly' ? 'سنوي' : 'شهري'})
                  </span>
                </div>
                {actionModal.request.notes && (
                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
                    <strong className="text-slate-400">{language === 'ar' ? 'ملاحظة العميل:' : 'Customer Note:'}</strong> {actionModal.request.notes}
                  </div>
                )}
              </div>

              {actionModal.type === 'approve' ? (
                <div className="text-xs text-slate-300 leading-relaxed">
                  {language === 'ar'
                    ? 'عند تأكيد الموافقة، سيتم تلقائياً تفعيل الاشتراك الجديد للشركة في النظام وتعيين تاريخ البدء والانتهاء وفقاً للباقة والدورة المختارة.'
                    : 'Upon approval, the new subscription will be automatically activated in the system.'}
                </div>
              ) : (
                <div className="text-xs text-rose-300 leading-relaxed">
                  {language === 'ar'
                    ? 'سيتم وضع علامة رفض على هذا الطلب مع إمكانية توضيح السبب في الملاحظات أدناه.'
                    : 'This request will be marked as declined.'}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {language === 'ar' ? 'ملاحظات الإدارة (اختياري)' : 'Admin Notes (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={actionModal.adminNotes}
                  onChange={(e) => setActionModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder={language === 'ar' ? 'ملاحظات تظهر في سجل الطلب...' : 'Notes to store with request record...'}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
            </div>

            <div className="p-6 bg-slate-900/60 border-t border-slate-700 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, type: 'approve', request: null, adminNotes: '', processing: false })}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs transition-all cursor-pointer"
              >
                {t('cancel')}
              </button>

              <button
                type="button"
                disabled={actionModal.processing}
                onClick={handleActionConfirm}
                className={`px-6 py-2 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  actionModal.type === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20'
                }`}
              >
                {actionModal.processing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>{actionModal.type === 'approve' ? (language === 'ar' ? 'تأكيد الموافقة والترقية' : 'Confirm & Upgrade') : (language === 'ar' ? 'تأكيد الرفض' : 'Confirm Rejection')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12 text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SubscriptionsPageContent />
    </Suspense>
  );
}

