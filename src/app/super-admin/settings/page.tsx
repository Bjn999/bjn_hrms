'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SuperAdminSettings() {
  const { language } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {language === 'ar' ? 'الإعدادات الشخصية' : 'Personal Settings'}
          </h1>
          <p className="text-slate-400">
            {language === 'ar' ? 'عرض وإدارة بيانات حسابك.' : 'View and manage your account details.'}
          </p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg p-8 max-w-2xl">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-700">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-inner shadow-black/20">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
            <p className="text-blue-400 font-medium">{language === 'ar' ? 'مدير المنصة' : 'Super Admin'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">{language === 'ar' ? 'اسم المستخدم' : 'Username'}</label>
            <div className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium">
              {user.username}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <div className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium">
              {user.email || (language === 'ar' ? 'غير متوفر' : 'Not available')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">{language === 'ar' ? 'تاريخ التسجيل' : 'Registration Date'}</label>
            <div className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium text-slate-300">
              {new Date(user.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
