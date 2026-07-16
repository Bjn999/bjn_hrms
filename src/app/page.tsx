'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const token = localStorage.getItem('admin_token');
      if (token) {
        setIsLoggedIn(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLanguageToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleCtaClick = () => {
    if (isLoggedIn) {
      router.push('/admin');
    } else {
      router.push('/login');
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isRtl = language === 'ar';

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

          {/* Navigation CTAs */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={handleLanguageToggle}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-all duration-300 shadow-sm cursor-pointer"
            >
              <span>🌐</span>
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Auth Action */}
            <button
              onClick={handleCtaClick}
              className="relative group overflow-hidden px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-md shadow-blue-600/10 active:scale-95 cursor-pointer"
            >
              <span className="relative z-10">
                {isLoggedIn ? t('landing_hero_cta_dashboard') : t('landing_hero_cta_login')}
              </span>
            </button>
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
              <button
                onClick={handleCtaClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:opacity-90 shadow-xl shadow-blue-500/10 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>{isLoggedIn ? t('landing_hero_cta_dashboard') : t('landing_hero_cta_login')}</span>
                <svg className={`w-5 h-5 transition-transform ${isRtl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-300 flex items-center justify-center shadow-sm"
              >
                {t('show_details')}
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

        {/* Stats / Numbers Section */}
        <section className="py-20 sm:py-28 relative">
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
