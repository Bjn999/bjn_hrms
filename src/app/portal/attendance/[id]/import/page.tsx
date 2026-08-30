'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { FinanceMonth, Employee } from '@/types';
import { TranslationKey } from '@/i18n/translations';

interface ParsedRecord {
  index: number;
  employee_code: string;
  zketo_code: string;
  employee_name: string;
  action_date_time: string;
  action_type_name: string;
  status: 'valid' | 'outside_period' | 'employee_not_found' | 'duplicate' | 'invalid_data';
  status_message: TranslationKey;
}

const API = (process.env.NEXT_PUBLIC_API_URL || '') + '/admin';

export default function AttendanceImportPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const monthId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [financeMonth, setFinanceMonth] = useState<FinanceMonth | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const headers = () => ({
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/attendances/${monthId}`, { headers: headers() });
      const result = await res.json();
      if (result.status) {
        setEmployees(result.employees || []);
        setFinanceMonth(result.finance_month);
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [monthId]);


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseFile(e.target.files[0]);
    }
  };

  const parseFile = async (file: File) => {
    // Validate type from UI first
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
      showToast('عفواً، يجب أن يكون الملف بصيغة إكسل (xlsx, xls) أو CSV', 'error');
      return;
    }

    // Validate size (10MB max) from UI first
    if (file.size > 10 * 1024 * 1024) {
      showToast('حجم الملف كبير جداً، الحد الأقصى المسموح به هو 10 ميجا', 'error');
      return;
    }

    setSelectedFile(file);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('finance_months_periods_id', monthId);
      formData.append('has_header', hasHeader ? '1' : '0');

      const res = await fetch(`${API}/attendances/import-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
          'Accept-Language': language
        },
        body: formData,
      });

      const result = await res.json();
      if (result.status) {
        setParsedRecords(result.records || []);
        showToast(result.message || 'تم تحليل ملف البصمة بنجاح، يرجى مراجعة الجدول أدناه', 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Re-run parsing if the hasHeader choice changes while a file is selected
  useEffect(() => {
    if (selectedFile) {
      parseFile(selectedFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHeader]);

  const handleSave = async () => {
    const validRecords = parsedRecords.filter(r => r.status === 'valid');
    if (validRecords.length === 0) {
      showToast('لا توجد سجلات صالحة للاستيراد', 'error');
      return;
    }

    if (!selectedFile) {
      showToast('يرجى اختيار ملف أولاً', 'error');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('finance_months_periods_id', monthId);
      formData.append('has_header', hasHeader ? '1' : '0');

      const res = await fetch(`${API}/attendances/import-save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
          'Accept-Language': language
        },
        body: formData,
      });

      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
        router.push(`/portal/attendance/${monthId}`);
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = () => {
    // Generate simple sample Excel template matching the 4-column layout exactly
    const templateData = [
      {
        'كود الشركة': 1,
        'كود الموظف': 1001,
        'وقت وتاريخ الحركة': '2026-07-01 08:00:00',
        'نوع الحركة (حضور او انصراف)': 'حضور'
      },
      {
        'كود الشركة': 1,
        'كود الموظف': 1001,
        'وقت وتاريخ الحركة': '2026-07-01 17:00:00',
        'نوع الحركة (حضور او انصراف)': 'انصراف'
      },
      {
        'كود الشركة': 1,
        'كود الموظف': 1002,
        'وقت وتاريخ الحركة': '2026-07-01 08:15:00',
        'نوع الحركة (حضور او انصراف)': 'حضور'
      },
      {
        'كود الشركة': 1,
        'كود الموظف': 1002,
        'وقت وتاريخ الحركة': '2026-07-01 17:05:00',
        'نوع الحركة (حضور او انصراف)': 'انصراف'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'سجل البصمات النموذج');
    
    // Generate buffer and trigger download
    XLSX.writeFile(workbook, 'نموذج_ملف_البصمة.xlsx');
    showToast('تم تحميل ملف النموذج الاسترشادي', 'success');
  };

  const stats = {
    total: parsedRecords.length,
    valid: parsedRecords.filter(r => r.status === 'valid').length,
    outside: parsedRecords.filter(r => r.status === 'outside_period').length,
    notFound: parsedRecords.filter(r => r.status === 'employee_not_found').length,
    duplicate: parsedRecords.filter(r => r.status === 'duplicate').length,
    invalid: parsedRecords.filter(r => r.status === 'invalid_data').length,
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href={`/portal/attendance/${monthId}`} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h2 className="text-2xl font-black text-slate-800">{t('import_fingerprint_title')}</h2>
          </div>
          {financeMonth && (
            <div className="flex items-center gap-3 flex-wrap mr-10">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">
                {t('finance_year')}: {financeMonth.finance_yr}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold">
                {t('month_period')} {financeMonth.start_date_m} — {financeMonth.end_date_m}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={downloadTemplate}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl transition-all duration-300 font-bold flex items-center gap-2 cursor-pointer border border-slate-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {t('download_template')}
        </button>
      </div>

      {/* Main warning alert about ignoring records outside month period */}
      {financeMonth && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-6 flex gap-4 items-start shadow-sm animate-pulse-subtle">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-black text-amber-800 mb-1 text-base">{t('important_note_period_title')}</h4>
            <p className="text-sm text-amber-800 font-medium leading-relaxed">
              {t('import_warning_desc_1')}
              <span className="font-bold underline">{financeMonth.start_date_for_pasma || financeMonth.start_date_m}</span>
              {t('import_warning_desc_2')}
              <span className="font-bold underline">{financeMonth.end_date_for_pasma || financeMonth.end_date_m}</span>
              {t('import_warning_desc_3')}
            </p>
          </div>
        </div>
      )}

      {/* Checkbox option for header row */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6 flex items-center gap-3">
        <input 
          type="checkbox" 
          id="hasHeaderOption" 
          checked={hasHeader} 
          onChange={(e) => setHasHeader(e.target.checked)}
          className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="hasHeaderOption" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
          {t('has_header_option')}
        </label>
      </div>

      {/* Drag & Drop File Upload */}
      <div 
        className={`bg-white rounded-3xl p-10 shadow-sm border-2 border-dashed text-center transition-all duration-300 mb-8 relative overflow-hidden ${dragActive ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300'}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileChange}
          className="hidden" 
        />
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <div>
            <p className="text-base font-black text-slate-800">{t('drag_drop_title')}</p>
            <p className="text-sm text-slate-500 font-bold mt-1">{t('drag_drop_subtitle')}</p>
          </div>
          <button 
            ref={null}
            onClick={() => fileInputRef.current?.click()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-600/30 font-bold transition-all duration-300 cursor-pointer text-sm"
          >
            {t('browse_file')}
          </button>
          <span className="text-xs text-slate-400 font-bold">{t('supported_formats')}</span>
        </div>
      </div>

      {/* Preview Section */}
      {parsedRecords.length > 0 && (
        <div className="animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-xs text-slate-500 font-black uppercase mb-1">{t('total_read')}</p>
              <p className="text-2xl font-black text-slate-600">{stats.total}</p>
            </div>
            <div className="bg-emerald-50/50 p-5 rounded-2xl shadow-sm border border-emerald-100">
              <p className="text-xs text-emerald-600 font-black uppercase mb-1">{t('READY_FOR_IMPORT')}</p>
              <p className="text-2xl font-black text-emerald-700">{stats.valid}</p>
            </div>
            <div className="bg-rose-50/50 p-5 rounded-2xl shadow-sm border border-rose-100">
              <p className="text-xs text-rose-600 font-black uppercase mb-1">{t('outside_period_label')}</p>
              <p className="text-2xl font-black text-rose-700">{stats.outside}</p>
            </div>
            <div className="bg-amber-50/50 p-5 rounded-2xl shadow-sm border border-amber-100">
              <p className="text-xs text-amber-600 font-black uppercase mb-1">{t('unregistered_employees')}</p>
              <p className="text-2xl font-black text-amber-700">{stats.notFound}</p>
            </div>
            <div className="bg-purple-50/50 p-5 rounded-2xl shadow-sm border border-purple-100">
              <p className="text-xs text-purple-600 font-black uppercase mb-1">{t('duplicate_records')}</p>
              <p className="text-2xl font-black text-purple-700">{stats.duplicate}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-xs text-slate-500 font-black uppercase mb-1">{t('invalid_records_label')}</p>
              <p className="text-2xl font-black text-slate-700">{stats.invalid}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-slate-500">{t('preview_raw_fingerprints')}</h3>
            <button
              onClick={handleSave}
              disabled={saving || stats.valid === 0}
              className={`px-8 py-3 rounded-2xl font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all duration-300 ${stats.valid > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-emerald-500/20 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {t('saving_and_importing')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {t('save_and_import_valid').replace('{count}', stats.valid.toString())}
                </>
              )}
            </button>
          </div>

          {/* Preview Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-purple-500"></div>
            <div className="p-6 overflow-x-auto max-h-[500px]">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 font-bold text-xs tracking-wider">#</th>
                    <th className="px-6 py-4 font-bold text-xs tracking-wider">{t('zketo_code_label')}</th>
                    <th className="px-6 py-4 font-bold text-xs tracking-wider">{t('employee_code_system_label')}</th>
                    <th className="px-6 py-4 font-bold text-xs tracking-wider">{t('employee_name_label')}</th>
                    <th className="px-6 py-4 font-bold text-xs tracking-wider">{t('action_date_time_label')}</th>
                    <th className="px-6 py-4 font-bold text-xs tracking-wider">{t('action_type_label')}</th>
                    <th className="px-6 py-4 font-bold text-xs tracking-wider text-center">{t('status_label')}</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRecords.map((item) => (
                    <tr key={item.index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-500">{item.index}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">#{item.zketo_code}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{item.employee_code ? `#${item.employee_code}` : '—'}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{item.employee_name}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{item.action_date_time}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">{item.action_type_name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === 'valid' ? 'bg-emerald-100 text-emerald-700' :
                          item.status === 'outside_period' ? 'bg-rose-100 text-rose-700' :
                          item.status === 'employee_not_found' ? 'bg-amber-100 text-amber-700' :
                          item.status === 'duplicate' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {t(item.status_message)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
