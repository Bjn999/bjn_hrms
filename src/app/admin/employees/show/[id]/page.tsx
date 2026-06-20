'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ShowEmployeePage() {
  const router = useRouter();
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [allowancesList, setAllowancesList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingAllowanceId, setEditingAllowanceId] = useState<number | null>(null);
  const [modalAllowanceId, setModalAllowanceId] = useState('');
  const [modalValue, setModalValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showSalaryArchiveModal, setShowSalaryArchiveModal] = useState(false);
  const [salaryArchiveData, setSalaryArchiveData] = useState([]);
  
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileFormData, setFileFormData] = useState<{name: string, file_path: any}>({ name: '', file_path: null });
  const [isFileSubmitting, setIsFileSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // Fetch employee details
      const res = await fetch(`http://localhost:8000/api/admin/employees/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const result = await res.json();
      if (result.status) {
        setData(result.data);
      } else {
        showToast(result.message, 'error');
        router.push('/admin/employees');
      }

      // Fetch active allowances for the modal
      const settingsRes = await fetch('http://localhost:8000/api/admin/employees/required-data', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const settingsResult = await settingsRes.json();
      if (settingsResult.status) {
        setAllowancesList(settingsResult.data.allowances || []);
      }
    } catch (e) {
      showToast(t('fetch_failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'add' | 'edit', item: any = null) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setEditingAllowanceId(item.id);
      setModalAllowanceId(String(item.allowance_id));
      setModalValue(String(item.value));
    } else {
      setEditingAllowanceId(null);
      setModalAllowanceId('');
      setModalValue('');
    }
    setShowModal(true);
  };

  const handleSubmitAllowance = async (e: any) => {
    e.preventDefault();
    if (!modalAllowanceId || !modalValue) {
      showToast(t('select_option'), 'error');
      return;
    }

    if (modalMode === 'add') {
      const isDuplicate = data?.fixed_allowances?.some((item: any) => String(item.allowance_id) === String(modalAllowanceId));
      if (isDuplicate) {
        showToast(language === 'ar' ? 'عفواً هذا البدل مسجل لهذا الموظف من قبل' : 'Allowance already exists for this employee', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      const url = modalMode === 'add' 
        ? `http://localhost:8000/api/admin/employees/${id}/fixed-allowances`
        : `http://localhost:8000/api/admin/employees/fixed-allowances/${editingAllowanceId}`;
      
      const res = await fetch(url, {
        method: modalMode === 'add' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          allowance_id: parseInt(modalAllowanceId),
          value: parseFloat(modalValue)
        })
      });
      const result = await res.json();
      if (result.status) {
        showToast(modalMode === 'add' ? t('allowance_added_success') : t('update_success'), 'success');
        setShowModal(false);
        fetchData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err) {
      showToast(t('update_error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAllowance = async (allowanceId: number) => {
    const isConfirmed = await confirm({
      title: t('confirm_delete'),
      description: 'هل أنت متأكد من رغبتك في حذف هذا البدل؟',
      icon: 'danger'
    });

    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`http://localhost:8000/api/admin/employees/fixed-allowances/${allowanceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await res.json();
      if (result.status) {
        showToast(t('allowance_deleted_success'), 'success');
        fetchData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err) {
      showToast(t('update_error'), 'error');
    }
  };

  const fetchSalaryArchive = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`http://localhost:8000/api/admin/employees/${id}/salary-archive`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const result = await res.json();
      if (result.status) {
        setSalaryArchiveData(result.data);
        setShowSalaryArchiveModal(true);
      } else {
        showToast(result.message || t('fetch_failed'), 'error');
      }
    } catch (error) {
      showToast(t('conn_error'), 'error');
    }
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileFormData.name || !fileFormData.file_path) {
      showToast('يجب إدخال اسم الملف واختيار الملف', 'warning');
      return;
    }
    setIsFileSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      const payload = new FormData();
      payload.append('name', fileFormData.name);
      payload.append('file_path', fileFormData.file_path);

      const res = await fetch(`http://localhost:8000/api/admin/employees/${id}/files`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: payload
      });
      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
        setShowFileModal(false);
        setFileFormData({ name: '', file_path: null });
        fetchData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال', 'error');
    } finally {
      setIsFileSubmitting(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    const isConfirmed = await confirm({
      title: t('confirm_delete_title'),
      description: 'هل أنت متأكد من رغبتك في حذف هذا الملف؟',
      icon: 'danger'
    });
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`http://localhost:8000/api/admin/employees/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
        fetchData();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err) {
      showToast('حدث خطأ في الاتصال', 'error');
    }
  };

  const handleDownloadFile = async (fileName: string) => {
    try {
      const url = `http://localhost:8000/assets/admin/uploads/${fileName}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch(e) {
      window.open(`http://localhost:8000/assets/admin/uploads/${fileName}`, '_blank');
    }
  };

  if (loading || !data) return <LoadingScreen />;

  const sectionClass = "bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden animate-fade-in mb-8";
  const labelClass = "text-xs font-black text-slate-400 uppercase tracking-wider mb-1";
  const valueClass = "text-base font-bold text-slate-900";

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {data.emp_photo ? (
            <img src={`http://localhost:8000/assets/admin/uploads/${data.emp_photo}`} alt={data.emp_name} className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-indigo-200 border-2 border-white" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-200">
              {data.emp_name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{data.emp_name}</h2>
            <p className="text-slate-500 font-bold">#{data.employee_code} • {data.job?.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push(`/admin/employees/edit/${id}`)}
            className="bg-amber-500 text-white px-6 py-2.5 rounded-xl hover:bg-amber-600 transition-all font-bold flex items-center gap-2 shadow-lg shadow-amber-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            {t('edit')}
          </button>
          <button 
            onClick={() => router.back()}
            className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl hover:bg-slate-200 transition-all font-bold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t('back')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Personal Data Section */}
          <div className={sectionClass}>
            <div className="absolute top-0 right-0 w-full h-1.5 bg-indigo-500"></div>
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              {t('personal_data')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className={labelClass}>{t('gender')}</p>
                <p className={valueClass}>{data.emp_gender == 1 ? t('male') : t('female')}</p>
              </div>
              <div>
                <p className={labelClass}>{t('birth_date')}</p>
                <p className={valueClass}>{data.emp_birth_date || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('nationality')}</p>
                <p className={valueClass}>{data.nationality?.name || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('religion')}</p>
                <p className={valueClass}>{data.religion?.name || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('blood_group')}</p>
                <p className={valueClass}>{data.blood_group?.name || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('social_status')}</p>
                <p className={valueClass}>{data.social_status?.name || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('children_number')}</p>
                <p className={valueClass}>{data.children_number || '0'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('fingerprint_code')}</p>
                <p className={valueClass}>{data.zketo_code || '---'}</p>
              </div>
              <div className="col-span-full">
                <p className={labelClass}>{t('residence_address')}</p>
                <p className={valueClass}>{data.staies_address || '---'}</p>
              </div>
            </div>
          </div>

          {/* Qualification Info */}
          <div className={sectionClass}>
            <div className="absolute top-0 right-0 w-full h-1.5 bg-blue-500"></div>
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
              {t('qualification')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className={labelClass}>{t('qualification')}</p>
                <p className={valueClass}>{data.qualification?.name || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('qualifications_year')}</p>
                <p className={valueClass}>{data.qualifications_year || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('graduation_estimate')}</p>
                <p className={valueClass}>
                  {data.graduation_estimate == 1 ? 'مقبول' : 
                   data.graduation_estimate == 2 ? 'جيد' :
                   data.graduation_estimate == 3 ? 'جيد مرتفع' :
                   data.graduation_estimate == 4 ? 'جيد جداً' :
                   data.graduation_estimate == 5 ? 'إمتياز' : '---'}
                </p>
              </div>
              <div className="col-span-full">
                <p className={labelClass}>{t('graduation_specialization')}</p>
                <p className={valueClass}>{data.graduation_specialization || '---'}</p>
              </div>
            </div>
          </div>

          {/* Job Data Section */}
          <div className={sectionClass}>
            <div className="absolute top-0 right-0 w-full h-1.5 bg-purple-500"></div>
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {t('job_data')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className={labelClass}>{t('branch')}</p>
                <p className={valueClass}>{data.branch?.name || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('department')}</p>
                <p className={valueClass}>{data.department?.name || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('job')}</p>
                <p className={valueClass}>{data.job?.name || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('emp_start_date')}</p>
                <p className={valueClass}>{data.emp_start_date || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('functional_status')}</p>
                <p className={`text-base font-bold ${data.functional_status == 1 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {data.functional_status == 1 ? t('functional_status_in') : t('functional_status_out')}
                </p>
              </div>
              <div>
                <p className={labelClass}>{t('attendance_required')}</p>
                <p className={valueClass}>{data.does_has_attendance == 1 ? t('yes') : t('no')}</p>
              </div>
              <div>
                <p className={labelClass}>{t('has_fixed_shift')}</p>
                <p className={valueClass}>{data.is_has_fixed_shift == 1 ? t('yes') : t('no')}</p>
              </div>
              {data.is_has_fixed_shift == 1 ? (
                <div>
                  <p className={labelClass}>{t('shift_type')}</p>
                  <p className={valueClass}>{data.shift?.type == 1 ? t('morning_shift') : t('evening_shift')} ({data.shift?.from_time} - {data.shift?.to_time})</p>
                </div>
              ) : (
                <div>
                  <p className={labelClass}>{t('daily_work_hours')}</p>
                  <p className={valueClass}>{data.daily_work_hour} {t('hours')}</p>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className={labelClass}>{t('salary')}</p>
                  <button type="button" onClick={fetchSalaryArchive} className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 transition-colors">
                    أرشيف الراتب
                  </button>
                </div>
                <p className="text-xl font-black text-indigo-600">{data.emp_sal} <span className="text-xs font-bold text-slate-400">{t('currency')}</span></p>
              </div>
              <div>
                <p className={labelClass}>{t('payment_method')}</p>
                <p className={valueClass}>{data.sal_cash_or_visa == 1 ? t('salary_payment_cash') : t('salary_payment_bank')}</p>
              </div>
              {data.sal_cash_or_visa == 2 && (
                <div>
                  <p className={labelClass}>{t('bank_account_number')}</p>
                  <p className={valueClass}>{data.bank_number_account || '---'}</p>
                </div>
              )}
              <div>
                <p className={labelClass}>{t('motivation_type')}</p>
                <p className={valueClass}>
                  {data.motivation_type == 1 ? t('motivation_fixed') : 
                   data.motivation_type == 2 ? t('motivation_variable') : t('motivation_none')}
                </p>
              </div>
              {data.motivation_type == 1 && (
                <div>
                  <p className={labelClass}>{t('motivation_value')}</p>
                  <p className={valueClass}>{data.motivation} {t('currency')}</p>
                </div>
              )}
              <div>
                <p className={labelClass}>{t('is_social_insurance')}</p>
                <p className={valueClass}>{data.is_social_insurance == 1 ? t('yes') : t('no')}</p>
              </div>
              {data.is_social_insurance == 1 && (
                <>
                  <div>
                    <p className={labelClass}>{t('social_insurance_number')}</p>
                    <p className={valueClass}>{data.social_insurance_number || '---'}</p>
                  </div>
                  <div>
                    <p className={labelClass}>{t('social_insurance_cut_monthly')}</p>
                    <p className={valueClass}>{data.social_insurance_cut_monthly} {t('currency')}</p>
                  </div>
                </>
              )}
              <div>
                <p className={labelClass}>{t('is_medical_insurance')}</p>
                <p className={valueClass}>{data.is_medical_insurance == 1 ? t('yes') : t('no')}</p>
              </div>
              {data.is_medical_insurance == 1 && (
                <>
                  <div>
                    <p className={labelClass}>{t('medical_insurance_number')}</p>
                    <p className={valueClass}>{data.medical_insurance_number || '---'}</p>
                  </div>
                  <div>
                    <p className={labelClass}>{t('medical_insurance_cut_monthly')}</p>
                    <p className={valueClass}>{data.medical_insurance_cut_monthly} {t('currency')}</p>
                  </div>
                </>
              )}
              <div>
                <p className={labelClass}>{t('is_active_for_vaccation')}</p>
                <p className={valueClass}>{data.is_active_for_vaccation == 1 ? t('yes') : t('no')}</p>
              </div>
              <div>
                <p className={labelClass}>{t('does_has_fixed_allowance')}</p>
                <p className={valueClass}>{data.does_has_fixed_allowance == 1 ? t('yes') : t('no')}</p>
              </div>
            </div>

            {data.does_has_fixed_allowance == 1 && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('fixed_allowances')}
                  </h4>
                  <button
                    onClick={() => handleOpenModal('add')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all font-bold text-sm flex items-center gap-1.5 shadow-md shadow-indigo-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('add_fixed_allowance')}
                  </button>
                </div>

                {data.fixed_allowances && data.fixed_allowances.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-sm">
                          <th className="p-4 text-right">{t('allowance_name')}</th>
                          <th className="p-4 text-right">{t('allowance_value')}</th>
                          <th className="p-4 text-right">{t('created_at')}</th>
                          <th className="p-4 text-center">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.fixed_allowances.map((item: any) => (
                          <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all text-slate-700 font-semibold text-sm">
                            <td className="p-4">{item.allowance?.name}</td>
                            <td className="p-4 text-indigo-600 font-black">{item.value} {t('currency')}</td>
                            <td className="p-4 text-xs text-slate-400">
                              {new Date(item.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')} - {item.added?.name}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenModal('edit', item)}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-500 p-2 rounded-lg transition-all"
                                  title={t('edit')}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteAllowance(item.id)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-lg transition-all"
                                  title={t('delete')}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">{t('no_fixed_allowances')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Military Service */}
          {data.emp_military_id && (
            <div className={sectionClass}>
              <div className="absolute top-0 right-0 w-full h-1.5 bg-slate-500"></div>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                {t('military_status')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className={labelClass}>{t('military_status')}</p>
                  <p className={valueClass}>
                    {data.emp_military_id == 1 ? 'أدى الخدمة' : 
                     data.emp_military_id == 2 ? 'إعفاء' :
                     data.emp_military_id == 3 ? 'تأجيل' : '---'}
                  </p>
                </div>
                {data.emp_military_id == 1 && (
                  <>
                    <div>
                      <p className={labelClass}>{t('service_start_date')}</p>
                      <p className={valueClass}>{data.emp_military_date_from || '---'}</p>
                    </div>
                    <div>
                      <p className={labelClass}>{t('service_end_date')}</p>
                      <p className={valueClass}>{data.emp_military_date_to || '---'}</p>
                    </div>
                    <div>
                      <p className={labelClass}>{t('emp_military_weapon')}</p>
                      <p className={valueClass}>{data.emp_military_weapon || '---'}</p>
                    </div>
                  </>
                )}
                {data.emp_military_id == 2 && (
                  <>
                    <div>
                      <p className={labelClass}>{t('exemption_date')}</p>
                      <p className={valueClass}>{data.exemption_date || '---'}</p>
                    </div>
                    <div>
                      <p className={labelClass}>{t('exemption_reason')}</p>
                      <p className={valueClass}>{data.exemption_reason || '---'}</p>
                    </div>
                  </>
                )}
                {data.emp_military_id == 3 && (
                  <div className="col-span-2">
                    <p className={labelClass}>{t('postponement_reason')}</p>
                    <p className={valueClass}>{data.postponement_reason || '---'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passport & Additional Section */}
          <div className={sectionClass}>
            <div className="absolute top-0 right-0 w-full h-1.5 bg-amber-500"></div>
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {t('additional_data')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className={labelClass}>{t('emp_pasport_no')}</p>
                <p className={valueClass}>{data.emp_pasport_no || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('emp_pasport_place')}</p>
                <p className={valueClass}>{data.emp_pasport_place || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('emp_passport_exp')}</p>
                <p className={valueClass}>{data.emp_passport_exp || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('emp_cafel')}</p>
                <p className={valueClass}>{data.emp_cafel || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('home_address')}</p>
                <p className={valueClass}>{data.home_address || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('is_sensitive_manager_data')}</p>
                <p className={valueClass}>{data.is_sensitive_manager_data == 1 ? t('yes') : t('no')}</p>
              </div>
              <div>
                <p className={labelClass}>{t('has_driving_license')}</p>
                <p className={valueClass}>{data.does_has_driving_license == 1 ? t('yes') : t('no')}</p>
              </div>
              {data.does_has_driving_license == 1 && (
                <>
                  <div>
                    <p className={labelClass}>{t('driving_license_num')}</p>
                    <p className={valueClass}>{data.driving_license_num || '---'}</p>
                  </div>
                  <div>
                    <p className={labelClass}>{t('driving_license_type')}</p>
                    <p className={valueClass}>{data.driving_license_type?.name || '---'}</p>
                  </div>
                </>
              )}
              <div className="col-span-full mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.emp_cv ? 'bg-rose-100 text-rose-500' : 'bg-slate-200 text-slate-400'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">السيرة الذاتية للموظف</p>
                    <p className={`text-xs font-bold ${data.emp_cv ? 'text-slate-400' : 'text-slate-500'}`}>
                      {data.emp_cv ? 'ملف مرفق' : 'لا يوجد سيرة ذاتية'}
                    </p>
                  </div>
                </div>
                {data.emp_cv && (
                  <button 
                    onClick={async () => {
                      try {
                        const url = `http://localhost:8000/assets/admin/uploads/${data.emp_cv}`;
                        const response = await fetch(url);
                        const blob = await response.blob();
                        const downloadUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = data.emp_cv;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(downloadUrl);
                      } catch(e) {
                        window.open(`http://localhost:8000/assets/admin/uploads/${data.emp_cv}`, '_blank');
                      }
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all font-bold text-sm shadow-md shadow-indigo-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    تحميل
                  </button>
                )}
              </div>
            </div>

            {/* Employee Files Section */}
            <div className="col-span-full mt-6 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                  الملفات المرفقة للموظف
                </h4>
                <button 
                  onClick={() => setShowFileModal(true)}
                  className="bg-slate-100 text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-all font-bold text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  رفع ملف جديد
                </button>
              </div>
              
              {data.files && data.files.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">اسم الملف</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">تاريخ الرفع</th>
                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.files.map((file: any) => (
                        <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-slate-800">{file.name}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm font-bold text-slate-500">{new Date(file.created_at).toLocaleDateString('ar-SA')}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => handleDownloadFile(file.file_path)}
                                className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-all"
                                title="تحميل / عرض"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteFile(file.id)}
                                className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-all"
                                title="حذف"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-bold">لا توجد ملفات مرفقة لهذا الموظف</p>
                </div>
              )}
            </div>
          </div>

          {data.has_relatives == 1 && (
            <div className={sectionClass}>
              <h3 className="text-lg font-black text-slate-800 mb-4">{t('relatives_details')}</h3>
              <p className="text-slate-600 font-bold whitespace-pre-wrap">{data.relatives_details}</p>
            </div>
          )}

          {data.is_disabilities_processes == 1 && (
            <div className={sectionClass}>
              <h3 className="text-lg font-black text-slate-800 mb-4">{t('disabilities_processes')}</h3>
              <p className="text-slate-600 font-bold whitespace-pre-wrap">{data.disabilities_processes}</p>
            </div>
          )}

          {data.resignation_id && (
            <div className={sectionClass}>
              <div className="absolute top-0 right-0 w-full h-1.5 bg-rose-500"></div>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                {t('resignation_info')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className={labelClass}>{t('resignation_id')}</p>
                  <p className={valueClass}>{data.resignation?.name || '---'}</p>
                </div>
                <div>
                  <p className={labelClass}>{t('resignation_date')}</p>
                  <p className={valueClass}>{data.resignation_date || '---'}</p>
                </div>
                <div className="col-span-full">
                  <p className={labelClass}>{t('resignation_cause')}</p>
                  <p className={valueClass}>{data.resignation_cause || '---'}</p>
                </div>
              </div>
            </div>
          )}

          {data.notes && (
            <div className={sectionClass}>
               <h3 className="text-lg font-black text-slate-800 mb-4">{t('notes')}</h3>
               <p className="text-slate-600 font-bold whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Identity Info */}
          <div className={sectionClass}>
            <div className="absolute top-0 right-0 w-full h-1.5 bg-rose-500"></div>
            <h3 className="text-lg font-black text-slate-800 mb-6">{t('identity_info')}</h3>
            <div className="space-y-4">
              <div>
                <p className={labelClass}>{t('national_identity')}</p>
                <p className={valueClass}>{data.emp_national_identity || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('identity_place')}</p>
                <p className={valueClass}>{data.emp_identity_place || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('identity_end_date')}</p>
                <p className={valueClass}>{data.emp_end_identity_date || '---'}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className={sectionClass}>
            <div className="absolute top-0 right-0 w-full h-1.5 bg-emerald-500"></div>
            <h3 className="text-lg font-black text-slate-800 mb-6">{t('contact_info')}</h3>
            <div className="space-y-4">
              <div>
                <p className={labelClass}>{t('email')}</p>
                <p className={valueClass}>{data.emp_email || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('home_phone')}</p>
                <p className={valueClass}>{data.emp_home_tel || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('work_phone')}</p>
                <p className={valueClass}>{data.emp_work_tel || '---'}</p>
              </div>
              <div>
                <p className={labelClass}>{t('urgent_person_details')}</p>
                <p className="text-sm font-bold text-slate-600">{data.urgent_person_details || '---'}</p>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className={sectionClass}>
             <div className="absolute top-0 right-0 w-full h-1.5 bg-sky-500"></div>
             <h3 className="text-lg font-black text-slate-800 mb-6">{t('location')}</h3>
             <div className="space-y-4">
                <div>
                   <p className={labelClass}>{t('country')}</p>
                   <p className={valueClass}>{data.country?.name || '---'}</p>
                </div>
                <div>
                   <p className={labelClass}>{t('governorate')}</p>
                   <p className={valueClass}>{data.governorate?.name || '---'}</p>
                </div>
                <div>
                   <p className={labelClass}>{t('center')}</p>
                   <p className={valueClass}>{data.city?.name || '---'}</p>
                </div>
             </div>
          </div>

          {/* Audit Info */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
             <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">{t('added_by')}:</span>
                <span className="font-black text-indigo-600">{data.added?.name}</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">{t('created_at')}:</span>
                <span className="font-black text-slate-700">{new Date(data.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
             </div>
             {data.updatedby && (
               <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-500">{t('updated_by')}:</span>
                  <span className="font-black text-amber-600">{data.updatedby.name}</span>
               </div>
             )}
          </div>
        </div>
      </div>

      {showModal && createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-scale-up relative">
            <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800">{modalMode === 'add' ? t('add_fixed_allowance') : 'تعديل البدل الثابت'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-rose-500 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitAllowance} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-black text-slate-600 mb-2 mr-1">
                  {t('allowances')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={modalAllowanceId}
                  onChange={(e) => setModalAllowanceId(e.target.value)}
                  className={`w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-bold text-slate-700 bg-slate-50/50 ${modalMode === 'edit' ? 'bg-slate-100 cursor-not-allowed opacity-70' : ''}`}
                  required
                  disabled={modalMode === 'edit'}
                >
                  <option value="">{t('select_option')}</option>
                  {allowancesList.map((item: any) => (
                    <option key={item.id} value={String(item.id)}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-600 mb-2 mr-1">
                  {t('allowance_value')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-bold text-slate-700 bg-slate-50/50"
                  placeholder="0.00"
                  min="0"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-black shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {isSubmitting ? t('saving') : t('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-black"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

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
                      {salaryArchiveData.map((item: any) => (
                        <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-xs text-slate-500 font-medium">{new Date(item.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
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
      {/* File Upload Modal */}
      {showFileModal && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowFileModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-scale-up">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">رفع ملف جديد</h3>
              <button onClick={() => setShowFileModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddFile} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2">اسم الملف (وصف للملف)</label>
                  <input 
                    type="text" 
                    required 
                    value={fileFormData.name}
                    onChange={(e) => setFileFormData({...fileFormData, name: e.target.value})}
                    placeholder="مثال: صورة الجواز، صورة الهوية..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2">اختر الملف</label>
                  <input 
                    type="file" 
                    required 
                    onChange={(e) => setFileFormData({...fileFormData, file_path: e.target.files ? e.target.files[0] : null})}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold transition-all"
                  />
                  <p className="mt-2 text-xs font-bold text-slate-400">الصيغ المدعومة: الصور ومستندات PDF والوورد</p>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button
                  type="submit"
                  disabled={isFileSubmitting}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-black shadow-md shadow-indigo-200 disabled:opacity-50"
                >
                  {isFileSubmitting ? 'جاري الرفع...' : 'رفع وحفظ'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFileModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl hover:bg-slate-200 transition-all font-black"
                >{t('cancel')}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
