'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const authUserStr = localStorage.getItem('auth_user');
      if (authUserStr) {
        const user = JSON.parse(authUserStr);
        setUserRole(user?.role || null);
      }
    } catch {
      setUserRole(null);
    }
  }, []);

  const getDashboardUrl = () => {
    if (userRole === 'super_admin') return '/super-admin';
    if (userRole) return '/portal';
    return '/';
  };

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col justify-between p-6 font-sans text-slate-800" dir="rtl">
      {/* Top Simple Brand Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-lg font-black text-slate-800 tracking-tight">BJN HRMS</span>
        </Link>
      </header>

      {/* Center 404 Card */}
      <main className="max-w-md w-full mx-auto text-center my-auto py-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

          {/* Icon / Badge */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Code pill */}
          <div className="inline-block px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black tracking-wider uppercase mb-3">
            خطأ 404 • الصفحة غير موجودة
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            لم يتم العثور على الصفحة
          </h1>

          <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
            عذراً، الرابط الذي تحاول الوصول إليه غير موجود أو تم نقله. يرجى التأكد من صحة الرابط.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span>الرجوع للخلف</span>
            </button>

            <Link
              href={getDashboardUrl()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{isClient && userRole ? 'لوحة التحكم' : 'الرئيسية'}</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center py-2 text-xs text-slate-400 font-medium">
        BJN HRMS © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
