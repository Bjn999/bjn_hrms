'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { usePermissions } from '@/hooks/usePermissions';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function GeneralSettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const { hasPermission, isLoaded } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    after_miniute_calculate_delay: '',
    after_miniute_calculate_early_departure: '',
    after_miniute_quarterday: '',
    after_time_half_daycut: '',
    after_time_allday_daycut: '',
    monthly_vacation_balance: '',
    after_days_begin_vacation: '',
    first_balance_begin_vacation: '',
    sanctions_value_first_abcence: '',
    sanctions_value_second_abcence: '',
    sanctions_value_third_abcence: '',
    sanctions_value_fourth_abcence: ''
  });

  useEffect(() => {
    if (isLoaded && !hasPermission('view_settings')) {
      router.replace('/portal');
    }
  }, [isLoaded, hasPermission, router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/generalSettings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': language
        }
      });
      const result = await res.json();
      if (result.status && result.data) {
        setFormData(result.data);
      } else if (res.status === 403) {
        router.replace('/portal');
      }
    } catch {
      showToast(t('fetch_failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && hasPermission('view_settings')) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, isLoaded, hasPermission]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/generalSettings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': language
        },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (result.status) {
        showToast(result.message || t('save_success'), 'success');
      } else {
        showToast(result.message || t('update_error'), 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !hasPermission('view_settings')) return <LoadingScreen />;

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('general_settings')}</h2>
          <p className="text-slate-500 mt-1">{t('general_settings_desc')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Attendance Settings Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-emerald-400 to-teal-500"></div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">{t('attendance_settings')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-black text-slate-950 mb-2 text-ellipsis overflow-hidden whitespace-nowrap" title={t('delay_minutes')}>{t('delay_minutes')}</label>
                <div className="relative">
                  <input type="number" name="after_miniute_calculate_delay" value={formData.after_miniute_calculate_delay || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 ltr:pr-12 rtl:pl-12" />
                  <span className="absolute rtl:left-4 ltr:right-4 top-3 text-slate-400 text-sm">{t('minutes')}</span>
                </div>
              </div>
              <div>
                <label className="block text-base font-black text-slate-950 mb-2 text-ellipsis overflow-hidden whitespace-nowrap" title={t('early_departure_minutes')}>{t('early_departure_minutes')}</label>
                <div className="relative">
                  <input type="number" name="after_miniute_calculate_early_departure" value={formData.after_miniute_calculate_early_departure || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 ltr:pr-12 rtl:pl-12" />
                  <span className="absolute rtl:left-4 ltr:right-4 top-3 text-slate-400 text-sm">{t('minutes')}</span>
                </div>
              </div>
              <div>
                <label className="block text-base font-black text-slate-950 mb-2 text-ellipsis overflow-hidden whitespace-nowrap" title={t('delay_quarter_day')}>{t('delay_quarter_day')}</label>
                <div className="relative">
                  <input type="number" name="after_miniute_quarterday" value={formData.after_miniute_quarterday || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 ltr:pr-12 rtl:pl-12" />
                  <span className="absolute rtl:left-4 ltr:right-4 top-3 text-slate-400 text-sm">{t('minutes')}</span>
                </div>
              </div>
              <div>
                <label className="block text-base font-black text-slate-950 mb-2 text-ellipsis overflow-hidden whitespace-nowrap" title={t('delay_half_day')}>{t('delay_half_day')}</label>
                <div className="relative">
                  <input type="number" name="after_time_half_daycut" value={formData.after_time_half_daycut || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 ltr:pr-12 rtl:pl-12" />
                  <span className="absolute rtl:left-4 ltr:right-4 top-3 text-slate-400 text-sm">{t('times')}</span>
                </div>
              </div>
              <div>
                <label className="block text-base font-black text-slate-950 mb-2 text-ellipsis overflow-hidden whitespace-nowrap" title={t('delay_full_day')}>{t('delay_full_day')}</label>
                <div className="relative">
                  <input type="number" name="after_time_allday_daycut" value={formData.after_time_allday_daycut || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 ltr:pr-12 rtl:pl-12" />
                  <span className="absolute rtl:left-4 ltr:right-4 top-3 text-slate-400 text-sm">{t('times')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vacations & Sanctions Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vacations Settings */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-amber-400 to-orange-500"></div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800">{t('vacation_settings')}</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{t('monthly_vacation_balance')}</label>
                  <div className="relative">
                    <input type="number" step="0.5" name="monthly_vacation_balance" value={formData.monthly_vacation_balance || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-slate-700 ltr:pr-16 rtl:pl-16" />
                    <span className="absolute rtl:left-4 ltr:right-4 top-3 text-slate-400 text-sm">{t('days')}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'تبدأ الإجازة بعد' : 'Vacation starts after'}</label>
                  <div className="relative">
                    <input type="number" name="after_days_begin_vacation" value={formData.after_days_begin_vacation || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-slate-700 ltr:pr-16 rtl:pl-16" />
                    <span className="absolute rtl:left-4 ltr:right-4 top-3 text-slate-400 text-sm">{t('days')}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{t('initial_vacation_balance')}</label>
                  <div className="relative">
                    <input type="number" step="0.5" name="first_balance_begin_vacation" value={formData.first_balance_begin_vacation || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-slate-700 ltr:pr-16 rtl:pl-16" />
                    <span className="absolute rtl:left-4 ltr:right-4 top-3 text-slate-400 text-sm">{t('days')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sanctions Settings */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-rose-400 to-red-500"></div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800">{t('absence_sanctions')}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'الغياب للمرة الأولى' : 'First absence'}</label>
                  <div className="relative">
                    <input type="number" step="0.25" name="sanctions_value_first_abcence" value={formData.sanctions_value_first_abcence || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-slate-700 ltr:pr-16 rtl:pl-16" />
                    <span className="absolute rtl:left-4 ltr:right-4 top-3 text-slate-400 text-sm">{t('days')}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'الغياب للمرة الثانية' : 'Second absence'}</label>
                  <div className="relative">
                    <input type="number" step="0.25" name="sanctions_value_second_abcence" value={formData.sanctions_value_second_abcence || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-slate-700 ltr:pr-16 rtl:pl-16" />
                    <span className="absolute rtl:left-4 ltr:right-4 top-3 text-slate-400 text-sm">{t('days')}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'الغياب للمرة الثالثة' : 'Third absence'}</label>
                  <div className="relative">
                    <input type="number" step="0.25" name="sanctions_value_third_abcence" value={formData.sanctions_value_third_abcence || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-slate-700 ltr:pr-16 rtl:pl-16" />
                    <span className="absolute rtl:left-4 ltr:right-4 top-3 text-slate-400 text-sm">{t('days')}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'الغياب للمرة الرابعة' : 'Fourth absence'}</label>
                  <div className="relative">
                    <input type="number" step="0.25" name="sanctions_value_fourth_abcence" value={formData.sanctions_value_fourth_abcence || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-slate-700 ltr:pr-16 rtl:pl-16" />
                    <span className="absolute rtl:left-4 ltr:right-4 top-3 text-slate-400 text-sm">{t('days')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasPermission('edit_settings') && (
          <div className="flex justify-end gap-4 pt-4">
            <button type="submit" disabled={saving} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center gap-2">
              {saving && <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {t('save')}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
