'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

export default function GeneralSettingsPage() {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    company_name: '',
    phones: '',
    address: '',
    email: '',
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
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('http://localhost:8000/api/admin/generalSettings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await res.json();
      if (result.status && result.data) {
        setFormData(result.data);
      }
    } catch (e) {
      console.error(e);
      showToast(t('fetch_failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('http://localhost:8000/api/admin/generalSettings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (result.status) {
        showToast(result.message || t('save_success'), 'success');
      } else {
        showToast(result.message || t('update_error'), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast(t('conn_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-500 font-medium">{t('loading_settings')}</div>;

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('general_settings')}</h2>
          <p className="text-slate-500 mt-1">{t('general_settings_desc')}</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 mb-8 rounded-2xl flex items-center gap-3 backdrop-blur-sm shadow-sm animate-fade-in-up ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50' : 'bg-rose-50 text-rose-800 border border-rose-200/50'}`}>
          <svg className={`w-6 h-6 ${message.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {message.type === 'success' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-purple-500"></div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">{t('company_basic_info')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-black text-slate-950 mb-2">{t('company_name')}</label>
                <input type="text" name="company_name" value={formData.company_name || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-700" />
              </div>
              <div>
                <label className="block text-base font-black text-slate-950 mb-2">{t('company_phone')}</label>
                <input type="text" name="phones" value={formData.phones || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-700" />
              </div>
              <div>
                <label className="block text-base font-black text-slate-950 mb-2">{t('company_address')}</label>
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-700" />
              </div>
              <div>
                <label className="block text-base font-black text-slate-950 mb-2">{t('email')}</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-700" />
              </div>
            </div>
          </div>
        </div>

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
                  <input type="number" name="monthly_vacation_balance" value={formData.monthly_vacation_balance || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-slate-700" />
                </div>
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{t('days_before_vacation')}</label>
                  <input type="number" name="after_days_begin_vacation" value={formData.after_days_begin_vacation || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-slate-700" />
                </div>
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{t('initial_vacation_balance')}</label>
                  <input type="number" name="first_balance_begin_vacation" value={formData.first_balance_begin_vacation || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-slate-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Absence Sanctions */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-rose-400 to-pink-500"></div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800">{t('absence_sanctions')}</h3>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{t('first_time')}</label>
                  <input type="number" name="sanctions_value_first_abcence" value={formData.sanctions_value_first_abcence || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-slate-700 text-center font-bold" />
                </div>
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{t('second_time')}</label>
                  <input type="number" name="sanctions_value_second_abcence" value={formData.sanctions_value_second_abcence || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-slate-700 text-center font-bold" />
                </div>
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{t('third_time')}</label>
                  <input type="number" name="sanctions_value_third_abcence" value={formData.sanctions_value_third_abcence || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-slate-700 text-center font-bold" />
                </div>
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{t('fourth_time')}</label>
                  <input type="number" name="sanctions_value_fourth_abcence" value={formData.sanctions_value_fourth_abcence || ''} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all text-slate-700 text-center font-bold" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-6 flex justify-end z-20">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 flex items-center gap-3 transition-all duration-300 font-bold text-lg"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {t('saving')}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                {t('save_changes')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}




