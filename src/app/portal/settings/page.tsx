'use client';

import { useEffect, useState, Suspense } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useSearchParams, useRouter } from 'next/navigation';
import SubscriptionUpgradeModal from '@/components/SubscriptionUpgradeModal';

function resolveTab(raw?: string | null): string {
  if (!raw) return 'account';
  if (raw === 'subscription' || raw === 'subscription_data') return 'subscription_data';
  if (raw === 'company' || raw === 'company_data') return 'company_data';
  return 'account';
}

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Riyadh', labelAr: '🇸🇦 توقيت مكة المكرمة / الرياض (السعودية - UTC+3)', labelEn: '🇸🇦 Makkah / Riyadh Time (Saudi Arabia - UTC+3)' },
  { value: 'Africa/Cairo', labelAr: '🇪🇬 توقيت القاهرة (مصر - UTC+2)', labelEn: '🇪🇬 Cairo Time (Egypt - UTC+2)' },
  { value: 'Asia/Dubai', labelAr: '🇦🇪 توقيت دبي (الإمارات وعُمان - UTC+4)', labelEn: '🇦🇪 Dubai Time (UAE / Oman - UTC+4)' },
  { value: 'Asia/Kuwait', labelAr: '🇰🇼 توقيت الكويت (الكويت - UTC+3)', labelEn: '🇰🇼 Kuwait Time (Kuwait - UTC+3)' },
  { value: 'Asia/Qatar', labelAr: '🇶🇦 توقيت الدوحة (قطر - UTC+3)', labelEn: '🇶🇦 Doha Time (Qatar - UTC+3)' },
  { value: 'Asia/Bahrain', labelAr: '🇧🇭 توقيت المنامة (البحرين - UTC+3)', labelEn: '🇧🇭 Manama Time (Bahrain - UTC+3)' },
  { value: 'Asia/Amman', labelAr: '🇯🇴 توقيت عمّان (الأردن - UTC+3)', labelEn: '🇯🇴 Amman Time (Jordan - UTC+3)' },
  { value: 'Asia/Baghdad', labelAr: '🇮🇶 توقيت بغداد (العراق - UTC+3)', labelEn: '🇮🇶 Baghdad Time (Iraq - UTC+3)' },
  { value: 'Asia/Beirut', labelAr: '🇱🇧 توقيت بيروت (لبنان - UTC+3)', labelEn: '🇱🇧 Beirut Time (Lebanon - UTC+3)' },
  { value: 'Asia/Damascus', labelAr: '🇸🇾 توقيت دمشق (سوريا - UTC+3)', labelEn: '🇸🇾 Damascus Time (Syria - UTC+3)' },
  { value: 'Africa/Khartoum', labelAr: '🇸🇩 توقيت الخرطوم (السودان - UTC+2)', labelEn: '🇸🇩 Khartoum Time (Sudan - UTC+2)' },
  { value: 'Africa/Tripoli', labelAr: '🇱🇾 توقيت طرابلس (ليبيا - UTC+2)', labelEn: '🇱🇾 Tripoli Time (Libya - UTC+2)' },
  { value: 'Africa/Tunis', labelAr: '🇹🇳 توقيت تونس (تونس - UTC+1)', labelEn: '🇹🇳 Tunis Time (Tunisia - UTC+1)' },
  { value: 'Africa/Algiers', labelAr: '🇩🇿 توقيت الجزائر (الجزائر - UTC+1)', labelEn: '🇩🇿 Algiers Time (Algeria - UTC+1)' },
  { value: 'Africa/Casablanca', labelAr: '🇲🇦 توقيت الدار البيضاء (المغرب - UTC+1)', labelEn: '🇲🇦 Casablanca Time (Morocco - UTC+1)' },
  { value: 'Europe/Istanbul', labelAr: '🇹🇷 توقيت إسطنبول (تركيا - UTC+3)', labelEn: '🇹🇷 Istanbul Time (Turkey - UTC+3)' },
  { value: 'Europe/London', labelAr: '🇬🇧 توقيت لندن (بريطانيا - UTC+0 / UTC+1)', labelEn: '🇬🇧 London Time (UK - UTC+0 / UTC+1)' },
  { value: 'UTC', labelAr: '🌐 التوقيت العالمي الموحد (UTC+0)', labelEn: '🌐 Coordinated Universal Time (UTC+0)' },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [activeTab, setActiveTab] = useState(() => resolveTab(searchParams.get('tab')));
  const [adminUser, setAdminUser] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const [personalData, setPersonalData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    emp_home_tel: '',
    staies_address: ''
  });

  const [credentialsData, setCredentialsData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  const [formData, setFormData] = useState({
    company_name: '',
    phones: '',
    address: '',
    email: '',
    timezone: 'Asia/Riyadh'
  });

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const trimmed = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');

    if (hours === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) {
      return `${year}-${month}-${day}`;
    }

    const ampm = language === 'ar' ? (hours >= 12 ? 'م' : 'ص') : (hours >= 12 ? 'PM' : 'AM');
    const formattedHours = hours % 12 || 12;
    return `${year}-${month}-${day} (${formattedHours}:${minutes} ${ampm})`;
  };


  const fetchSettings = async () => {

    try {
      const token = localStorage.getItem('auth_token');
      
      // Fetch fresh user data
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const userResult = await userRes.json();
      if (userResult.status && userResult.data) {
        const user = userResult.data;
        setAdminUser(user);
        
        setPersonalData({
          first_name: user.employee?.first_name || '',
          middle_name: user.employee?.middle_name || '',
          last_name: user.employee?.last_name || '',
          emp_home_tel: user.employee?.emp_home_tel || '',
          staies_address: user.employee?.staies_address || '',
        });

        setCredentialsData({
          username: user.username || '',
          email: user.email || '',
          password: '',
          password_confirmation: ''
        });
      }

      // Fetch company profile & subscription if company admin
      if (userResult.data?.role === 'company_admin') {
        const [settingsRes, subRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/generalSettings`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Accept-Language': language
            }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/company-subscription`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Accept-Language': language
            }
          })
        ]);

        const settingsResult = await settingsRes.json();
        if (settingsResult.status && settingsResult.data) {
          setFormData({
            company_name: settingsResult.data.company_name || '',
            phones: settingsResult.data.phones || '',
            address: settingsResult.data.address || '',
            email: settingsResult.data.email || '',
            timezone: settingsResult.data.timezone || 'Asia/Riyadh'
          });
        }

        const subResult = await subRes.json();
        if (subResult.status && subResult.data) {
          setSubscriptionData(subResult.data);
        }
      }
    } catch {
      showToast(t('fetch_failed'), 'error');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalData({ ...personalData, [e.target.name]: e.target.value });
  };

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentialsData({ ...credentialsData, [e.target.name]: e.target.value });
  };

  // Submit Form 1: Personal Information (Does NOT log out)
  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPersonalInfo(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': language
        },
        body: JSON.stringify({
          first_name: personalData.first_name,
          middle_name: personalData.middle_name,
          last_name: personalData.last_name,
          emp_home_tel: personalData.emp_home_tel,
          staies_address: personalData.staies_address
        })
      });
      
      const result = await res.json();
      if (res.ok && result.status !== false) {
        showToast(result.message || (language === 'ar' ? 'تم حفظ البيانات الشخصية بنجاح' : 'Personal info saved successfully'), 'success');
        if (result.data) {
          localStorage.setItem('auth_user', JSON.stringify(result.data));
          setAdminUser(result.data);
          window.dispatchEvent(new Event('user-updated'));
        }
      } else {
        showToast(result.message || (result.errors ? Object.values(result.errors as Record<string, string[]>)[0][0] : t('update_error')), 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setSavingPersonalInfo(false);
    }
  };

  // Submit Form 2: Login Credentials (Logs out on change)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (credentialsData.password && credentialsData.password !== credentialsData.password_confirmation) {
      showToast(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match', 'error');
      return;
    }
    setSavingCredentials(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const payload: Record<string, any> = {
        username: credentialsData.username,
        email: credentialsData.email
      };
      if (credentialsData.password) {
        payload.password = credentialsData.password;
        payload.password_confirmation = credentialsData.password_confirmation;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': language
        },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (res.ok && result.status !== false) {
        showToast(
          result.message || (language === 'ar' ? 'تم تحديث بيانات تسجيل الدخول بنجاح. جاري تسجيل الخروج للدخول بالبيانات الجديدة...' : 'Login credentials updated successfully. Logging out to sign in with new credentials...'),
          'success'
        );

        // Perform automatic logout
        setTimeout(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('permissions');
          router.push('/login');
        }, 1200);
      } else {
        showToast(result.message || (result.errors ? Object.values(result.errors as Record<string, string[]>)[0][0] : t('update_error')), 'error');
        setSavingCredentials(false);
      }
    } catch {
      showToast(t('conn_error'), 'error');
      setSavingCredentials(false);
    }
  };

  // Listen to searchParams updates (e.g. from notification clicks or sidebar links)
  useEffect(() => {
    const raw = searchParams.get('tab');
    if (raw) {
      const resolved = resolveTab(raw);
      setActiveTab(resolved);
    }
  }, [searchParams]);

  // Protect non-company_admin from accessing company tabs after user data loads
  useEffect(() => {
    if (!loading && adminUser && adminUser.role !== 'company_admin' && activeTab !== 'account') {
      setActiveTab('account');
    }
  }, [loading, adminUser, activeTab]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    router.replace(`/portal/settings?tab=${newTab}`, { scroll: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/companyProfile`, {
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

  if (loading) return <div className="text-slate-500 font-medium text-center mt-10">{t('loading_settings')}</div>;

  const isCompanyAdmin = adminUser?.role === 'company_admin';

  return (
    <div className="animate-fade-in-up pb-10 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {isCompanyAdmin ? t('settings') : (language === 'ar' ? 'الملف الشخصي والحساب' : 'Profile & Account')}
          </h2>
          <p className="text-slate-500 mt-1">
            {isCompanyAdmin ? t('manage_settings_desc') : (language === 'ar' ? 'إدارة وتحديث بياناتك الشخصية ومعلومات تسجيل الدخول وكلمة المرور' : 'Manage your personal details and login credentials')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Top Tabs (Only rendered when user is company_admin) */}
        {isCompanyAdmin && (
          <div className="w-full">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-row">
              <button
                type="button"
                onClick={() => handleTabChange('account')}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-center transition-colors cursor-pointer ${activeTab === 'account' ? 'bg-indigo-50 text-indigo-700 font-bold border-b-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {language === 'ar' ? 'حسابي' : 'My Account'}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('company_data')}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-center transition-colors cursor-pointer ${activeTab === 'company_data' ? 'bg-indigo-50 text-indigo-700 font-bold border-b-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {t('company_data')}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('subscription_data')}
                className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-4 text-center transition-colors cursor-pointer ${activeTab === 'subscription_data' ? 'bg-indigo-50 text-indigo-700 font-bold border-b-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                <span>{t('subscription_data')}</span>
                {subscriptionData?.is_expiring_soon && (
                  <span className={`w-2.5 h-2.5 rounded-full ${subscriptionData.is_expired ? 'bg-rose-500 animate-ping' : 'bg-amber-500 animate-ping'}`}></span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1">
          {isCompanyAdmin && activeTab === 'company_data' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-purple-500"></div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{t('company_basic_info')}</h3>
                    <p className="text-slate-500 mt-1">{t('company_basic_info_desc')}</p>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Logo Upload (Mock UI) */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <button type="button" className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors mb-2">
                        {t('change_logo')}
                      </button>
                      <p className="text-xs text-slate-500">JPG, PNG, SVG (Max 2MB)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-base font-black text-slate-950 mb-2">{t('company_name')}</label>
                      <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-base font-black text-slate-950 mb-2">{t('email')}</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-base font-black text-slate-950 mb-2">{t('company_phone')}</label>
                      <input type="text" name="phones" value={formData.phones} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-base font-black text-slate-950 mb-2">{t('company_address')}</label>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
                    </div>

                    {/* Company Timezone */}
                    <div className="md:col-span-2">
                      <label className="block text-base font-black text-slate-950 mb-1">{t('company_timezone')}</label>
                      <p className="text-xs text-slate-500 mb-2">{t('company_timezone_desc')}</p>
                      <div className="relative">
                        <select
                          name="timezone"
                          value={formData.timezone || 'Asia/Riyadh'}
                          onChange={handleChange}
                          style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                        >
                          {TIMEZONE_OPTIONS.map((tz) => (
                            <option
                              key={tz.value}
                              value={tz.value}
                              style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                              className="text-slate-900 bg-white font-medium py-2"
                            >
                              {language === 'ar' ? tz.labelAr : tz.labelEn}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-4 text-slate-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 flex items-center gap-2 transition-all font-bold"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          {t('saving')}
                        </>
                      ) : (
                        <>
                          {t('save_changes')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'subscription_data' && (
            <div className="space-y-6">
              {/* Alert Banner for Expiry / Expired */}
              {subscriptionData?.is_expired && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 shadow-md flex items-start gap-4 animate-shake">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-rose-900 mb-1">
                      {language === 'ar' ? 'تنبيه: انتهت صلاحية باقة اشتراك الشركة!' : 'Alert: Company Subscription Expired!'}
                    </h4>
                    <p className="text-sm text-rose-700 leading-relaxed font-medium">
                      {t('subscription_expired_alert')}
                    </p>
                  </div>
                </div>
              )}

              {subscriptionData?.is_expiring_soon && !subscriptionData?.is_expired && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 shadow-md flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-amber-900 mb-1">
                      {language === 'ar'
                        ? `تنبيه: سينتهي اشتراك باقة شركتك خلال ${subscriptionData.days_remaining} يوم!`
                        : `Notice: Your company subscription expires in ${subscriptionData.days_remaining} days!`}
                    </h4>
                    <p className="text-sm text-amber-800 leading-relaxed font-medium">
                      {t('subscription_expiring_soon_alert')}
                    </p>
                  </div>
                </div>
              )}

              {/* Main Subscription Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-blue-500 via-indigo-500 to-purple-500"></div>

                <div className="p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">{t('subscription_data')}</h3>
                      <p className="text-slate-500 mt-1">{t('subscription_details_desc')}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                        subscriptionData?.is_expired
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : subscriptionData?.is_expiring_soon
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {subscriptionData?.is_expired
                          ? (language === 'ar' ? 'منتهي الصلاحية' : 'Expired')
                          : subscriptionData?.is_expiring_soon
                          ? (language === 'ar' ? 'قارب على الانتهاء' : 'Expiring Soon')
                          : (language === 'ar' ? 'نشط وساري' : 'Active')}
                      </span>
                    </div>
                  </div>

                  {/* 4 Stat Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {/* Card 1: Plan Name */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('current_plan')}</span>
                      <div className="text-xl font-black text-slate-900">{subscriptionData?.plan_name || 'الباقة المجانية'}</div>
                      <div className="text-xs font-semibold text-indigo-600">
                        {subscriptionData?.billing_cycle === 'yearly'
                          ? (language === 'ar' ? 'اشتراك سنوي' : 'Yearly Billing')
                          : subscriptionData?.billing_cycle === 'monthly'
                          ? (language === 'ar' ? 'اشتراك شهري' : 'Monthly Billing')
                          : (language === 'ar' ? 'باقة مجانية' : 'Free Tier')}
                      </div>
                    </div>

                    {/* Card 2: Subscription Period */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('subscription_period')}</span>
                      <div className="text-sm font-bold text-slate-800 flex flex-col gap-0.5">
                        <span className="text-xs text-slate-500">{t('start_date')}: {formatDate(subscriptionData?.start_date)}</span>
                        <span className="text-xs text-slate-500">{t('end_date')}: {subscriptionData?.end_date ? formatDate(subscriptionData?.end_date) : t('no_end_date')}</span>
                      </div>

                    </div>

                    {/* Card 3: Remaining Days Gauge */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('days_remaining')}</span>
                      {subscriptionData?.days_remaining !== null ? (
                        <div className={`text-2xl font-black ${
                          subscriptionData?.days_remaining <= 0
                            ? 'text-rose-600'
                            : subscriptionData?.days_remaining <= 14
                            ? 'text-amber-600'
                            : 'text-indigo-600'
                        }`}>
                          {subscriptionData?.days_remaining > 0 ? subscriptionData?.days_remaining : 0}
                          <span className="text-xs font-bold text-slate-500 mx-1">{t('days_unit')}</span>
                        </div>
                      ) : (
                        <div className="text-lg font-black text-emerald-600">{t('unlimited')}</div>
                      )}
                      <div className="text-[11px] text-slate-400">
                        {subscriptionData?.is_free ? (language === 'ar' ? 'بدون تاريخ انتهاء' : 'Indefinite') : (language === 'ar' ? 'حتى موعد التجديد' : 'Until next renewal')}
                      </div>
                    </div>

                    {/* Card 4: Employee Capacity */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('quota_usage')}</span>
                      <div className="text-xl font-black text-slate-900 flex items-baseline gap-1">
                        <span>{subscriptionData?.total_employees || 0}</span>
                        <span className="text-xs font-bold text-slate-400">
                          / {subscriptionData?.is_unlimited ? '∞' : subscriptionData?.max_users} {t('users_label')}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            subscriptionData?.usage_percent >= 100
                              ? 'bg-rose-500'
                              : subscriptionData?.usage_percent >= 80
                              ? 'bg-amber-500'
                              : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(100, subscriptionData?.usage_percent || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Renewal & Upgrade Box */}
                  <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-indigo-950">
                        {subscriptionData?.is_free
                          ? (language === 'ar' ? 'ترقية سعة باقة الشركة' : 'Upgrade Company Plan Capacity')
                          : (language === 'ar' ? 'ترقية الباقة أو تجديد الاشتراك' : 'Upgrade Plan or Renew Subscription')}
                      </h4>
                      <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                        {subscriptionData?.is_free
                          ? (language === 'ar'
                              ? 'باقتك الحالية مجانية مدى الحياة. يمكنك ترقية الباقة لزيادة سعة الموظفين والاستفادة من مزامنة البصمة والميزات المتقدمة.'
                              : 'Your current plan is lifetime free. Upgrade your plan to increase employee quota and unlock advanced features.')
                          : (language === 'ar'
                              ? 'لترقية سعة باقة شركتكم، أو تجديد الاشتراك قبل انتهائه، يمكنك تقديم طلب فوري لإدارة النظام.'
                              : 'To upgrade your employee capacity or renew your active subscription, submit a direct request.')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      <span>
                        {subscriptionData?.is_free
                          ? (language === 'ar' ? 'طلب ترقية الباقة' : 'Upgrade Plan')
                          : (language === 'ar' ? 'تجديد / ترقية الباقة' : 'Renew / Upgrade')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-8">
              {/* Card 1: Personal Information Form */}
              {adminUser?.employee_id && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-emerald-500 to-teal-500"></div>
                  
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          {language === 'ar' ? 'البيانات الشخصية' : 'Personal Information'}
                        </h3>
                        <p className="text-slate-500 mt-1">{language === 'ar' ? 'تعديل اسمك ومعلومات الاتصال والعنوان الخاصة بك' : 'Update your name, contact details, and address'}</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handlePersonalSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'الاسم الأول' : 'First Name'}</label>
                          <input type="text" name="first_name" value={personalData.first_name} onChange={handlePersonalChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                        </div>
                        <div>
                          <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'الاسم الأوسط' : 'Middle Name'}</label>
                          <input type="text" name="middle_name" value={personalData.middle_name} onChange={handlePersonalChange} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                        </div>
                        <div>
                          <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'الاسم الأخير' : 'Last Name'}</label>
                          <input type="text" name="last_name" value={personalData.last_name} onChange={handlePersonalChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                        </div>
                        <div className="md:col-span-1">
                          <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                          <input type="text" name="emp_home_tel" value={personalData.emp_home_tel} onChange={handlePersonalChange} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'العنوان' : 'Address'}</label>
                          <input type="text" name="staies_address" value={personalData.staies_address} onChange={handlePersonalChange} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                        </div>
                      </div>

                      <div className="flex justify-end pt-6 border-t border-slate-100">
                        <button 
                          type="submit" 
                          disabled={savingPersonalInfo}
                          className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 flex items-center gap-2 transition-all font-bold"
                        >
                          {savingPersonalInfo ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              {language === 'ar' ? 'حفظ البيانات الشخصية' : 'Save Personal Info'}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Card 2: Login Credentials Form */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-purple-500"></div>
                
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        {language === 'ar' ? 'بيانات تسجيل الدخول' : 'Login Credentials'}
                      </h3>
                      <p className="text-slate-500 mt-1">{language === 'ar' ? 'إدارة اسم المستخدم، البريد الإلكتروني، وكلمة المرور' : 'Manage your username, email, and password'}</p>
                    </div>
                  </div>

                  {/* Warning Box Regarding Auto-Logout */}
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-4 mb-8 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="font-black text-base text-amber-950 mb-1">
                        {language === 'ar' ? 'تنبيه تسجيل الخروج التلقائي' : 'Automatic Logout Notice'}
                      </h5>
                      <p className="text-sm text-amber-800 leading-relaxed font-semibold">
                        {language === 'ar'
                          ? 'عند تعديل أي من بيانات تسجيل الدخول (اسم المستخدم أو البريد الإلكتروني أو كلمة المرور)، سيتم تسجيل خروجك تلقائياً لتسجيل الدخول بالبيانات الجديدة.'
                          : 'Upon modifying any login credentials (username, email, or password), you will be automatically logged out to sign in with your new credentials.'}
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'اسم المستخدم' : 'Username'}</label>
                        <input type="text" name="username" value={credentialsData.username} onChange={handleCredentialsChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
                      </div>
                      <div>
                        <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                        <input type="email" name="email" value={credentialsData.email} onChange={handleCredentialsChange} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">{language === 'ar' ? 'تغيير كلمة المرور (اختياري)' : 'Change Password (Optional)'}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                          <input type="password" name="password" value={credentialsData.password} onChange={handleCredentialsChange} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" placeholder="******" />
                        </div>
                        <div>
                          <label className="block text-base font-black text-slate-950 mb-2">{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                          <input type="password" name="password_confirmation" value={credentialsData.password_confirmation} onChange={handleCredentialsChange} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" placeholder="******" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-100">
                      <button 
                        type="submit" 
                        disabled={savingCredentials}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 flex items-center gap-2 transition-all font-bold"
                      >
                        {savingCredentials ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            {language === 'ar' ? 'جاري التحديث...' : 'Updating...'}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            {language === 'ar' ? 'تحديث بيانات تسجيل الدخول' : 'Update Login Credentials'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade / Renewal Modal (Rendered at Root via Portal) */}
      <SubscriptionUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlanId={subscriptionData?.plan_id}
        currentPlanSlug={subscriptionData?.plan_slug}
        currentBillingCycle={subscriptionData?.billing_cycle}
        hasPendingRequest={subscriptionData?.has_pending_upgrade_request}
        pendingRequestDetails={subscriptionData?.pending_upgrade_request}
        onSuccess={() => {
          fetchSettings();
        }}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
