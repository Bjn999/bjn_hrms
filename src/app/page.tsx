'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

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
}

export default function Home() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Default initial plans
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 1,
      name: 'الباقة المجانية',
      slug: 'free',
      description: 'مثالية للمنشآت الناشئة وتجربة النظام بعدد موظفين محدود.',
      price_monthly: 0,
      price_yearly: 0,
      max_users: 5,
      is_active: true,
      is_popular: false,
    },
    {
      id: 2,
      name: 'الباقة الأساسية',
      slug: 'basic',
      description: 'للشركات الصغيرة التي تبدأ في تنظيم وإدارة شؤون موظفيها.',
      price_monthly: 29,
      price_yearly: 290,
      max_users: 15,
      is_active: true,
      is_popular: false,
    },
    {
      id: 3,
      name: 'الباقة الممتازة',
      slug: 'premium',
      description: 'الخيار الأفضل والأكثر طلباً للشركات المتنامية والمتوسطة.',
      price_monthly: 79,
      price_yearly: 790,
      max_users: 50,
      is_active: true,
      is_popular: true,
    },
    {
      id: 4,
      name: 'الباقة الاحترافية',
      slug: 'pro',
      description: 'للشركات الكبيرة التي تتطلب إدارة شاملة لعدد كبير من الموظفين.',
      price_monthly: 149,
      price_yearly: 1490,
      max_users: 100,
      is_active: true,
      is_popular: false,
    },
    {
      id: 5,
      name: 'باقة مخصصة',
      slug: 'custom',
      description: 'حلول مؤسسية غير محدودة مصممة خصيصاً للمنشآت الضخمة والشركات الكبرى.',
      price_monthly: 0,
      price_yearly: 0,
      max_users: 999999,
      is_active: true,
      is_popular: false,
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const token = localStorage.getItem('auth_token');
      if (token) {
        setIsLoggedIn(true);
      }
    }, 0);

    // Fetch dynamic public plans from server if available
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/public-plans`)
      .then(res => res.json())
      .then(data => {
        if (data.status && Array.isArray(data.data) && data.data.length > 0) {
          setPlans(data.data);
        }
      })
      .catch(() => {});

    return () => clearTimeout(timer);
  }, []);

  const handleLanguageToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleRegisterClick = () => {
    if (isLoggedIn) {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'super_admin') {
            router.push('/super-admin');
            return;
          }
        } catch (e) {}
      }
      router.push('/portal');
    } else {
      router.push('/register');
    }
  };

  const handleCtaClick = () => {
    if (isLoggedIn) {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'super_admin') {
            router.push('/super-admin');
            return;
          }
        } catch (e) {}
      }
      router.push('/portal');
    } else {
      router.push('/login');
    }
  };

  const handlePaidPlanContact = (planName: string, billing: 'monthly' | 'yearly', priceValue: number) => {
    const isAr = language === 'ar';
    const cycleText = billing === 'yearly' 
      ? (isAr ? 'الدفع السنوي' : 'Yearly Billing') 
      : (isAr ? 'الدفع الشهري' : 'Monthly Billing');
    
    const subject = encodeURIComponent(
      isAr 
        ? `طلب اشتراك في نظام BJN HRMS - ${planName} (${cycleText})` 
        : `BJN HRMS Subscription Request - ${planName} (${cycleText})`
    );

    const body = encodeURIComponent(
      isAr
        ? `السلام عليكم ورحمة الله وبركاته،\n\nأرغب في الاشتراك في (${planName}) بنظام ${cycleText} ($${priceValue}).\n\nبيانات المنشأة للتواصل والتفعيل:\n- اسم المنشأة / الشركة: \n- اسم المسؤول: \n- رقم الجوال / الواتساب: \n- البريد الإلكتروني: \n- عدد الموظفين المتوقع: \n- المدينة / الدولة: \n- ملاحظات إضافية: \n\nشاكرين ومقدرين لكم.`
        : `Hello,\n\nI would like to subscribe to (${planName}) with ${cycleText} ($${priceValue}).\n\nCompany Details for Activation:\n- Company Name: \n- Contact Person: \n- Phone / WhatsApp: \n- Email Address: \n- Expected Number of Employees: \n- City / Country: \n- Additional Notes: \n\nThank you.`
    );

    window.location.href = `mailto:sales@bjn-hrms.com?subject=${subject}&body=${body}`;
  };

  const handleEnterpriseContact = () => {
    const isAr = language === 'ar';
    const subject = encodeURIComponent(
      isAr
        ? 'طلب استفسار عن الباقة المخصصة للشركات الكبرى (Enterprise Plan)'
        : 'Inquiry for Enterprise Custom HRMS Plan (> 200 Employees)'
    );

    const body = encodeURIComponent(
      isAr
        ? `السلام عليكم ورحمة الله وبركاته،\n\nنود الاستفسار عن تفاصيل وأسعار الباقة المخصصة للشركات الكبرى (Enterprise).\n\nبيانات المنشأة:\n- اسم الشركة: \n- اسم المسؤول / المنصب: \n- رقم الجوال / الواتساب: \n- البريد الإلكتروني: \n- عدد الموظفين الإجمالي: \n- متطلبات خاصة أو ربط مخصص (API/ERP/خوادم خاصة): \n\nشاكرين لكم.`
        : `Hello,\n\nWe would like to inquire about details and pricing for the Enterprise HRMS Plan.\n\nCompany Information:\n- Company Name: \n- Contact Person / Title: \n- Phone / WhatsApp: \n- Email: \n- Total Number of Employees: \n- Custom Requirements / Integrations (API/ERP/Private Cloud): \n\nThank you.`
    );

    window.location.href = `mailto:sales@bjn-hrms.com?subject=${subject}&body=${body}`;
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isRtl = language === 'ar';

  // Separate standard plans (first 4 tiers) and custom plan (> 100 users)
  const standardPlans = plans.filter(p => p.max_users < 999999 && p.slug !== 'custom').slice(0, 4);
  const customPlan = plans.find(p => p.max_users >= 999999 || p.slug === 'custom') || plans[4];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden relative" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Soft Background Blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-2xl font-black text-slate-800">
                {t('hrms')}
              </span>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">
                {t('landing_features_title')}
              </a>
              <a href="#pricing" className="hover:text-blue-600 transition-colors flex items-center gap-1.5 text-blue-600">
                <span>{t('pricing_nav')}</span>
                <span className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-full font-bold">New</span>
              </a>
            </nav>
          </div>

          {/* Navigation CTAs */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Direct Pricing Link on mobile */}
            <a
              href="#pricing"
              className="md:hidden px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200"
            >
              {t('pricing_nav')}
            </a>

            {/* Language Switcher */}
            <button
              onClick={handleLanguageToggle}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-all duration-300 shadow-sm cursor-pointer"
            >
              <span>🌐</span>
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Auth Actions */}
            {isLoggedIn ? (
              <button
                onClick={handleCtaClick}
                className="relative group overflow-hidden px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-md shadow-blue-600/10 active:scale-95 cursor-pointer"
              >
                <span className="relative z-10">{t('landing_hero_cta_dashboard')}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleCtaClick}
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition-all duration-200 cursor-pointer"
                >
                  {t('landing_hero_cta_login')}
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="relative group overflow-hidden px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:opacity-95 transition-all duration-300 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                >
                  <span className="relative z-10">{t('join_free')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-6 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {t('system_online')}
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto mb-6">
              {t('landing_title')}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
              {t('landing_subtitle')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isLoggedIn ? (
                <button
                  onClick={handleCtaClick}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:opacity-90 shadow-xl shadow-blue-500/20 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>{t('landing_hero_cta_dashboard')}</span>
                  <svg className={`w-5 h-5 transition-transform ${isRtl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRegisterClick}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:opacity-95 shadow-xl shadow-blue-500/25 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <span>{t('join_free')}</span>
                    <svg className={`w-5 h-5 transition-transform ${isRtl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <button
                    onClick={handleCtaClick}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all duration-300 flex items-center justify-center shadow-sm cursor-pointer"
                  >
                    {t('landing_hero_cta_login')}
                  </button>
                </>
              )}

              <a
                href="#pricing"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 transition-all duration-300 flex items-center justify-center"
              >
                {t('pricing_nav')}
              </a>
            </div>
          </div>

          {/* Interactive Screen Preview */}
          <div className="mt-16 sm:mt-24 max-w-5xl mx-auto px-4 sm:px-6 relative">
            <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-3xl pointer-events-none -z-10 max-w-4xl mx-auto transform translate-y-8"></div>
            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 backdrop-blur-xl shadow-xl overflow-hidden relative">
              {/* Window controls */}
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500/70"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500/70"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/70"></div>
                <div className={`text-xs text-slate-400 font-mono ${isRtl ? 'mr-4' : 'ml-4'}`}>bjn_hrms_dashboard.app</div>
              </div>

              {/* Grid content mockup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">{t('total_employees')}</div>
                    <div className="text-2xl font-black text-slate-800">1,248</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shadow-inner">
                    👥
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">{t('current_month_salaries')}</div>
                    <div className="text-2xl font-black text-slate-800">$84,520</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shadow-inner">
                    💰
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">{t('absences_today')}</div>
                    <div className="text-2xl font-black text-slate-800">5</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg shadow-inner">
                    ⚠️
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-28 bg-slate-100/50 border-y border-slate-200/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                {t('landing_features_title')}
              </h2>
              <p className="text-slate-600 text-lg">
                {t('landing_features_subtitle')}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: t('landing_feature_emp_title'),
                  desc: t('landing_feature_emp_desc'),
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                  color: 'from-blue-500/10 to-cyan-500/10'
                },
                {
                  title: t('landing_feature_payroll_title'),
                  desc: t('landing_feature_payroll_desc'),
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ),
                  color: 'from-emerald-500/10 to-teal-500/10'
                },
                {
                  title: t('landing_feature_attendance_title'),
                  desc: t('landing_feature_attendance_desc'),
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11.57M12 11V3.07a8.001 8.001 0 014.7 2.83M12 11h3m-3-3v3m-1.753-2.753a8.005 8.005 0 00-5.73 5.73m11.46 0a8.005 8.005 0 01-5.73 5.73m0 0a8.005 8.005 0 01-5.73-5.73m0 0l3.44-2.04" />
                    </svg>
                  ),
                  color: 'from-purple-500/10 to-violet-500/10'
                },
                {
                  title: t('landing_feature_loans_title'),
                  desc: t('landing_feature_loans_desc'),
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  color: 'from-amber-500/10 to-orange-500/10'
                },
                {
                  title: t('landing_feature_settings_title'),
                  desc: t('landing_feature_settings_desc'),
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  color: 'from-pink-500/10 to-rose-500/10'
                },
                {
                  title: t('landing_feature_print_title'),
                  desc: t('landing_feature_print_desc'),
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  ),
                  color: 'from-indigo-500/10 to-sky-500/10'
                }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white hover:bg-white border border-slate-200/80 hover:border-blue-500/40 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden hover:-translate-y-1.5"
                >
                  {/* Decorative background flare */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.color} rounded-full blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

                  {/* Feature Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    {feature.icon}
                  </div>

                  {/* Text */}
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 sm:py-28 relative scroll-mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                {t('pricing_nav')}
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                {t('pricing_title')}
              </h2>
              <p className="text-slate-600 text-lg">
                {t('pricing_subtitle')}
              </p>

              {/* Billing Cycle Switcher */}
              <div className="mt-8 inline-flex items-center bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300/60 shadow-inner">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('pricing_monthly_toggle')}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === 'yearly'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{t('pricing_yearly_toggle')}</span>
                </button>
              </div>
            </div>

            {/* Standard 4 Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {standardPlans.map((plan) => {
                const isFree = plan.price_monthly === 0 && plan.price_yearly === 0;
                const price = billingCycle === 'yearly' ? Math.round(plan.price_yearly / 12) : plan.price_monthly;

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between bg-white rounded-3xl p-7 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 ${
                      plan.is_popular
                        ? 'border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/40'
                        : 'border-slate-200/90 shadow-sm'
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.is_popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-black rounded-full shadow-md uppercase tracking-wider">
                        {language === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 min-h-[36px] line-clamp-2">
                          {plan.description}
                        </p>
                      </div>

                      {/* Pricing Tag */}
                      <div className="py-4 my-2 border-y border-slate-100">
                        <div className="flex items-baseline gap-1">
                          {isFree ? (
                            <span className="text-3xl font-black text-emerald-600">{language === 'ar' ? 'مجاناً' : 'Free'}</span>
                          ) : (
                            <>
                              <span className="text-4xl font-black text-slate-900">${price}</span>
                              <span className="text-xs font-semibold text-slate-500">/ {t('cycle_monthly')}</span>
                            </>
                          )}
                        </div>
                        {!isFree && (
                          <div className="text-[11px] text-slate-400 mt-1 font-medium">
                            {billingCycle === 'yearly'
                              ? `${language === 'ar' ? 'تُدفع سنوياً بقيمة' : 'Billed annually at'} $${plan.price_yearly}`
                              : `${language === 'ar' ? 'أو' : 'or'} $${plan.price_yearly} ${language === 'ar' ? 'سنوياً' : '/year'}`}
                          </div>
                        )}
                      </div>

                      {/* Capacity Badge */}
                      <div className="bg-blue-50/80 rounded-2xl p-3.5 border border-blue-100 my-4 text-center">
                        <div className="text-xs text-blue-600 font-medium">{t('max_users_limit')}</div>
                        <div className="text-lg font-black text-blue-900 flex items-center justify-center gap-1.5 mt-0.5">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                          <span>{language === 'ar' ? `حتى ${plan.max_users} موظف` : `Up to ${plan.max_users} Employees`}</span>
                        </div>
                      </div>

                      {/* Feature Bullet points */}
                      <div className="space-y-2.5 text-xs text-slate-600 mb-6">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                          <span>{language === 'ar' ? 'إدارة الموظفين والملفات الكاملة' : 'Full Employee & Profile Management'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                          <span>{language === 'ar' ? 'احتساب الرواتب والبدلات والخصومات' : 'Automated Payroll & Allowances'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                          <span>{language === 'ar' ? 'مزامنة البصمة BioTime وسجلات الحضور' : 'BioTime Fingerprint Synchronization'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                          <span>{language === 'ar' ? 'بوابة الخدمة الذاتية للموظفين (ESS)' : 'Employee Self-Service Portal (ESS)'}</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    {isFree ? (
                      <button
                        onClick={handleRegisterClick}
                        className="w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/20"
                      >
                        {t('plan_cta_start_free')}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePaidPlanContact(plan.name, billingCycle, price)}
                        className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                          plan.is_popular
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-blue-500/20'
                            : 'bg-slate-900 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{t('contact_us_to_subscribe')}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom Plan / Enterprise Banner (Separate standalone section below) */}
            {customPlan && (
              <div className="mt-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-700 shadow-2xl relative overflow-hidden">
                {/* Decorative background flare */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="space-y-3 max-w-2xl text-center lg:text-start rtl:lg:text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                      <span>{language === 'ar' ? 'باقة مخصصة للشركات الكبرى (> 200 موظف)' : 'Enterprise Tier (> 200 Employees)'}</span>

                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      {t('custom_plan_banner_title')}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {t('custom_plan_banner_desc')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        {language === 'ar' ? 'سعة غير محدودة من الموظفين' : 'Unlimited Employee Quota'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        {language === 'ar' ? 'دعم فني VIP وخوادم خاصة' : 'VIP 24/7 Support & Private Hosting'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        {language === 'ar' ? 'تكامل وربط مخصص (API/ERP)' : 'Custom API & ERP Integrations'}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={handleEnterpriseContact}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      <span>{t('contact_sales_cta')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Stats / Numbers Section */}
        <section className="py-20 sm:py-28 relative bg-slate-100/50 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center bg-white border border-slate-200/80 p-8 sm:p-12 rounded-3xl shadow-sm">
              {[
                { number: '+1,200', label: t('landing_stats_employees') },
                { number: '99.9%', label: t('landing_stats_loans') },
                { number: '+15', label: t('landing_stats_departments') }
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                    {stat.number}
                  </div>
                  <div className="text-slate-500 font-semibold text-sm sm:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
          <p>{t('landing_footer')}</p>
        </div>
      </footer>
    </div>
  );
}
