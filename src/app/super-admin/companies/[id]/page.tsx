'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

interface Subscription {
  id: number;
  company_id: string;
  plan_id: number;
  start_date: string;
  end_date: string | null;
  billing_cycle: 'monthly' | 'yearly' | 'lifetime' | 'free' | 'custom';
  price: number;
  currency: string;
  status: 'active' | 'expired' | 'canceled' | 'trial';
  notes: string | null;
  created_at: string;
  plan?: {
    id: number;
    name: string;
    slug: string;
    max_users: number;
  };
  creator?: {
    id: number;
    name: string;
  };
}

interface CompanyData {
  company: {
    id: string;
    company_name: string;
    company_code: string;
    domain: string | null;
    is_active: boolean;
    created_at: string;
  };
  admin_user: {
    id: number;
    name: string;
    username: string;
    email: string;
    created_at: string;
    is_active: boolean;
  } | null;
  stats: {
    active_users: number;
    total_users: number;
    total_employees: number;
    total_branches: number;
    max_users: number;
    usage_percent: number;
  };
  current_subscription: Subscription | null;
  subscription_history: Subscription[];
  available_plans: Array<{
    id: number;
    name: string;
    price_monthly: number;
    price_yearly: number;
    max_users: number;
  }>;
}

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params?.id as string;
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [data, setData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  // New Subscription Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subForm, setSubForm] = useState({
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    billing_cycle: 'monthly' as 'monthly' | 'yearly' | 'lifetime' | 'free' | 'custom',
    price: 0,
    currency: 'USD',
    status: 'active' as 'active' | 'expired' | 'canceled' | 'trial',
    notes: '',
  });

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');

    if (hours === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) {
      return `${year}-${month}-${day}`;
    }

    const ampm = language === 'ar' ? (hours >= 12 ? 'م' : 'ص') : (hours >= 12 ? 'PM' : 'AM');
    const formattedHours = hours % 12 || 12;
    return `${year}-${month}-${day} (${formattedHours}:${minutes} ${ampm})`;
  };


  useEffect(() => {

    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/companies/${companyId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': language,
        }
      });

      const json = await res.json();
      if (json.status) {
        setData(json.data);
      } else {
        showToast(json.message || 'Error fetching company details', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(language === 'ar' ? 'فشل تحميل بيانات الشركة' : 'Error fetching company', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openNewSubModal = () => {
    const defaultPlan = data?.available_plans?.[0];
    setSubForm({
      plan_id: defaultPlan ? String(defaultPlan.id) : '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      billing_cycle: 'monthly',
      price: defaultPlan ? defaultPlan.price_monthly : 0,
      currency: 'USD',
      status: 'active',
      notes: '',
    });
    setIsSubModalOpen(true);
  };

  const handlePlanChangeInForm = (planIdStr: string) => {
    const selected = data?.available_plans?.find(p => String(p.id) === planIdStr);
    if (selected) {
      setSubForm(prev => ({
        ...prev,
        plan_id: planIdStr,
        price: prev.billing_cycle === 'yearly' ? selected.price_yearly : selected.price_monthly
      }));
    } else {
      setSubForm(prev => ({ ...prev, plan_id: planIdStr }));
    }
  };

  const handleBillingCycleChange = (cycle: any) => {
    const selected = data?.available_plans?.find(p => String(p.id) === subForm.plan_id);
    let newPrice = subForm.price;
    if (selected) {
      if (cycle === 'yearly') newPrice = selected.price_yearly;
      else if (cycle === 'monthly') newPrice = selected.price_monthly;
      else if (cycle === 'free') newPrice = 0;
    }
    setSubForm(prev => ({
      ...prev,
      billing_cycle: cycle,
      price: newPrice
    }));
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/companies/${companyId}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': language,
        },
        body: JSON.stringify(subForm)
      });

      const resData = await res.json();
      if (resData.status) {
        showToast(resData.message || (language === 'ar' ? 'تم تحديث الاشتراك بنجاح' : 'Subscription updated'), 'success');
        setIsSubModalOpen(false);
        fetchCompanyDetails();
      } else {
        showToast(resData.message || 'Error occurred', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (subscriptionId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/subscriptions/${subscriptionId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': language,
        },
        body: JSON.stringify({ status: newStatus })
      });

      const resData = await res.json();
      if (resData.status) {
        showToast(resData.message || 'Status updated', 'success');
        fetchCompanyDetails();
      } else {
        showToast(resData.message || 'Error', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error', 'error');
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { company, admin_user, stats, current_subscription, subscription_history } = data;
  const isCustomOrUnlimited = stats.max_users >= 999999 || stats.max_users === 0;

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/super-admin/companies"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60"
        >
          <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <span>{language === 'ar' ? 'الرجوع إلى قائمة الشركات' : 'Back to Companies'}</span>
        </Link>

        <button
          onClick={openNewSubModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          <span>{t('add_new_subscription')}</span>
        </button>
      </div>

      {/* Main Company Header Card */}
      <div className="bg-slate-800/90 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-600/30">
              {company.company_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white">{company.company_name}</h1>
                <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                  company.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {company.is_active ? t('active') : t('inactive')}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
                <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                  <span className="text-slate-500">CODE:</span>
                  <span className="text-cyan-400 font-bold">{company.company_code}</span>
                </div>
                {company.domain && (
                  <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                    <span className="text-slate-500">DOMAIN:</span>
                    <span className="text-indigo-300">{company.domain}</span>
                  </div>
                )}
                <div className="text-slate-400">
                  {language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'} {new Date(company.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Current Plan Badge Card */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/70 min-w-[240px]">
            <div className="text-xs text-slate-400 font-medium">{t('current_plan_badge')}</div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-lg font-bold text-blue-400">
                {current_subscription?.plan?.name || (language === 'ar' ? 'لا يوجد اشتراك نشط' : 'No Active Plan')}
              </span>
              {current_subscription && (
                <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold uppercase ${
                  current_subscription.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {current_subscription.status}
                </span>
              )}
            </div>
            {current_subscription && (
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-800 pt-1.5">
                <span>{current_subscription.billing_cycle}</span>
                <span>
                  {current_subscription.end_date ? `${language === 'ar' ? 'ينتهي في:' : 'Expires:'} ${formatDate(current_subscription.end_date)}` : t('no_end_date')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats & Usage Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Users vs Plan Capacity */}
        <div className="bg-slate-800 border border-slate-700/70 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{t('active_users_vs_plan')}</span>
            <span className="text-blue-400 font-bold">
              {isCustomOrUnlimited ? t('unlimited') : `${stats.usage_percent}%`}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.active_users}</span>
            <span className="text-slate-400 text-sm font-semibold">
              / {isCustomOrUnlimited ? '∞' : stats.max_users} {t('users_label')}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-2.5 mt-3 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.usage_percent >= 90
                  ? 'bg-rose-500'
                  : stats.usage_percent >= 75
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(stats.usage_percent, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Total Employees */}
        <div className="bg-slate-800 border border-slate-700/70 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">{t('employees_count')}</div>
            <div className="text-3xl font-black text-white mt-1">{stats.total_employees}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
        </div>

        {/* Total Branches */}
        <div className="bg-slate-800 border border-slate-700/70 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">{t('branches_count')}</div>
            <div className="text-3xl font-black text-white mt-1">{stats.total_branches}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
        </div>

        {/* Company Admin User */}
        <div className="bg-slate-800 border border-slate-700/70 rounded-2xl p-5 shadow-lg">
          <div className="text-xs text-slate-400">{language === 'ar' ? 'مدير الشركة' : 'Company Admin'}</div>
          {admin_user ? (
            <div className="mt-1">
              <div className="text-base font-bold text-white truncate">{admin_user.name}</div>
              <div className="text-xs text-slate-400 font-mono truncate">{admin_user.email}</div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 mt-1">{t('no_data')}</div>
          )}
        </div>
      </div>

      {/* Subscription Logs & History Table */}
      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">{t('subscription_history')}</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {language === 'ar' ? 'سجل تفصيلي بكافة الاشتراكات والتجديدات وحالتها عبر الزمن' : 'Complete logs of all previous and active company subscription periods'}
            </p>
          </div>
          <button
            onClick={openNewSubModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span>{t('add_new_subscription')}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left">
            <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase font-medium border-b border-slate-700/80">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">{t('plan_name')}</th>
                <th className="px-6 py-4">{t('max_users_limit')}</th>
                <th className="px-6 py-4">{t('amount')}</th>
                <th className="px-6 py-4">{t('billing_cycle')}</th>
                <th className="px-6 py-4">{t('start_date')}</th>
                <th className="px-6 py-4">{t('end_date')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4">{t('notes')}</th>
                <th className="px-6 py-4 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {subscription_history.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                    {t('no_data')}
                  </td>
                </tr>
              ) : (
                subscription_history.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-slate-700/30 transition-all">
                    <td className="px-6 py-4 text-slate-500 text-xs">{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-white">
                      {sub.plan?.name || (language === 'ar' ? 'باقة غير معروفة' : 'Unknown')}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-xs">
                      {sub.plan?.max_users ? `${sub.plan.max_users} ${t('users_label')}` : t('unlimited')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">
                      ${sub.price}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-xs">
                      <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                        {sub.billing_cycle === 'monthly' ? t('cycle_monthly') : sub.billing_cycle === 'yearly' ? t('cycle_yearly') : sub.billing_cycle === 'free' ? t('cycle_free') : sub.billing_cycle}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-xs font-mono">
                      {formatDate(sub.start_date)}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-xs font-mono">
                      {sub.end_date ? formatDate(sub.end_date) : t('no_end_date')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        sub.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : sub.status === 'expired'
                          ? 'bg-slate-700 text-slate-400'
                          : sub.status === 'trial'
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {sub.status === 'active' ? t('sub_status_active') : sub.status === 'expired' ? t('sub_status_expired') : sub.status === 'canceled' ? t('sub_status_canceled') : t('sub_status_trial')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs max-w-xs truncate">
                      {sub.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={sub.status}
                        onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="active">{t('sub_status_active')}</option>
                        <option value="expired">{t('sub_status_expired')}</option>
                        <option value="canceled">{t('sub_status_canceled')}</option>
                        <option value="trial">{t('sub_status_trial')}</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Renew Subscription */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{t('change_subscription_title')}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{company.company_name}</p>
              </div>
              <button onClick={() => setIsSubModalOpen(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleSubSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('plan_name')} *</label>
                <select
                  required
                  value={subForm.plan_id}
                  onChange={(e) => handlePlanChangeInForm(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="">{language === 'ar' ? 'اختر الباقة...' : 'Select Plan...'}</option>
                  {data.available_plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.max_users >= 999999 ? t('unlimited') : `${p.max_users} ${t('users_label')}`} - ${p.price_monthly}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('billing_cycle')} *</label>
                  <select
                    value={subForm.billing_cycle}
                    onChange={(e) => handleBillingCycleChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                  >
                    <option value="monthly">{t('cycle_monthly')}</option>
                    <option value="yearly">{t('cycle_yearly')}</option>
                    <option value="free">{t('cycle_free')}</option>
                    <option value="lifetime">{t('cycle_lifetime')}</option>
                    <option value="custom">{t('cycle_custom')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('amount')} ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={subForm.price}
                    onChange={(e) => setSubForm({ ...subForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('start_date')} *</label>
                  <input
                    type="date"
                    required
                    value={subForm.start_date}
                    onChange={(e) => setSubForm({ ...subForm, start_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('end_date')}</label>
                  <input
                    type="date"
                    value={subForm.end_date}
                    onChange={(e) => setSubForm({ ...subForm, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">{t('no_end_date')}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('status')} *</label>
                <select
                  value={subForm.status}
                  onChange={(e) => setSubForm({ ...subForm, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="active">{t('sub_status_active')}</option>
                  <option value="trial">{t('sub_status_trial')}</option>
                  <option value="expired">{t('sub_status_expired')}</option>
                  <option value="canceled">{t('sub_status_canceled')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('notes')}</label>
                <textarea
                  rows={2}
                  value={subForm.notes}
                  onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })}
                  placeholder="ملاحظات حول سبب الترقية أو تفاصيل الفاتورة..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {submitting ? t('saving') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
