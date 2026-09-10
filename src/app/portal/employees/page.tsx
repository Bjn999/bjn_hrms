'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Employee, Branch, Department, JobCategory } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';

interface EmployeeListItem extends Omit<Employee, 'job'> {
  branch?: Branch;
  department?: Department;
  job?: JobCategory;
  counterUsed?: number;
  user?: {
    employee_id: number;
    username?: string;
    email?: string;
    is_active: number;
    roles?: { id: number; name: string; display_name: string }[];
  };
}

export default function EmployeesPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { hasPermission } = usePermissions();
  
  const [data, setData] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCredsUser, setActiveCredsUser] = useState<{
    empName: string;
    username: string;
    email: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const adminUserStr = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
  const currentEmployeeId = adminUserStr ? JSON.parse(adminUserStr)?.employee_id : null;

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        , 
          'Accept-Language': language
        }
      });
      const result = await res.json();
      if (result.status) {
        setData(result.data || []);
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

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: t('confirm_delete'),
      description: 'هل انت متأكد من حذف هذا الموظف؟',
      icon: 'danger'
    });
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        , 
          'Accept-Language': language
        }
      });
      const result = await res.json();
      if (result.status) {
        fetchData();
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    }
  };

  const handleToggleLogin = async (id: number) => {
    const isConfirmed = await confirm({
      title: language === 'ar' ? 'تأكيد التغيير' : 'Confirm Change',
      description: language === 'ar' ? 'هل أنت متأكد من تغيير حالة حساب الموظف؟' : 'Are you sure you want to change the status of this account?',
      icon: 'warning'
    });
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/employees/${id}/toggle-login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': language
        }
      });
      const result = await res.json();
      if (result.status) {
        fetchData();
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    }
  };

  if (loading && data.length === 0) return <LoadingScreen />;

  const filteredEmployees = data.filter((item: EmployeeListItem) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const empName = item.emp_name?.toLowerCase() || '';
    const empCode = item.employee_code?.toString() || '';
    const branchName = item.branch?.name?.toLowerCase() || '';
    const deptName = item.department?.name?.toLowerCase() || '';
    const jobName = item.job?.name?.toLowerCase() || '';
    const statusLabel = item.functional_status == 1 ? t('functional_status_in').toLowerCase() : t('functional_status_out').toLowerCase();
    
    return empName.includes(query) || empCode.includes(query) || branchName.includes(query) || deptName.includes(query) || jobName.includes(query) || statusLabel.includes(query);
  });

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('employees_list')}</h2>
        </div>
        {hasPermission('create_employees') && (
          <Link 
            href="/portal/employees/create"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('add_employee')}
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder_comprehensive')}
            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-bold transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-purple-500"></div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">{t('employee_code')}</th>
                <th className="px-6 py-4">{t('employee_name')}</th>
                <th className="px-6 py-4">{t('branch')}</th>
                <th className="px-6 py-4">{t('department')}</th>
                <th className="px-6 py-4">{t('job_category')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4">{language === 'ar' ? 'حساب الدخول' : 'Login Account'}</th>
                <th className="px-6 py-4 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((item: EmployeeListItem) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-600">#{item.employee_code}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{item.emp_name}</td>
                  <td className="px-6 py-4 text-slate-600">{item.branch?.name}</td>
                  <td className="px-6 py-4 text-slate-600">{item.department?.name}</td>
                  <td className="px-6 py-4 text-slate-600">{item.job?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.functional_status == 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {item.functional_status == 1 ? t('functional_status_in') : t('functional_status_out')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.user ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold w-fit ${item.user.is_active == 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {item.user.is_active == 1 ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCredsUser({
                                empName: item.emp_name,
                                username: item.user?.username || '',
                                email: item.user?.email || item.emp_email || ''
                              });
                              setShowPassword(false);
                            }}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title={language === 'ar' ? 'عرض بيانات الدخول (اسم المستخدم وكلمة المرور)' : 'View Login Credentials'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                          </button>
                        </div>
                        {item.user.roles && item.user.roles.length > 0 && (
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                            {item.user.roles[0].display_name}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">{language === 'ar' ? 'لا يوجد' : 'None'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center gap-2">
                    {item.user && hasPermission('toggle_employee_login') && (
                      <button onClick={() => handleToggleLogin(item.id!)} className={`p-2 rounded-lg transition-colors ${item.user.is_active == 1 ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`} title={item.user.is_active == 1 ? (language === 'ar' ? 'تعطيل الحساب' : 'Deactivate') : (language === 'ar' ? 'تفعيل الحساب' : 'Activate')}>
                        {item.user.is_active == 1 ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                        )}
                      </button>
                    )}
                    <Link href={`/portal/employees/show/${item.id}`} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title={language === 'ar' ? 'عرض الملف' : 'View Profile'}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </Link>
                    {hasPermission('edit_employees') && (
                      <Link href={`/portal/employees/edit/${item.id}`} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title={language === 'ar' ? 'تعديل البيانات' : 'Edit'}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                    )}
                    {hasPermission('delete_employees') && item.id !== currentEmployeeId && !(item.counterUsed && item.counterUsed > 0) && (
                      <button onClick={() => handleDelete(item.id!)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title={language === 'ar' ? 'حذف الموظف' : 'Delete'}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <p className="text-slate-500 font-bold">{t('no_employees_found')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Credentials Popover/Modal */}
      {activeCredsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setActiveCredsUser(null)}
              className="absolute top-5 left-5 text-slate-400 hover:text-slate-600 font-bold transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {language === 'ar' ? 'بيانات دخول الموظف' : 'Employee Login Credentials'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{activeCredsUser.empName}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 mb-0.5">{language === 'ar' ? 'اسم المستخدم' : 'Username'}</span>
                  <span className="font-mono font-bold text-slate-800">{activeCredsUser.username || '-'}</span>
                </div>
                {activeCredsUser.username && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeCredsUser.username);
                      showToast(language === 'ar' ? 'تم نسخ اسم المستخدم' : 'Username copied', 'success');
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors"
                    title={language === 'ar' ? 'نسخ' : 'Copy'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="block text-xs font-bold text-slate-400 mb-0.5">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                <span className="font-bold text-slate-800 break-all">{activeCredsUser.email || (language === 'ar' ? 'غير مسجل' : 'Not registered')}</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-400 mb-0.5">{language === 'ar' ? 'كلمة المرور الافتراضية' : 'Default Password'}</span>
                  <span className="font-mono font-bold text-slate-800 tracking-wider">
                    {showPassword ? '12345678' : '••••••••'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors"
                  title={showPassword ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.046 10.046 0 012.122-.387c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveCredsUser(null)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
