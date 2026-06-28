'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Employee, Branch, Department, JobCategory } from '@/types';

interface EmployeeListItem extends Omit<Employee, 'job'> {
  branch?: Branch;
  department?: Department;
  job?: JobCategory;
  counterUsed?: number;
}

export default function EmployeesPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [data, setData] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
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
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
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
        <Link 
          href="/admin/employees/create"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t('add_employee')}
        </Link>
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
                  <td className="px-6 py-4 flex items-center justify-center gap-2">
                    <Link href={`/admin/employees/show/${item.id}`} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </Link>
                    <Link href={`/admin/employees/edit/${item.id}`} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </Link>
                    {!(item.counterUsed && item.counterUsed > 0) && (
                      <button onClick={() => handleDelete(item.id!)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
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
    </div>
  );
}
