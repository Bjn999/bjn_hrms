'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

function LoginContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const reason = searchParams?.get('reason');
    if (reason === 'subscription_expired') {
      setError(
        language === 'ar'
          ? 'تم إيقاف إمكانية تسجيل الدخول لانتهاء اشتراك شركتكم وانتهاء مهلة السماح الممنوحة. يرجى مراجعة الدعم الفني.'
          : 'Login is disabled because your company subscription and grace period have expired. Please contact technical support.'
      );
    }
  }, [searchParams, language]);

  const handleLanguageToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const validateForm = () => {
    const errors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      errors.username = t('val_username_required');
    }

    if (!password) {
      errors.password = t('val_password_required');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': language,
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (data.status) {
        const { token, user, role, permissions } = data.data;
        const userDataToSave = { ...user, role, permissions: permissions || [] };
        if (role) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(userDataToSave));
          if (role === 'super_admin') {
            router.push('/super-admin');
          } else {
            router.push('/portal');
          }
        } else {
          setError(language === 'ar' ? 'نوع الحساب غير مدعوم حالياً' : 'Account type is currently not supported');
        }
      } else {
        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          setError(data.errors[firstErrorKey][0]);
        } else {
          setError(data.message || (language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials'));
        }
      }
    } catch {
      setError(t('conn_error'));
    } finally {
      setLoading(false);
    }
  };

  const isRtl = language === 'ar';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-10 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Main Container */}
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl z-10 relative text-white">
        
        {/* Top Header Actions (Back & Language) */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white transition-all duration-300 text-xs font-semibold shadow-sm cursor-pointer"
          >
            <svg className={`w-4 h-4 transform ${isRtl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{t('back')}</span>
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white transition-all duration-300 text-xs font-semibold shadow-sm cursor-pointer"
          >
            <span>🌐</span>
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        {/* Brand Icon & Header Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('login_title')}
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            {t('login_subtitle')}
          </p>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-3.5 rounded-2xl flex items-center gap-3 text-sm animate-shake" role="alert">
            <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form with Custom Validations (no native required tooltip) */}
        <form onSubmit={handleLogin} noValidate className="space-y-5">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('username')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (fieldErrors.username) {
                  setFieldErrors(prev => ({ ...prev, username: undefined }));
                }
              }}
              placeholder={t('username_placeholder')}
              className={`w-full h-11 px-3.5 bg-white/10 border ${
                fieldErrors.username ? 'border-red-400 focus:ring-red-400' : 'border-white/15 focus:ring-blue-500'
              } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all text-left dir-ltr`}
            />
            {fieldErrors.username && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{fieldErrors.username}</span>
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t('password')} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }
                }}
                placeholder={t('password_placeholder')}
                className={`w-full h-11 px-3.5 bg-white/10 border ${
                  fieldErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-white/15 focus:ring-blue-500'
                } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-all text-left dir-ltr pe-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-12 rounded-xl font-black text-white bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:opacity-95 shadow-xl shadow-blue-500/25 active:scale-98 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('login_loading')}</span>
              </>
            ) : (
              <>
                <span>{t('login_btn')}</span>
                <svg className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer: Register New Company Link */}
        <div className="mt-8 text-center pt-6 border-t border-white/10">
          <p className="text-xs text-slate-300">
            {t('no_account_yet')}{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline transition-colors cursor-pointer ms-1"
            >
              {t('register_now')}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

