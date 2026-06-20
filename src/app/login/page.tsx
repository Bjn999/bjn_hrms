'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.status) {
        localStorage.setItem('admin_token', data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.data.admin));
        router.push('/admin');
      } else {
        setError(data.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (err) {
      setError(t('conn_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" dir="rtl">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full mix-blend-overlay filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300/20 rounded-full mix-blend-overlay filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-overlay filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl z-10 relative">
        <div>
          <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md shadow-inner border border-white/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white tracking-tight">
            {t('login_title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-200">
            {t('login_subtitle')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-500/80 backdrop-blur-sm border border-red-400/50 text-white px-4 py-3 rounded-xl relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-1.5">{t('username')}</label>
              <input
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-white/10 border border-white/20 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all sm:text-sm"
                placeholder={t('username_placeholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-1.5">{t('password')}</label>
              <input
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-white/10 border border-white/20 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all sm:text-sm"
                placeholder={t('password_placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-indigo-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-indigo-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {t('login_loading')}
                </span>
              ) : t('login_btn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
