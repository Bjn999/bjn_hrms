'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface SettingItem {
  id: number | string;
  name: string;
  type?: number;
  from_time?: string;
  to_time?: string;
  country_id?: number | string;
  governorate_id?: number | string;
  [key: string]: unknown;
}

interface EmployeeSettings {
  branches: SettingItem[];
  departments: SettingItem[];
  jobs: SettingItem[];
  qualifications: SettingItem[];
  nationalities: SettingItem[];
  religions: SettingItem[];
  blood_groups: SettingItem[];
  countries: SettingItem[];
  governorates: SettingItem[];
  cities: SettingItem[];
  shifts: SettingItem[];
  resignations: SettingItem[];
  languages: SettingItem[];
  social_status: SettingItem[];
  military_status: SettingItem[];
  driving_license_types: SettingItem[];
}

interface EmployeeFormData {
  zketo_code: string;
  emp_name: string;
  emp_gender: string;
  branch_id: string;
  qualifications_id: string;
  qualifications_year: string;
  graduation_estimate: string;
  graduation_specialization: string;
  emp_email: string;
  emp_birth_date: string;
  emp_national_identity: string;
  emp_end_identity_date: string;
  emp_identity_place: string;
  blood_group_id: string;
  emp_nationality_id: string;
  emp_lang_id: string;
  emp_social_status_id: string;
  children_number: number;
  religion_id: string;
  country_id: string;
  governorate_id: string;
  city_id: string;
  staies_address: string;
  emp_home_tel: string;
  emp_work_tel: string;
  emp_military_id: string;
  emp_military_date_from: string;
  emp_military_date_to: string;
  emp_military_weapon: string;
  exemption_date: string;
  exemption_reason: string;
  postponement_reason: string;
  does_has_driving_license: string;
  driving_license_num: string;
  driving_license_type_id: string;
  has_relatives: string;
  relatives_details: string;
  is_disabilities_processes: string;
  disabilities_processes: string;
  notes: string;
  urgent_person_details: string;
  emp_start_date: string;
  functional_status: string;
  emp_departments_id: string;
  emp_job_id: string;
  does_has_attendance: string;
  is_has_fixed_shift: string;
  shift_type_id: string;
  daily_work_hour: string;
  emp_sal: string;
  day_price: string;
  sal_cash_or_visa: string;
  bank_number_account: string;
  motivation_type: string;
  motivation: string;
  is_social_insurance: string;
  social_insurance_number: string;
  social_insurance_cut_monthly: string;
  is_medical_insurance: string;
  medical_insurance_number: string;
  medical_insurance_cut_monthly: string;
  is_active_for_vaccation: string;
  does_has_fixed_allowance: string;
  emp_cafel: string;
  emp_pasport_no: string;
  emp_pasport_place: string;
  emp_passport_exp: string;
  home_address: string;
  resignation_id: string;
  resignation_date: string;
  resignation_cause: string;
  is_sensitive_manager_data: string;
  emp_photo: File | null;
  emp_cv: File | null;
  [key: string]: unknown;
}

interface SalaryArchiveItem {
  id: number;
  created_at: string;
  value: number | string;
  added?: {
    name: string;
  };
}

export default function EditEmployeePage() {
  const router = useRouter();
  const { id } = useParams();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSalaryArchiveModal, setShowSalaryArchiveModal] = useState(false);
  const [salaryArchiveData, setSalaryArchiveData] = useState<SalaryArchiveItem[]>([]);
  const [existingFiles, setExistingFiles] = useState({ emp_photo: '', emp_cv: '' });

  const [settings, setSettings] = useState<EmployeeSettings>({
    branches: [],
    departments: [],
    jobs: [],
    qualifications: [],
    nationalities: [],
    religions: [],
    blood_groups: [],
    countries: [],
    governorates: [],
    cities: [],
    shifts: [],
    resignations: [],
    languages: [],
    social_status: [],
    military_status: [],
    driving_license_types: []
  });

  const [formData, setFormData] = useState<EmployeeFormData>({
    zketo_code: '',
    emp_name: '',
    emp_gender: '',
    branch_id: '',
    qualifications_id: '',
    qualifications_year: '',
    graduation_estimate: '1',
    graduation_specialization: '',
    emp_email: '',
    emp_birth_date: '',
    emp_national_identity: '',
    emp_end_identity_date: '',
    emp_identity_place: '',
    blood_group_id: '',
    emp_nationality_id: '',
    emp_lang_id: '',
    emp_social_status_id: '',
    children_number: 0,
    religion_id: '',
    country_id: '',
    governorate_id: '',
    city_id: '',
    staies_address: '',
    emp_home_tel: '',
    emp_work_tel: '',
    emp_military_id: '',
    emp_military_date_from: '',
    emp_military_date_to: '',
    emp_military_weapon: '',
    exemption_date: '',
    exemption_reason: '',
    postponement_reason: '',
    does_has_driving_license: '0',
    driving_license_num: '',
    driving_license_type_id: '',
    has_relatives: '0',
    relatives_details: '',
    is_disabilities_processes: '0',
    disabilities_processes: '',
    notes: '',
    urgent_person_details: '',
    emp_start_date: '',
    functional_status: '1',
    emp_departments_id: '',
    emp_job_id: '',
    does_has_attendance: '1',
    is_has_fixed_shift: '',
    shift_type_id: '',
    daily_work_hour: '',
    emp_sal: '',
    day_price: '',
    sal_cash_or_visa: '',
    bank_number_account: '',
    motivation_type: '0',
    motivation: '',
    is_social_insurance: '0',
    social_insurance_number: '',
    social_insurance_cut_monthly: '',
    is_medical_insurance: '0',
    medical_insurance_number: '',
    medical_insurance_cut_monthly: '',
    is_active_for_vaccation: '1',
    does_has_fixed_allowance: '0',
    emp_cafel: '',
    emp_pasport_no: '',
    emp_pasport_place: '',
    emp_passport_exp: '',
    home_address: '',
    resignation_id: '',
    resignation_date: '',
    resignation_cause: '',
    is_sensitive_manager_data: '0',
    emp_photo: null,
    emp_cv: null
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Fetch settings
      const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/employees/required-data`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const settingsResult = await settingsRes.json();
      if (settingsResult.status) setSettings(settingsResult.data);

      // Fetch employee data
      const empRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/employees/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const empResult = await empRes.json();
      if (empResult.status) {
        const data = empResult.data;
        // Clean and convert data for form
        const cleanData = { ...data };
        Object.keys(cleanData).forEach(key => {
          if (cleanData[key] === null) {
            cleanData[key] = '';
          } else if (typeof cleanData[key] === 'number') {
            cleanData[key] = (cleanData[key] as number).toString();
          }
        });
        setFormData({
            ...cleanData,
            resignation_cause: data.resignation_cause || '',
            is_sensitive_manager_data: data.is_sensitive_manager_data !== null ? String(data.is_sensitive_manager_data) : '0',
            emp_photo: null,
            emp_cv: null
        });
        setExistingFiles({
          emp_photo: data.emp_photo || '',
          emp_cv: data.emp_cv || ''
        });
      } else {
        showToast(empResult.message, 'error');
        router.push('/admin/employees');
      }
    } catch {
      showToast(t('fetch_failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, files } = target;
    if (type === 'file' && files) {
      setFormData((prev: EmployeeFormData) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev: EmployeeFormData) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      const payload = new FormData();
      // Required to fake PUT method when uploading files in Laravel
      payload.append('_method', 'PUT');

      Object.keys(formData).forEach(key => {
        const val = formData[key];
        if (val !== null && val !== undefined && val !== '') {
          // Ignore nested objects (relations) except File objects
          if (typeof val === 'object' && !(val instanceof File)) {
            return;
          }
          payload.append(key, typeof val === 'number' ? String(val) : (val as string | Blob));
        }
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/employees/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: payload
      });
      const result = await res.json();
      if (result.status) {
        showToast(t('update_success'), 'success');
        router.push('/admin/employees');
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('update_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const fetchSalaryArchive = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/employees/${id}/salary-archive`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const result = await res.json();
      if (result.status) {
        setSalaryArchiveData(result.data);
        setShowSalaryArchiveModal(true);
      } else {
        showToast(result.message || t('fetch_failed'), 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    }
  };

  if (loading) return <LoadingScreen />;

  const inputClass = "w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-bold text-slate-700 bg-slate-50/50";
  const labelClass = "block text-sm font-black text-slate-600 mb-2 mr-1";
  const sectionTitleClass = "text-xl font-black text-indigo-600 mb-6 flex items-center gap-2 border-b border-indigo-100 pb-2 mt-8";

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('edit_employee')}</h2>
          <p className="text-slate-500 font-bold">{t('employee_code')}: {String(formData.employee_code || '')}</p>
        </div>
        <button onClick={() => router.back()} className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl hover:bg-slate-200 transition-all font-bold">
          {t('back')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        
        {/* Personal Data Section */}
        <h3 className={sectionTitleClass}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          {t('personal_data')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>{t('fingerprint_code')}</label>
            <input type="text" name="zketo_code" value={formData.zketo_code} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>{t('employee_name')} <span className="text-rose-500">*</span></label>
            <input type="text" name="emp_name" value={formData.emp_name} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>{t('gender')} <span className="text-rose-500">*</span></label>
            <select name="emp_gender" value={formData.emp_gender} onChange={handleChange} className={inputClass} required>
              <option value="">{t('select_option')}</option>
              <option value="1">{t('male')}</option>
              <option value="2">{t('female')}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('branch')} <span className="text-rose-500">*</span></label>
            <select name="branch_id" value={formData.branch_id} onChange={handleChange} className={inputClass} required>
              <option value="">{t('select_option')}</option>
              {settings.branches.map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('qualification')}</label>
            <select name="qualifications_id" value={formData.qualifications_id} onChange={handleChange} className={inputClass}>
              <option value="">{t('select_option')}</option>
              {settings.qualifications.map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('qualifications_year')}</label>
            <input type="text" name="qualifications_year" value={formData.qualifications_year} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('graduation_estimate')}</label>
            <select name="graduation_estimate" value={formData.graduation_estimate} onChange={handleChange} className={inputClass}>
              <option value="1">مقبول</option>
              <option value="2">جيد</option>
              <option value="3">جيد مرتفع</option>
              <option value="4">جيد جداً</option>
              <option value="5">إمتياز</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('graduation_specialization')}</label>
            <input type="text" name="graduation_specialization" value={formData.graduation_specialization} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('email')}</label>
            <input type="email" name="emp_email" value={formData.emp_email} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('birth_date')}</label>
            <input type="date" name="emp_birth_date" value={formData.emp_birth_date} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('national_identity')} <span className="text-rose-500">*</span></label>
            <input type="text" name="emp_national_identity" value={formData.emp_national_identity} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>{t('identity_end_date')} <span className="text-rose-500">*</span></label>
            <input type="date" name="emp_end_identity_date" value={formData.emp_end_identity_date} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>{t('identity_place')} <span className="text-rose-500">*</span></label>
            <input type="text" name="emp_identity_place" value={formData.emp_identity_place} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>{t('blood_group')}</label>
            <select name="blood_group_id" value={formData.blood_group_id} onChange={handleChange} className={inputClass}>
              <option value="">{t('select_option')}</option>
              {settings.blood_groups.map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('nationality')} <span className="text-rose-500">*</span></label>
            <select name="emp_nationality_id" value={formData.emp_nationality_id} onChange={handleChange} className={inputClass} required>
              <option value="">{t('select_option')}</option>
              {settings.nationalities.map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('native_language')} <span className="text-rose-500">*</span></label>
            <select name="emp_lang_id" value={formData.emp_lang_id} onChange={handleChange} className={inputClass} required>
              <option value="">{t('select_option')}</option>
              {settings.languages.map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('social_status')} <span className="text-rose-500">*</span></label>
            <select name="emp_social_status_id" value={formData.emp_social_status_id} onChange={handleChange} className={inputClass} required>
              <option value="">{t('select_option')}</option>
              {settings.social_status.map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          {formData.emp_social_status_id != '1' && formData.emp_social_status_id != '' && (
            <div>
              <label className={labelClass}>{t('children_number')}</label>
              <input type="number" name="children_number" value={formData.children_number} onChange={handleChange} className={inputClass} min="0" />
            </div>
          )}
          <div>
            <label className={labelClass}>{t('religion')} <span className="text-rose-500">*</span></label>
            <select name="religion_id" value={formData.religion_id} onChange={handleChange} className={inputClass} required>
              <option value="">{t('select_option')}</option>
              {settings.religions.map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('country')} <span className="text-rose-500">*</span></label>
            <select name="country_id" value={formData.country_id} onChange={handleChange} className={inputClass} required>
              <option value="">{t('select_option')}</option>
              {settings.countries.map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('governorate')}</label>
            <select name="governorate_id" value={formData.governorate_id} onChange={handleChange} className={inputClass}>
              <option value="">{t('select_option')}</option>
              {settings.governorates.filter((g: SettingItem) => String(g.country_id) == String(formData.country_id)).map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('center')}</label>
            <select name="city_id" value={formData.city_id} onChange={handleChange} className={inputClass}>
              <option value="">{t('select_option')}</option>
              {settings.cities.filter((c: SettingItem) => String(c.governorate_id) == String(formData.governorate_id)).map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>{t('residence_address')} <span className="text-rose-500">*</span></label>
            <input type="text" name="staies_address" value={formData.staies_address} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>{t('home_phone')} <span className="text-rose-500">*</span></label>
            <input type="text" name="emp_home_tel" value={formData.emp_home_tel} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>{t('work_phone')} <span className="text-rose-500">*</span></label>
            <input type="text" name="emp_work_tel" value={formData.emp_work_tel} onChange={handleChange} className={inputClass} required />
          </div>

          <div>
            <label className={labelClass}>{t('military_status')}</label>
            <select name="emp_military_id" value={formData.emp_military_id} onChange={handleChange} className={inputClass}>
              <option value="">{t('select_option')}</option>
              {settings.military_status.map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          
          {formData.emp_military_id == '1' && (
            <>
              <div>
                <label className={labelClass}>{t('service_start_date')} <span className="text-rose-500">*</span></label>
                <input type="date" name="emp_military_date_from" value={formData.emp_military_date_from} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>{t('service_end_date')} <span className="text-rose-500">*</span></label>
                <input type="date" name="emp_military_date_to" value={formData.emp_military_date_to} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>{t('emp_military_weapon')} <span className="text-rose-500">*</span></label>
                <input type="text" name="emp_military_weapon" value={formData.emp_military_weapon} onChange={handleChange} className={inputClass} required />
              </div>
            </>
          )}
          {formData.emp_military_id == '2' && (
            <>
              <div>
                <label className={labelClass}>{t('exemption_date')} <span className="text-rose-500">*</span></label>
                <input type="date" name="exemption_date" value={formData.exemption_date} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>{t('exemption_reason')} <span className="text-rose-500">*</span></label>
                <input type="text" name="exemption_reason" value={formData.exemption_reason} onChange={handleChange} className={inputClass} required />
              </div>
            </>
          )}
          {formData.emp_military_id == '3' && (
            <div>
              <label className={labelClass}>{t('postponement_reason')} <span className="text-rose-500">*</span></label>
              <input type="text" name="postponement_reason" value={formData.postponement_reason} onChange={handleChange} className={inputClass} required />
            </div>
          )}

          <div>
            <label className={labelClass}>{t('has_driving_license')}</label>
            <select name="does_has_driving_license" value={formData.does_has_driving_license} onChange={handleChange} className={inputClass}>
              <option value="0">{t('no')}</option>
              <option value="1">{t('yes')}</option>
            </select>
          </div>
          {formData.does_has_driving_license == '1' && (
            <>
              <div>
                <label className={labelClass}>{t('driving_license_num')} <span className="text-rose-500">*</span></label>
                <input type="text" name="driving_license_num" value={formData.driving_license_num} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>{t('driving_license_type')} <span className="text-rose-500">*</span></label>
                <select name="driving_license_type_id" value={formData.driving_license_type_id} onChange={handleChange} className={inputClass} required>
                  <option value="">{t('select_option')}</option>
                  {settings.driving_license_types.map((item: SettingItem) => (
                    <option key={item.id} value={String(item.id)}>{item.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className={labelClass}>{t('has_relatives_in_work')}</label>
            <select name="has_relatives" value={formData.has_relatives} onChange={handleChange} className={inputClass}>
              <option value="0">{t('no')}</option>
              <option value="1">{t('yes')}</option>
            </select>
          </div>
          {formData.has_relatives == '1' && (
            <div className="md:col-span-2">
              <label className={labelClass}>{t('relatives_details')} <span className="text-rose-500">*</span></label>
              <textarea name="relatives_details" value={formData.relatives_details} onChange={handleChange} className={inputClass} rows={1} required />
            </div>
          )}

          <div>
            <label className={labelClass}>{t('has_disabilities')}</label>
            <select name="is_disabilities_processes" value={formData.is_disabilities_processes} onChange={handleChange} className={inputClass}>
              <option value="0">{t('no')}</option>
              <option value="1">{t('yes')}</option>
            </select>
          </div>
          {formData.is_disabilities_processes == '1' && (
            <div className="md:col-span-2">
              <label className={labelClass}>{t('disabilities_processes')} <span className="text-rose-500">*</span></label>
              <textarea name="disabilities_processes" value={formData.disabilities_processes} onChange={handleChange} className={inputClass} rows={1} required />
            </div>
          )}
          
          <div className="md:col-span-3">
            <label className={labelClass}>{t('notes')}</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className={inputClass} rows={2} />
          </div>
        </div>

        {/* Job Data Section */}
        <h3 className={sectionTitleClass}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          {t('job_data')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>{t('emp_start_date')} <span className="text-rose-500">*</span></label>
            <input type="date" name="emp_start_date" value={formData.emp_start_date} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>{t('functional_status')} <span className="text-rose-500">*</span></label>
            <select name="functional_status" value={formData.functional_status} onChange={handleChange} className={inputClass} required>
              <option value="1">{t('functional_status_in')}</option>
              <option value="0">{t('functional_status_out')}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('department')} <span className="text-rose-500">*</span></label>
            <select name="emp_departments_id" value={formData.emp_departments_id} onChange={handleChange} className={inputClass} required>
              <option value="">{t('select_option')}</option>
              {settings.departments.map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('job')} <span className="text-rose-500">*</span></label>
            <select name="emp_job_id" value={formData.emp_job_id} onChange={handleChange} className={inputClass} required>
              <option value="">{t('select_option')}</option>
              {settings.jobs.map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('attendance_required')}</label>
            <select name="does_has_attendance" value={formData.does_has_attendance} onChange={handleChange} className={inputClass}>
              <option value="1">{t('yes')}</option>
              <option value="0">{t('no')}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('has_fixed_shift')} <span className="text-rose-500">*</span></label>
            <select name="is_has_fixed_shift" value={formData.is_has_fixed_shift} onChange={handleChange} className={inputClass} required>
              <option value="">{t('select_option')}</option>
              <option value="1">{t('yes')}</option>
              <option value="0">{t('no')}</option>
            </select>
          </div>
          
          {formData.is_has_fixed_shift === '1' ? (
            <div>
              <label className={labelClass}>{t('shift_type')} <span className="text-rose-500">*</span></label>
              <select name="shift_type_id" value={formData.shift_type_id} onChange={handleChange} className={inputClass} required>
                <option value="">{t('select_option')}</option>
                {settings.shifts.map((item: SettingItem) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.type == 1 ? t('morning_shift') : t('evening_shift')} ({item.from_time} - {item.to_time})
                  </option>
                ))}
              </select>
            </div>
          ) : formData.is_has_fixed_shift === '0' ? (
            <div>
              <label className={labelClass}>{t('daily_work_hours')} <span className="text-rose-500">*</span></label>
              <input type="number" name="daily_work_hour" value={formData.daily_work_hour} onChange={handleChange} className={inputClass} required min="1" max="24" />
            </div>
          ) : null}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-black text-slate-600">{t('salary')} <span className="text-rose-500">*</span></label>
              <button type="button" onClick={fetchSalaryArchive} className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 transition-colors">
                أرشيف الراتب
              </button>
            </div>
            <input type="number" name="emp_sal" value={formData.emp_sal} onChange={handleChange} className={inputClass} required min="0" />
          </div>
          <div>
            <label className={labelClass}>{t('day_price')}</label>
            <input type="number" name="day_price" value={formData.day_price} onChange={handleChange} className={inputClass} min="0" />
          </div>
          <div>
            <label className={labelClass}>{t('payment_method')} <span className="text-rose-500">*</span></label>
            <select name="sal_cash_or_visa" value={formData.sal_cash_or_visa} onChange={handleChange} className={inputClass} required>
              <option value="">{t('select_option')}</option>
              <option value="1">{t('salary_payment_cash')}</option>
              <option value="2">{t('salary_payment_bank')}</option>
            </select>
          </div>
          {formData.sal_cash_or_visa == '2' && (
            <div>
              <label className={labelClass}>{t('bank_account_number')} <span className="text-rose-500">*</span></label>
              <input type="text" name="bank_number_account" value={formData.bank_number_account} onChange={handleChange} className={inputClass} required />
            </div>
          )}

          <div>
            <label className={labelClass}>{t('motivation_type')}</label>
            <select name="motivation_type" value={formData.motivation_type} onChange={handleChange} className={inputClass}>
              <option value="0">{t('motivation_none')}</option>
              <option value="1">{t('motivation_fixed')}</option>
              <option value="2">{t('motivation_variable')}</option>
            </select>
          </div>
          {formData.motivation_type == '1' && (
            <div>
              <label className={labelClass}>{t('motivation_value')} <span className="text-rose-500">*</span></label>
              <input type="number" name="motivation" value={formData.motivation} onChange={handleChange} className={inputClass} required min="0" />
            </div>
          )}

          <div>
            <label className={labelClass}>{t('is_social_insurance')}</label>
            <select name="is_social_insurance" value={formData.is_social_insurance} onChange={handleChange} className={inputClass}>
              <option value="1">{t('yes')}</option>
              <option value="0">{t('no')}</option>
            </select>
          </div>
          {formData.is_social_insurance == '1' && (
            <>
              <div>
                <label className={labelClass}>{t('social_insurance_number')} <span className="text-rose-500">*</span></label>
                <input type="text" name="social_insurance_number" value={formData.social_insurance_number} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>{t('social_insurance_cut_monthly')} <span className="text-rose-500">*</span></label>
                <input type="number" name="social_insurance_cut_monthly" value={formData.social_insurance_cut_monthly} onChange={handleChange} className={inputClass} required min="0" />
              </div>
            </>
          )}

          <div>
            <label className={labelClass}>{t('is_medical_insurance')}</label>
            <select name="is_medical_insurance" value={formData.is_medical_insurance} onChange={handleChange} className={inputClass}>
              <option value="1">{t('yes')}</option>
              <option value="0">{t('no')}</option>
            </select>
          </div>
          {formData.is_medical_insurance == '1' && (
            <>
              <div>
                <label className={labelClass}>{t('medical_insurance_number')} <span className="text-rose-500">*</span></label>
                <input type="text" name="medical_insurance_number" value={formData.medical_insurance_number} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>{t('medical_insurance_cut_monthly')} <span className="text-rose-500">*</span></label>
                <input type="number" name="medical_insurance_cut_monthly" value={formData.medical_insurance_cut_monthly} onChange={handleChange} className={inputClass} required min="0" />
              </div>
            </>
          )}

          <div>
            <label className={labelClass}>{t('is_active_for_vaccation')}</label>
            <select name="is_active_for_vaccation" value={formData.is_active_for_vaccation} onChange={handleChange} className={inputClass}>
              <option value="1">{t('yes')}</option>
              <option value="0">{t('no')}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>{t('does_has_fixed_allowance')}</label>
            <select name="does_has_fixed_allowance" value={formData.does_has_fixed_allowance} onChange={handleChange} className={inputClass}>
              <option value="1">{t('yes')}</option>
              <option value="0">{t('no')}</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className={labelClass}>{t('urgent_person_details')}</label>
            <textarea name="urgent_person_details" value={formData.urgent_person_details} onChange={handleChange} className={inputClass} rows={2} />
          </div>
        </div>

        {/* Additional Data Section */}
        <h3 className={sectionTitleClass}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          {t('additional_data')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>{t('emp_cafel')}</label>
            <input type="text" name="emp_cafel" value={formData.emp_cafel} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('emp_pasport_no')}</label>
            <input type="text" name="emp_pasport_no" value={formData.emp_pasport_no} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('emp_pasport_place')}</label>
            <input type="text" name="emp_pasport_place" value={formData.emp_pasport_place} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('emp_passport_exp')}</label>
            <input type="date" name="emp_passport_exp" value={formData.emp_passport_exp} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>{t('home_address')}</label>
            <input type="text" name="home_address" value={formData.home_address} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('resignation_id')}</label>
            <select name="resignation_id" value={formData.resignation_id} onChange={handleChange} className={inputClass}>
              <option value="">{t('select_option')}</option>
              {settings.resignations.map((item: SettingItem) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
          </div>
          {formData.resignation_id != '' && (
            <>
              <div>
                <label className={labelClass}>{t('resignation_date')} <span className="text-rose-500">*</span></label>
                <input type="date" name="resignation_date" value={formData.resignation_date} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>{t('resignation_cause')} <span className="text-rose-500">*</span></label>
                <input type="text" name="resignation_cause" value={formData.resignation_cause} onChange={handleChange} className={inputClass} required />
              </div>
            </>
          )}
          <div>
            <label className={labelClass}>{t('is_sensitive_manager_data')}</label>
            <select name="is_sensitive_manager_data" value={formData.is_sensitive_manager_data} onChange={handleChange} className={inputClass}>
              <option value="1">{t('yes')}</option>
              <option value="0">{t('no')}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>تحديث الصورة الشخصية (اختياري)</label>
            {existingFiles.emp_photo && (
              <div className="mb-3">
                <img src={`${process.env.NEXT_PUBLIC_UPLOAD_URL || ''}/${existingFiles.emp_photo}`} alt="صورة الموظف الحالية" className="w-24 h-24 rounded-2xl object-cover shadow-md border-2 border-indigo-100" />
              </div>
            )}
            <input type="file" name="emp_photo" accept="image/*" onChange={handleChange} className={inputClass} />
            {existingFiles.emp_photo && (
              <p className="mt-2 text-xs font-bold text-indigo-600">اختر صورة جديدة لاستبدال الصورة الحالية</p>
            )}
          </div>
          <div>
            <label className={labelClass}>تحديث السيرة الذاتية (اختياري)</label>
            <input type="file" name="emp_cv" accept=".pdf,.doc,.docx" onChange={handleChange} className={inputClass} />
            {existingFiles.emp_cv && (
              <p className="mt-2 text-xs font-bold text-indigo-600">يوجد ملف سيرة ذاتية في النظام</p>
            )}
          </div>
        </div>

        <div className="mt-12 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl hover:bg-indigo-700 transition-all font-black text-lg shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {saving ? t('saving') : t('save_changes')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all font-black"
          >
            {t('cancel')}
          </button>
        </div>
      </form>

      {showSalaryArchiveModal && createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 animate-zoom-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">أرشيف رواتب الموظف</h3>
              <button onClick={() => setShowSalaryArchiveModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {salaryArchiveData.length > 0 ? (
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">{t('archive_date_time')}</th>
                      <th className="px-4 py-3">{t('salary')}</th>
                      <th className="px-4 py-3">{t('added_by')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryArchiveData.map((item: SalaryArchiveItem) => (
                      <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-xs text-slate-500 font-medium">{new Date(item.created_at).toLocaleString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                        <td className="px-4 py-3 font-bold text-indigo-600">{item.value}</td>
                        <td className="px-4 py-3 text-slate-700">{item.added?.name || '---'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 font-bold text-lg">لا يوجد رواتب مؤرشفة لهذا الموظف</p>
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <button type="button" onClick={() => setShowSalaryArchiveModal(false)} className="w-full bg-slate-100 text-slate-900 border-2 border-slate-200 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95">{t('close')}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
