'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

interface Plan {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price_monthly: number;
  price_yearly: number;
  max_users: number;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
}

export default function PlansPage() {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [planSubmitting, setPlanSubmitting] = useState(false);

  // Plan Form
  const [planForm, setPlanForm] = useState({
    name: '',
    slug: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    max_users: 5,
    is_active: true,
    is_popular: false,
    sort_order: 0,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': language,
        }
      });

      const json = await res.json();
      if (json.status) {
        setPlans(json.data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      showToast(language === 'ar' ? 'فشل تحميل بيانات الباقات' : 'Failed to fetch plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddPlanModal = () => {
    setEditingPlanId(null);
    setPlanForm({
      name: '',
      slug: '',
      description: '',
      price_monthly: 0,
      price_yearly: 0,
      max_users: 5,
      is_active: true,
      is_popular: false,
      sort_order: (plans.length + 1) * 1,
    });
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name || '',
      slug: plan.slug || '',
      description: plan.description || '',
      price_monthly: plan.price_monthly || 0,
      price_yearly: plan.price_yearly || 0,
      max_users: plan.max_users ?? 5,
      is_active: plan.is_active,
      is_popular: plan.is_popular,
      sort_order: plan.sort_order ?? 0,
    });
    setIsPlanModalOpen(true);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const url = editingPlanId
        ? `${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/plans/${editingPlanId}`
        : `${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/plans`;

      const method = editingPlanId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': language,
        },
        body: JSON.stringify(planForm)
      });

      const data = await res.json();
      if (data.status) {
        showToast(data.message || (language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully'), 'success');
        setIsPlanModalOpen(false);
        fetchPlans();
      } else {
        showToast(data.message || (language === 'ar' ? 'حدث خطأ' : 'Error'), 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
    } finally {
      setPlanSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذه الباقة؟' : 'Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/plans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': language,
        }
      });

      const data = await res.json();
      if (data.status) {
        showToast(data.message || (language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully'), 'success');
        fetchPlans();
      } else {
        showToast(data.message || (language === 'ar' ? 'حدث خطأ' : 'Error'), 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 backdrop-blur border border-slate-700/70 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            {language === 'ar' ? 'الباقات' : 'Plans'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {language === 'ar'
              ? 'إدارة وتعديل باقات الاشتراك الشهرية والسنوية وتحديد الحد الأقصى للموظفين لكل باقة'
              : 'Manage monthly and yearly subscription tiers and employee capacity limits'}
          </p>
        </div>

        <button
          onClick={openAddPlanModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          <span>{t('add_new_plan')}</span>
        </button>
      </div>

      {/* Plans Comparison Table */}
      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700/80">
          <h2 className="text-lg font-bold text-white">{t('plans_list')}</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            {language === 'ar' ? 'جدول مقارنة الباقات والأسعار وحدود الموظفين' : 'Comparison table of plans and user limits'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left">
            <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase font-medium border-b border-slate-700/80">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">{t('plan_name')}</th>
                <th className="px-6 py-4">{t('max_users_limit')}</th>
                <th className="px-6 py-4">{t('price_monthly')}</th>
                <th className="px-6 py-4">{t('price_yearly')}</th>
                <th className="px-6 py-4">{t('is_popular')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-sm">
              {plans.filter(p => p.max_users < 999999 && p.slug !== 'custom').map((plan, idx) => (
                <tr key={plan.id} className="hover:bg-slate-700/30 transition-all">

                  <td className="px-6 py-4 text-slate-500 text-xs">{idx + 1}</td>
                  <td className="px-6 py-4 font-bold text-white">
                    <div>{plan.name}</div>
                    {plan.description && (
                      <div className="text-xs text-slate-400 font-normal mt-0.5">{plan.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg text-xs font-bold">
                      {plan.max_users >= 999999 ? t('unlimited') : `${plan.max_users} ${t('users_label')}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-400">
                    ${plan.price_monthly}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-300">
                    ${plan.price_yearly}
                  </td>
                  <td className="px-6 py-4">
                    {plan.is_popular ? (
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {t('popular_badge')}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      plan.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {plan.is_active ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditPlanModal(plan)}
                        className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all cursor-pointer"
                        title={t('edit')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                        title={t('delete')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Plan Create/Edit */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingPlanId ? t('edit_plan') : t('add_new_plan')}
              </h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handlePlanSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('plan_name')} *</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="مثال: الباقة الممتازة"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('max_users_limit')} *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={planForm.max_users}
                  onChange={(e) => setPlanForm({ ...planForm, max_users: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1">{t('max_users_desc')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('price_monthly')} ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={planForm.price_monthly}
                    onChange={(e) => setPlanForm({ ...planForm, price_monthly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('price_yearly')} ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={planForm.price_yearly}
                    onChange={(e) => setPlanForm({ ...planForm, price_yearly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('notes')} / {language === 'ar' ? 'الوصف' : 'Description'}</label>
                <textarea
                  rows={3}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="وصف مختصر للباقة وسعتها..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                ></textarea>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={planForm.is_popular}
                    onChange={(e) => setPlanForm({ ...planForm, is_popular: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  <span>{t('is_popular')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={planForm.is_active}
                    onChange={(e) => setPlanForm({ ...planForm, is_active: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  <span>{t('active')}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={planSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {planSubmitting ? t('saving') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
