'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { COUNTRIES, DEFAULT_COUNTRY, CountryCode } from '@/data/countryCodes';

interface RegisterFieldErrors {
  companyName?: string;
  adminName?: string;
  username?: string;
  adminEmail?: string;
  adminPassword?: string;
  passwordConfirmation?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [username, setUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  // Country & Phone state
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  // Validation & Submission state
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close country dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isCountryDropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isCountryDropdownOpen]);

  const isRtl = language === 'ar';

  // Filter countries by search query
  const filteredCountries = COUNTRIES.filter(c => {
    const q = countrySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.nameAr.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  // Handle phone input change (strictly numbers only)
  const handlePhoneChange = (val: string) => {
    const numericVal = val.replace(/\D/g, '');
    setPhoneNumber(numericVal);
    validatePhone(numericVal, selectedCountry);
  };

  // Validate phone against selected country
  const validatePhone = (num: string, country: CountryCode): boolean => {
    if (!num) {
      setPhoneError('');
      return true; // Optional field
    }

    if (num.length < country.minDigits || num.length > country.maxDigits) {
      const countryName = language === 'ar' ? country.nameAr : country.nameEn;
      const expectedDigits = country.minDigits === country.maxDigits 
        ? country.minDigits 
        : `${country.minDigits}-${country.maxDigits}`;
      setPhoneError(
        t('phone_invalid_for_country')
          .replace('{country}', countryName)
          .replace('{digits}', String(expectedDigits))
      );
      return false;
    }

    if (country.pattern && !country.pattern.test(num)) {
      const countryName = language === 'ar' ? country.nameAr : country.nameEn;
      setPhoneError(
        language === 'ar' 
          ? `رقم الهاتف غير متوافق مع نمط أرقام ${countryName}` 
          : `Phone number does not match pattern for ${countryName}`
      );
      return false;
    }

    setPhoneError('');
    return true;
  };

  const handleSelectCountry = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsCountryDropdownOpen(false);
    setCountrySearch('');
    if (phoneNumber) {
      validatePhone(phoneNumber, country);
    }
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const validateForm = (): boolean => {
    const errors: RegisterFieldErrors = {};

    if (!companyName.trim()) {
      errors.companyName = t('val_company_name_required');
    }

    if (!adminName.trim()) {
      errors.adminName = t('val_admin_name_required');
    }

    if (!username.trim()) {
      errors.username = t('val_username_required');
    } else if (username.trim().length < 3) {
      errors.username = t('val_username_min');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!adminEmail.trim()) {
      errors.adminEmail = t('val_email_required');
    } else if (!emailRegex.test(adminEmail.trim())) {
      errors.adminEmail = t('val_email_invalid');
    }

    if (!adminPassword) {
      errors.adminPassword = t('val_password_required');
    } else if (adminPassword.length < 6) {
      errors.adminPassword = t('password_min_length');
    }

    if (!passwordConfirmation) {
      errors.passwordConfirmation = t('val_confirm_password_required');
    } else if (adminPassword !== passwordConfirmation) {
      errors.passwordConfirmation = t('password_mismatch');
    }

    const isPhoneValid = validatePhone(phoneNumber, selectedCountry);

    setFieldErrors(errors);
    return Object.keys(errors).length === 0 && isPhoneValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const fullPhone = phoneNumber ? `${selectedCountry.dialCode}${phoneNumber}` : null;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': language,
        },
        body: JSON.stringify({
          company_name: companyName.trim(),
          admin_name: adminName.trim(),
          auth_username: username.trim(),
          admin_email: adminEmail.trim(),
          admin_password: adminPassword,
          admin_password_confirmation: passwordConfirmation,
          phone: fullPhone,
        }),
      });

      const data = await res.json();

      if (data.status) {
        const { token, user, role, permissions } = data.data;
        const userDataToSave = { ...user, role, permissions: permissions || [] };
        
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(userDataToSave));
        
        router.push('/portal');
      } else {
        if (data.errors) {
          const firstErrorKey = Object.keys(data.errors)[0];
          setError(data.errors[firstErrorKey][0]);
        } else {
          setError(data.message || t('error_occurred'));
        }
      }
    } catch {
      setError(t('conn_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-8 px-4 sm:px-6 relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-10 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Main Container - Compact and balanced size (max-w-xl) */}
      <div className="max-w-xl w-full bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl z-10 relative text-white">
        
        {/* Top Header Actions (Back & Language) */}
        <div className="flex items-center justify-between mb-6 pb-3.5 border-b border-white/10">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white transition-all duration-300 text-xs font-semibold shadow-sm cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 transform ${isRtl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{t('back')}</span>
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white transition-all duration-300 text-xs font-semibold shadow-sm cursor-pointer"
          >
            <span>🌐</span>
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        {/* Header Title & Free Plan Announcement */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t('register_company_title')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            {t('register_company_subtitle')}
          </p>

          {/* Lifetime Free Plan Banner */}
          {/* <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t('free_plan_guarantee')}</span>
          </div> */}
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-5 bg-red-500/20 border border-red-500/40 text-red-200 px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm animate-shake" role="alert">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form - Sleek 2-Column Responsive Grid with Custom Validations (no native required tooltip) */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('company_name_label')} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (fieldErrors.companyName) {
                    setFieldErrors(prev => ({ ...prev, companyName: undefined }));
                  }
                }}
                placeholder={t('company_name_placeholder')}
                className={`w-full h-11 px-3.5 bg-white/10 border ${
                  fieldErrors.companyName ? 'border-red-400 focus:ring-red-400' : 'border-white/15 focus:ring-blue-500'
                } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-xs sm:text-sm transition-all`}
              />
              {fieldErrors.companyName && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{fieldErrors.companyName}</span>
                </p>
              )}
            </div>

            {/* Admin Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('admin_name_label')} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => {
                  setAdminName(e.target.value);
                  if (fieldErrors.adminName) {
                    setFieldErrors(prev => ({ ...prev, adminName: undefined }));
                  }
                }}
                placeholder={t('admin_name_placeholder')}
                className={`w-full h-11 px-3.5 bg-white/10 border ${
                  fieldErrors.adminName ? 'border-red-400 focus:ring-red-400' : 'border-white/15 focus:ring-blue-500'
                } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-xs sm:text-sm transition-all`}
              />
              {fieldErrors.adminName && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{fieldErrors.adminName}</span>
                </p>
              )}
            </div>

            {/* Admin Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('admin_username_label')} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.replace(/\s+/g, '').toLowerCase());
                  if (fieldErrors.username) {
                    setFieldErrors(prev => ({ ...prev, username: undefined }));
                  }
                }}
                placeholder={t('admin_username_placeholder')}
                className={`w-full h-11 px-3.5 bg-white/10 border ${
                  fieldErrors.username ? 'border-red-400 focus:ring-red-400' : 'border-white/15 focus:ring-blue-500'
                } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-xs sm:text-sm transition-all text-left dir-ltr`}
              />
              {fieldErrors.username && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{fieldErrors.username}</span>
                </p>
              )}
            </div>

            {/* Admin Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('admin_email_label')} <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  if (fieldErrors.adminEmail) {
                    setFieldErrors(prev => ({ ...prev, adminEmail: undefined }));
                  }
                }}
                placeholder={t('admin_email_placeholder')}
                className={`w-full h-11 px-3.5 bg-white/10 border ${
                  fieldErrors.adminEmail ? 'border-red-400 focus:ring-red-400' : 'border-white/15 focus:ring-blue-500'
                } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-xs sm:text-sm transition-all text-left dir-ltr`}
              />
              {fieldErrors.adminEmail && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{fieldErrors.adminEmail}</span>
                </p>
              )}
            </div>

            {/* Phone Number with Custom Country Dropdown (Full Width on 2-col) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('admin_phone_label')}
              </label>
              <div className="flex gap-2 relative">
                
                {/* Country Selector Dropdown */}
                <div className="relative shrink-0" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="h-11 px-3.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-white flex items-center justify-between gap-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer min-w-[130px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base leading-none">{selectedCountry.flag}</span>
                      <span className="font-semibold font-mono text-xs">{selectedCountry.dialCode}</span>
                    </div>
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full start-0 mt-1 w-72 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden backdrop-blur-2xl">
                      {/* Search Box */}
                      <div className="p-1.5 border-b border-white/10 mb-1">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder={t('search_country')}
                          className="w-full px-2.5 py-1.5 bg-white/10 border border-white/15 rounded-lg text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>

                      {/* Countries List */}
                      <div className="max-h-52 overflow-y-auto space-y-0.5 p-1 scrollbar-thin">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => handleSelectCountry(c)}
                              className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                selectedCountry.code === c.code 
                                  ? 'bg-blue-600 text-white font-bold' 
                                  : 'text-slate-200 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-sm">{c.flag}</span>
                                <span className="truncate">{language === 'ar' ? c.nameAr : c.nameEn}</span>
                              </div>
                              <span className="font-mono text-slate-300 shrink-0 text-[11px] dir-ltr ms-1">{c.dialCode}</span>
                            </button>
                          ))
                        ) : (
                          <div className="text-center py-3 text-xs text-slate-400">
                            {t('no_data')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Input with exact matching h-11 height */}
                <div className="flex-1 relative">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={selectedCountry.placeholder || t('admin_phone_placeholder')}
                    className={`w-full h-11 px-3.5 bg-white/10 border ${
                      phoneError ? 'border-red-400 focus:ring-red-400' : 'border-white/15 focus:ring-blue-500'
                    } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent text-xs sm:text-sm transition-all text-left dir-ltr`}
                  />
                </div>
              </div>

              {/* Phone Validation Feedback */}
              {phoneError ? (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{phoneError}</span>
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  {t('phone_digits_hint')}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('password')} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    if (fieldErrors.adminPassword) {
                      setFieldErrors(prev => ({ ...prev, adminPassword: undefined }));
                    }
                  }}
                  placeholder="••••••••"
                  className={`w-full h-11 px-3.5 bg-white/10 border ${
                    fieldErrors.adminPassword ? 'border-red-400 focus:ring-red-400' : 'border-white/15 focus:ring-blue-500'
                  } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-xs sm:text-sm transition-all text-left dir-ltr pe-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 end-0 pe-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {fieldErrors.adminPassword && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{fieldErrors.adminPassword}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('password_confirm_label')} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  value={passwordConfirmation}
                  onChange={(e) => {
                    setPasswordConfirmation(e.target.value);
                    if (fieldErrors.passwordConfirmation) {
                      setFieldErrors(prev => ({ ...prev, passwordConfirmation: undefined }));
                    }
                  }}
                  placeholder={t('password_confirm_placeholder')}
                  className={`w-full h-11 px-3.5 bg-white/10 border ${
                    fieldErrors.passwordConfirmation ? 'border-red-400 focus:ring-red-400' : 'border-white/15 focus:ring-blue-500'
                  } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent text-xs sm:text-sm transition-all text-left dir-ltr pe-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute inset-y-0 end-0 pe-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPasswordConfirmation ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {fieldErrors.passwordConfirmation && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{fieldErrors.passwordConfirmation}</span>
                </p>
              )}
            </div>

          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-black text-white bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:opacity-95 shadow-xl shadow-blue-500/25 active:scale-98 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('creating_company_account')}</span>
                </>
              ) : (
                <>
                  <span>{t('register_submit_btn')}</span>
                  <svg className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer: Already have account */}
        <div className="mt-6 text-center pt-4 border-t border-white/10">
          <p className="text-xs text-slate-300">
            {t('already_have_account')}{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline transition-colors cursor-pointer ms-1"
            >
              {t('login_now')}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
