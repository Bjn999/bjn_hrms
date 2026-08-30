'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

import { PermissionItem, RoleItem, PermissionDef, ModuleGroup } from '@/types';

import { PERMISSION_MODULES } from '@/constants/permissions';

export default function RolesPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [dbPermissions, setDbPermissions] = useState<PermissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDisplayName, setRoleDisplayName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Accept-Language': language
      };

      const [rolesRes, permRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/roles`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/permissions`, { headers })
      ]);

      const rolesData = await rolesRes.json();
      const permData = await permRes.json();

      if (rolesData.status) setRoles(rolesData.data);
      if (permData.status) setDbPermissions(permData.data);
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Quick lookup helper for permission metadata
  const permissionMetaMap = useMemo(() => {
    const map = new Map<string, { label: string; desc: string; moduleTitle: string; isReadOnly?: boolean }>();
    PERMISSION_MODULES.forEach((mod) => {
      mod.permissions.forEach((p) => {
        map.set(p.key, {
          label: language === 'ar' ? p.labelAr : p.labelEn,
          desc: language === 'ar' ? p.descAr : p.descEn,
          moduleTitle: language === 'ar' ? mod.titleAr : mod.titleEn,
          isReadOnly: p.isReadOnly
        });
      });
    });
    return map;
  }, [language]);

  const getPermissionLabel = (permKey: string) => {
    const meta = permissionMetaMap.get(permKey);
    return meta ? meta.label : permKey;
  };

  const handleOpenModal = (role?: RoleItem) => {
    setSearchQuery('');
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      setRoleDisplayName(role.display_name || '');
      setSelectedPermissions(role.permissions.map(p => p.name));
    } else {
      setEditingRole(null);
      setRoleName('');
      setRoleDisplayName('');
      setSelectedPermissions([]);
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permKey: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permKey) ? prev.filter(p => p !== permKey) : [...prev, permKey]
    );
  };

  const handleToggleModulePermissions = (modulePermKeys: string[]) => {
    const allSelected = modulePermKeys.every(key => selectedPermissions.includes(key));
    if (allSelected) {
      // Remove all permissions of this module
      setSelectedPermissions(prev => prev.filter(key => !modulePermKeys.includes(key)));
    } else {
      // Add all missing permissions of this module
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...modulePermKeys])));
    }
  };

  const handleSelectAll = () => {
    const allKeys = PERMISSION_MODULES.flatMap(m => m.permissions.map(p => p.key));
    setSelectedPermissions(allKeys);
  };

  const handleDeselectAll = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim() || !roleDisplayName.trim()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const url = editingRole
        ? `${process.env.NEXT_PUBLIC_API_URL || ''}/admin/roles/${editingRole.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || ''}/admin/roles`;

      const method = editingRole ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': language
        },
        body: JSON.stringify({
          name: roleName,
          display_name: roleDisplayName,
          permissions: selectedPermissions
        })
      });

      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      description: language === 'ar' ? 'هل أنت متأكد من حذف هذا الدور؟' : 'Are you sure you want to delete this role?',
      icon: 'danger'
    });

    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/admin/roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Accept-Language': language
        }
      });
      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
        fetchData();
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    }
  };

  // Filter modules and permissions based on search query inside Modal
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return PERMISSION_MODULES;
    const q = searchQuery.toLowerCase();

    return PERMISSION_MODULES.map(mod => {
      const matchingPerms = mod.permissions.filter(p =>
        p.key.toLowerCase().includes(q) ||
        p.labelAr.toLowerCase().includes(q) ||
        p.labelEn.toLowerCase().includes(q) ||
        p.descAr.toLowerCase().includes(q) ||
        p.descEn.toLowerCase().includes(q)
      );

      return {
        ...mod,
        permissions: matchingPerms
      };
    }).filter(mod => mod.permissions.length > 0);
  }, [searchQuery]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {language === 'ar' ? 'إدارة الأدوار والصلاحيات' : 'Roles & Access Control'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {language === 'ar'
                ? 'تخصيص مستويات وصول الموظفين للشاشات والموديولات مع دعم الصلاحيات المقروءة والصلاحيات للعرض فقط'
                : 'Configure employee roles, module access levels, and granular read-only vs edit permissions'}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{language === 'ar' ? 'إضافة دور / مسمى جديد' : 'Create New Role'}</span>
        </button>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const grantedCount = role.permissions?.length || 0;
          return (
            <div
              key={role.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{role.display_name || role.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {role.name} • {grantedCount} {language === 'ar' ? 'صلاحية ممنوحة' : 'Permissions granted'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(role)}
                      title={language === 'ar' ? 'تعديل الصلاحيات' : 'Edit Role'}
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      title={language === 'ar' ? 'حذف الدور' : 'Delete Role'}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {language === 'ar' ? 'قائمة الصلاحيات:' : 'Assigned Permissions:'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((p) => {
                        const meta = permissionMetaMap.get(p.name);
                        return (
                          <span
                            key={p.id}
                            className={`px-2.5 py-1 text-xs rounded-xl font-medium border flex items-center gap-1 ${
                              meta?.isReadOnly
                                ? 'bg-amber-50 border-amber-200 text-amber-900'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            {meta?.isReadOnly && (
                              <span title={language === 'ar' ? 'صلاحية قراءة فقط' : 'Read Only'}>👁️</span>
                            )}
                            <span>{getPermissionLabel(p.name)}</span>
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {language === 'ar' ? 'لا توجد صلاحيات مخصصة بهذا الدور' : 'No permissions assigned yet'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400 border-t border-slate-100 pt-3 flex justify-between items-center">
                <span>{language === 'ar' ? 'إجمالي الصلاحيات:' : 'Total Assigned:'}</span>
                <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                  {grantedCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {roles.length === 0 && (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 space-y-3">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-slate-600 font-bold text-lg">
            {language === 'ar' ? 'لم يتم إضافة أي أدوار أو مسميات وظيفية بعد' : 'No roles created yet'}
          </p>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {language === 'ar'
              ? 'قم بإضافة مسمى وظيفي جديد (مثل: محاسب، مدير موارد بشرية) وتحديد الصلاحيات المتاحة له'
              : 'Click Add New Role to define employee roles and assign permissions'}
          </p>
        </div>
      )}

      {/* Permissions Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingRole
                      ? (language === 'ar' ? `تعديل الدور: ${editingRole.name}` : `Edit Role: ${editingRole.name}`)
                      : (language === 'ar' ? 'إضافة دور جديد وتعيين الصلاحيات' : 'Create New Role')}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === 'ar'
                      ? 'حدد اسم الدور والصلاحيات الممنوحة مقسمة بحسب الموديولات'
                      : 'Define role name and select granted permissions grouped by module'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              
              {/* Role Name Input & Quick Toolbar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {language === 'ar' ? 'اسم الدور الإنجليزي (برمجي)' : 'Role Key (English)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. hr_manager"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {language === 'ar' ? 'اسم الدور الظاهر (عربي)' : 'Display Name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roleDisplayName}
                    onChange={(e) => setRoleDisplayName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: مسؤول موارد بشرية' : 'e.g. HR Manager'}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800 text-sm shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {language === 'ar' ? 'البحث عن صلاحية...' : 'Search Permission...'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب اسم الصلاحية أو الموديول...' : 'Search by name or keyword...'}
                      className="w-full px-4 py-2.5 pr-9 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-800 text-sm shadow-sm"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute rtl:left-3 ltr:right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Global Selection Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/60 px-4 py-3 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-indigo-900">
                    {language === 'ar' ? 'إجمالي الصلاحيات المختارة:' : 'Selected Total:'}
                  </span>
                  <span className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-sm">
                    {selectedPermissions.length} {language === 'ar' ? 'صلاحية' : 'permissions'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{language === 'ar' ? 'تحديد كافة الصلاحيات' : 'Select All Permissions'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{language === 'ar' ? 'إلغاء تحديد الكل' : 'Deselect All'}</span>
                  </button>
                </div>
              </div>

              {/* Grouped Modules List */}
              <div className="space-y-6">
                {filteredModules.map((module) => {
                  const moduleKeys = module.permissions.map(p => p.key);
                  const selectedInModule = moduleKeys.filter(k => selectedPermissions.includes(k));
                  const isAllModuleSelected = moduleKeys.length > 0 && selectedInModule.length === moduleKeys.length;

                  return (
                    <div
                      key={module.id}
                      className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:border-slate-300"
                    >
                      {/* Module Section Header */}
                      <div className={`px-5 py-4 flex items-center justify-between border-b border-slate-100 ${module.colorClass}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-slate-800">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={module.icon} />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base">
                              {language === 'ar' ? module.titleAr : module.titleEn}
                            </h3>
                            <span className="text-xs opacity-80 font-medium">
                              {selectedInModule.length} من {moduleKeys.length} {language === 'ar' ? 'محددة' : 'selected'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleModulePermissions(moduleKeys)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shadow-sm ${
                            isAllModuleSelected
                              ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                              : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
                          }`}
                        >
                          {isAllModuleSelected
                            ? (language === 'ar' ? 'إلغاء الموديول' : 'Deselect Module')
                            : (language === 'ar' ? 'تحديد الكل في الموديول' : 'Select All in Module')}
                        </button>
                      </div>

                      {/* Permissions Grid inside Module */}
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/30">
                        {module.permissions.map((perm) => {
                          const isSelected = selectedPermissions.includes(perm.key);
                          return (
                            <div
                              key={perm.key}
                              onClick={() => handleTogglePermission(perm.key)}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 relative group ${
                                isSelected
                                  ? 'bg-indigo-50/70 border-indigo-400 text-indigo-950 shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              {/* Checkbox Icon */}
                              <div
                                className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                    : 'border-slate-300 bg-white group-hover:border-slate-400'
                                }`}
                              >
                                {isSelected && (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>

                              {/* Permission Text & Metadata */}
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-black text-slate-900 leading-snug">
                                    {language === 'ar' ? perm.labelAr : perm.labelEn}
                                  </span>

                                  {perm.isReadOnly && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-lg shrink-0 flex items-center gap-1 border border-amber-200/80">
                                      <span>👁️</span>
                                      <span>{language === 'ar' ? 'عرض فقط' : 'Read Only'}</span>
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-slate-500 leading-relaxed">
                                  {language === 'ar' ? perm.descAr : perm.descEn}
                                </p>

                                <p className="text-[10px] font-mono text-slate-400 pt-0.5">
                                  Key: {perm.key}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredModules.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-slate-500 font-bold">
                      {language === 'ar' ? 'لم يتم العثور على أي صلاحيات تطابق البحث' : 'No permissions match your search query'}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 bg-white sticky bottom-0 z-10 py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-2xl font-bold transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {saving
                    ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                    : (language === 'ar' ? 'حفظ الصلاحيات والدور' : 'Save Role Permissions')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
