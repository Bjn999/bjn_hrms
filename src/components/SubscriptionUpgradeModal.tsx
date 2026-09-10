'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId?: number | null;
  currentPlanSlug?: string | null;
  currentBillingCycle?: 'monthly' | 'yearly' | 'free' | string;
  hasPendingRequest?: boolean;
  pendingRequestDetails?: any;
  onSuccess?: () => void;
}

export default function SubscriptionUpgradeModal({
  isOpen,
  onClose,
  currentPlanId,
  currentPlanSlug,
  currentBillingCycle = 'monthly',
  hasPendingRequest = false,
  pendingRequestDetails = null,
  onSuccess,
}: SubscriptionUpgradeModalProps) {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>(
    currentBillingCycle === 'yearly' ? 'yearly' : 'monthly'
  );
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/public-plans`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': language,
        },
      });
      const json = await res.json();
      if (json.status && Array.isArray(json.data)) {
        const standardPlans = json.data.filter(
          (p: Plan) => p.max_users < 999999 && p.slug !== 'custom'
        );
        setPlans(standardPlans);

        const currentP = standardPlans.find(
          (p: Plan) => (currentPlanId && p.id === currentPlanId) || (currentPlanSlug && p.slug === currentPlanSlug)
        );
        const isFree = !currentP || currentP.price_monthly === 0 || currentP.slug === 'free';

        // Auto select: If on Free plan, auto-select first paid upgrade tier (e.g. Basic)
        if (isFree) {
          const firstPaid = standardPlans.find((p: Plan) => p.price_monthly > 0);
          if (firstPaid) setSelectedPlanId(firstPaid.id);
          else if (standardPlans.length > 0) setSelectedPlanId(standardPlans[0].id);
        } else {
          if (currentPlanId) {
            setSelectedPlanId(currentPlanId);
          } else if (currentPlanSlug) {
            const match = standardPlans.find((p: Plan) => p.slug === currentPlanSlug);
            if (match) setSelectedPlanId(match.id);
            else if (standardPlans.length > 0) setSelectedPlanId(standardPlans[0].id);
          } else if (standardPlans.length > 0) {
            setSelectedPlanId(standardPlans[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const currentPlan = plans.find(
    (p) => (currentPlanId && p.id === currentPlanId) || (currentPlanSlug && p.slug === currentPlanSlug)
  ) || (plans.length > 0 ? plans[0] : null);

  const isCurrentPlanFree = !currentPlan || currentPlan.price_monthly === 0 || currentPlan.slug === 'free';
  const currentPlanMaxUsers = currentPlan ? currentPlan.max_users : 5;
  const currentPlanIndex = plans.findIndex((p) => p.id === currentPlan?.id);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  // Determine if action is Renewal or Upgrade: Free plan cannot be renewed, only upgraded!
  const isCurrentPaidPlanSelected = !isCurrentPlanFree && selectedPlan && currentPlan && selectedPlan.id === currentPlan.id;
  const requestType: 'upgrade' | 'renewal' = isCurrentPaidPlanSelected ? 'renewal' : 'upgrade';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) {
      showToast(language === 'ar' ? 'يرجى اختيار باقة' : 'Please select a plan', 'error');
      return;
    }

    if (hasPendingRequest) {
      showToast(
        language === 'ar'
          ? 'يوجد طلب معلق قيد المراجعة حالياً، يرجى الانتظار حتى اعتماده'
          : 'There is already a pending request under review',
        'error'
      );
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/admin/subscription-upgrade-requests`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': language,
          },
          body: JSON.stringify({
            requested_plan_id: selectedPlanId,
            requested_billing_cycle: selectedPlan?.price_monthly === 0 ? 'free' : selectedBillingCycle,
            request_type: requestType,
            notes: notes || null,
          }),
        }
      );

      const json = await res.json();
      if (json.status) {
        showToast(
          json.message ||
            (language === 'ar'
              ? 'تم إرسال طلبك بنجاح وهو قيد المراجعة'
              : 'Request submitted successfully'),
          'success'
        );
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast(json.message || (language === 'ar' ? 'حدث خطأ' : 'Error occurred'), 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden my-auto relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Simple & Clean Header */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {language === 'ar' ? 'ترقية أو تجديد الباقة' : 'Upgrade or Renew Plan'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'ar'
                ? 'اختر الباقة المناسبة لسعة شركتك لتجديدها أو ترقيتها فورياً'
                : 'Select the ideal plan for your company capacity to renew or upgrade'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Billing Cycle Pill Toggle */}
            <div className="bg-slate-200/70 p-1 rounded-xl inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedBillingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('cycle_monthly')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedBillingCycle === 'yearly'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{t('cycle_yearly')}</span>
                <span className={`px-1.5 py-0.2 text-[9px] font-black rounded ${selectedBillingCycle === 'yearly' ? 'bg-indigo-800 text-white' : 'bg-emerald-500 text-white'}`}>
                  {language === 'ar' ? 'وفر شهرين' : 'Save 2mo'}
                </span>
              </button>
            </div>

            {/* Close X button */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 p-2 rounded-xl transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Pending Request Alert (if any) */}
        {hasPendingRequest && (
          <div className="mx-6 mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-amber-950 text-sm mb-0.5">
                {language === 'ar' ? 'يوجد طلب معلق قيد المراجعة حالياً' : 'A request is currently pending review'}
              </div>
              <div>
                {language === 'ar'
                  ? 'تم إرسال طلب سابق وهو قيد المراجعة من قِبل إدارة النظام. تم إلغاء تفعيل زر الترقية حتى يتم اعتماد أو إغلاق الطلب السابق.'
                  : 'A previous request is pending approval. Submit action is disabled until reviewed.'}
              </div>
              {pendingRequestDetails && (
                <div className="mt-1.5 text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-lg inline-block">
                  {language === 'ar'
                    ? `الباقة المطلوبة: ${pendingRequestDetails?.requested_plan?.name || '---'} (${pendingRequestDetails?.requested_billing_cycle === 'yearly' ? 'سنوي' : 'شهري'})`
                    : `Requested: ${pendingRequestDetails?.requested_plan?.name || '---'}`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {plans.map((plan, idx) => {
                const isCurrent = (currentPlanId && plan.id === currentPlanId) || (currentPlanSlug && plan.slug === currentPlanSlug);
                const isSelected = selectedPlanId === plan.id;
                const isPlanFree = plan.price_monthly === 0 && plan.price_yearly === 0;
                const price = selectedBillingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

                // Lock free plan if current plan is already free (cannot renew a free lifetime plan)
                const isFreePlanLocked = isCurrentPlanFree && isPlanFree;

                // Downgrade prevention check for paid plans
                const isLowerPlan = !isCurrentPlanFree && ((currentPlanIndex !== -1 && idx < currentPlanIndex) || (plan.max_users < currentPlanMaxUsers));
                const isCardDisabled = isFreePlanLocked || isLowerPlan;

                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      if (!isCardDisabled) {
                        setSelectedPlanId(plan.id);
                      }
                    }}
                    className={`relative rounded-2xl p-4 sm:p-4.5 border-2 transition-all flex flex-col justify-between select-none ${
                      isCardDisabled
                        ? 'opacity-40 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20 cursor-pointer'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm cursor-pointer'
                    }`}
                  >
                    {/* Top Badges */}
                    {isCurrent && (
                      <div className="absolute -top-2.5 right-3 rtl:right-auto rtl:left-3 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-sm">
                        {isPlanFree
                          ? language === 'ar' ? 'باقتك الحالية (مجانية)' : 'Current (Free)'
                          : language === 'ar' ? 'باقتك الحالية' : 'Current Plan'}
                      </div>
                    )}

                    {isLowerPlan && (
                      <div className="absolute -top-2.5 left-3 rtl:left-auto rtl:right-3 px-2 py-0.5 bg-slate-500 text-white text-[9px] font-bold rounded-full flex items-center gap-1 shadow-sm">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>{language === 'ar' ? 'غير متاح للتخفيض' : 'Locked'}</span>
                      </div>
                    )}

                    <div>
                      {/* Plan Name & Radio */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-slate-900">{plan.name}</span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isCardDisabled
                              ? 'border-slate-300 bg-slate-100 opacity-50'
                              : isSelected
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && !isCardDisabled && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="my-2.5 py-1.5 border-y border-slate-100">
                        {isPlanFree ? (
                          <div className="text-xl font-black text-emerald-600">{language === 'ar' ? 'مجاناً' : 'Free'}</div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900">${price}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              / {selectedBillingCycle === 'yearly' ? (language === 'ar' ? 'سنوي' : 'yr') : (language === 'ar' ? 'شهري' : 'mo')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Capacity */}
                      <div className="bg-slate-50 rounded-xl py-1.5 px-2 text-center border border-slate-100 text-[11px] font-bold text-slate-700">
                        {language === 'ar' ? `حتى ${plan.max_users} موظف` : `Up to ${plan.max_users} Employees`}
                      </div>
                    </div>

                    {/* Bottom Indicator in Card */}
                    <div className="text-center pt-2.5 text-[11px] font-bold">
                      {isFreePlanLocked ? (
                        <span className="text-slate-400 font-medium">{language === 'ar' ? 'مفعلة مدى الحياة' : 'Lifetime Active'}</span>
                      ) : isLowerPlan ? (
                        <span className="text-slate-400 font-normal">{language === 'ar' ? 'أقل من الحالية' : 'Lower tier'}</span>
                      ) : isCurrent ? (
                        <span className="text-blue-600">{language === 'ar' ? 'تجديد الباقة' : 'Renew'}</span>
                      ) : (
                        <span className="text-emerald-600">{language === 'ar' ? 'ترقية الباقة' : 'Upgrade'}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Notes field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              {language === 'ar' ? 'ملاحظات إضافية لإدارة النظام (اختياري)' : 'Additional Notes (Optional)'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'أي تفاصيل خاصة بتفعيل الاشتراك أو الفاتورة...'
                  : 'Any details regarding activation...'
              }
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {selectedPlan && (
                <span>
                  {language === 'ar' ? 'الباقة المختارة:' : 'Selected:'}{' '}
                  <strong className="text-slate-900">{selectedPlan.name}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {t('cancel')}
              </button>

              <button
                type="submit"
                disabled={submitting || hasPendingRequest || !selectedPlanId}
                className={`px-6 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 ${
                  hasPendingRequest || !selectedPlanId
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : isCurrentPaidPlanSelected
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 cursor-pointer active:scale-95'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 cursor-pointer active:scale-95'
                }`}
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isCurrentPaidPlanSelected ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      )}
                    </svg>
                    <span>
                      {isCurrentPaidPlanSelected
                        ? (language === 'ar' ? 'تجديد الباقة' : 'Renew Plan')
                        : (language === 'ar' ? 'ترقية الباقة' : 'Upgrade Plan')}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
