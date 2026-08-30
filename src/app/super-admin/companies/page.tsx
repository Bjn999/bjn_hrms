'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

export default function CompaniesPage() {
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    company_code: '',
    domain: '',
    is_active: 1,
    admin_name: '',
    auth_username: '',
    admin_email: '',
    admin_password: '',
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      if (data.status) {
        setCompanies(data.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      showToast(language === 'ar' ? 'خطأ في جلب الشركات' : 'Error fetching companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      company_name: '',
      company_code: '',
      domain: '',
      is_active: 1,
      admin_name: '',
      auth_username: '',
      admin_email: '',
      admin_password: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (company: any) => {
    setEditingId(company.id);
    setFormData({
      company_name: company.company_name || '',
      company_code: company.company_code || '',
      domain: company.domain || '',
      is_active: company.is_active ? 1 : 0,
      admin_name: '', // Not used in edit
      auth_username: '', // Not used in edit
      admin_email: '', // Not used in edit
      admin_password: '', // Not used in edit
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/companies/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/companies`;
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();

      if (res.ok && data.status) {
        showToast(data.message || (language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully'), 'success');
        closeModal();
        fetchCompanies();
      } else {
        const errorMsg = data.message || (language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving data');
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error saving company:', error);
      showToast(language === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{language === 'ar' ? 'إدارة الشركات' : 'Companies Management'}</h1>
          <p className="text-slate-400">{language === 'ar' ? 'عرض وإدارة الشركات المشتركة في النظام.' : 'View and manage system tenants.'}</p>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          {language === 'ar' ? 'إضافة شركة' : 'Add Company'}
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-sm border-b border-slate-700">
                <th className={`px-6 py-4 font-medium ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'اسم الشركة' : 'Company Name'}</th>
                <th className={`px-6 py-4 font-medium ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'كود الشركة' : 'Company Code'}</th>
                <th className={`px-6 py-4 font-medium ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'النطاق' : 'Domain'}</th>
                <th className={`px-6 py-4 font-medium ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'تاريخ الإضافة' : 'Date Added'}</th>
                <th className={`px-6 py-4 font-medium ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className={`px-6 py-4 font-medium ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    <span className="inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></span>
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 mb-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      {language === 'ar' ? 'لا توجد شركات حالياً' : 'No companies found'}
                    </div>
                  </td>
                </tr>
              ) : (
                companies.map((company, i) => (
                  <tr key={i} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                          {company.company_name?.charAt(0)}
                        </div>
                        <span className="font-medium text-white">{company.company_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{company.company_code}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {company.domain ? (
                        <span className="bg-slate-700 px-2.5 py-1 rounded-md text-xs font-mono text-slate-300">{company.domain}</span>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{new Date(company.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${company.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {company.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => openEditModal(company)} className="text-slate-400 hover:text-blue-400 transition-colors p-2 hover:bg-slate-700 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? (language === 'ar' ? 'تعديل شركة' : 'Edit Company') : (language === 'ar' ? 'إضافة شركة جديدة' : 'Add New Company')}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-4 pb-2 border-b border-slate-700/50">
                  {language === 'ar' ? 'بيانات الشركة' : 'Company Details'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{language === 'ar' ? 'اسم الشركة *' : 'Company Name *'}</label>
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{language === 'ar' ? 'النطاق (Domain)' : 'Domain'}</label>
                    <input
                      type="text"
                      value={formData.domain}
                      onChange={(e) => setFormData({...formData, domain: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g. company.example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{language === 'ar' ? 'حالة الشركة' : 'Company Status'}</label>
                    <select
                      value={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: parseInt(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value={1}>{language === 'ar' ? 'نشط' : 'Active'}</option>
                      <option value={0}>{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Admin Information (Only on Create) */}
              {!editingId && (
                <div>
                  <h3 className="text-lg font-semibold text-emerald-400 mb-4 pb-2 border-b border-slate-700/50 mt-4">
                    {language === 'ar' ? 'بيانات مدير الشركة (Admin)' : 'Company Admin Details'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">{language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}</label>
                      <input
                        type="text"
                        required={!editingId}
                        value={formData.admin_name}
                        onChange={(e) => setFormData({...formData, admin_name: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">{language === 'ar' ? 'اسم المستخدم (للدخول) *' : 'Username (for login) *'}</label>
                      <input
                        type="text"
                        required={!editingId}
                        value={formData.auth_username}
                        onChange={(e) => setFormData({...formData, auth_username: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">{language === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}</label>
                      <input
                        type="email"
                        required={!editingId}
                        value={formData.admin_email}
                        onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">{language === 'ar' ? 'كلمة المرور *' : 'Password *'}</label>
                      <input
                        type="password"
                        required={!editingId}
                        minLength={6}
                        value={formData.admin_password}
                        onChange={(e) => setFormData({...formData, admin_password: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-blue-300 flex items-start gap-2">
                      <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {language === 'ar' 
                        ? 'سيتم إنشاء حساب مدير لهذه الشركة بهذه البيانات، وسيتم إنشاء نظام حضور وانصراف (Area) لها في BioTime تلقائياً.' 
                        : 'An admin account will be created with these credentials, and a corresponding BioTime Area will be created automatically.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-700">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  {language === 'ar' ? 'حفظ البيانات' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
