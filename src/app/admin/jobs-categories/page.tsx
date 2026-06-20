'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function JobsCategoriesPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    active: '1'
  });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('http://localhost:8000/api/admin/jobs-categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await res.json();
      if (result.status) {
        setData(result.data);
      }
    } catch (e) {
      showToast(t('fetch_failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type: string, item: any = null) => {
    setModalType(type);
    if (type === 'edit' && item) {
      setEditingId(item.id);
      setEditingItem(item);
      setFormData({
        name: item.name,
        active: item.active.toString()
      });
    } else {
      setEditingId(null);
      setEditingItem(null);
      setFormData({
        name: '',
        active: '1'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const url = modalType === 'add' 
        ? 'http://localhost:8000/api/admin/jobs-categories' 
        : `http://localhost:8000/api/admin/jobs-categories/${editingId}`;
      const method = modalType === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      if (result.status) {
        setShowModal(false);
        fetchData();
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (e) {
      showToast(t('conn_error'), 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: t('confirm_delete'),
      description: 'هل أنت متأكد من رغبتك في حذف هذه الفئة الوظيفية؟',
      icon: 'danger'
    });
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`http://localhost:8000/api/admin/jobs-categories/${id}`, {
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
    } catch (e) {
      showToast(t('conn_error'), 'error');
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <div className="animate-fade-in-up pb-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('jobs_categories')}</h2>
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('add_job_category')}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-purple-500"></div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">{t('job_category_name')}</th>
                  <th className="px-6 py-4">{t('status')}</th>
                  <th className="px-6 py-4">{t('added_by')}</th>
                  <th className="px-6 py-4">{t('updated_by')}</th>
                  <th className="px-6 py-4 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.active == 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.active == 1 ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-indigo-600 text-xs font-black">{item.added?.name || '---'}</span>
                        <span className="text-[10px] text-slate-500">{item.created_at ? new Date(item.created_at).toLocaleString('ar-EG') : '---'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium whitespace-nowrap">
                      {item.updatedby ? (
                        <div className="flex flex-col">
                          <span className="text-amber-600 text-xs font-black">{item.updatedby.name}</span>
                          <span className="text-[10px] text-slate-500">{new Date(item.updated_at).toLocaleString('ar-EG')}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold italic">{t('not_updated')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal('edit', item)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      {!(item.counterUsed > 0) && (
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {mounted && showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-zoom-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <h3 className="text-2xl font-black text-slate-800 mb-6">{modalType === 'add' ? t('add_job_category') : t('edit_job_category')}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-base font-black text-slate-950 mb-2">{t('job_category_name')}</label>
                <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-base font-black text-slate-950 mb-2">{t('status')}</label>
                <select 
                  name="active" 
                  value={formData.active} 
                  onChange={(e) => setFormData({...formData, active: e.target.value})} 
                  disabled={modalType === 'edit' && editingItem?.counterUsed > 0}
                  className={`w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all ${modalType === 'edit' && editingItem?.counterUsed > 0 ? 'bg-slate-50 cursor-not-allowed opacity-70' : ''}`}
                >
                  <option value="1">{t('active')}</option>
                  <option value="0">{t('inactive')}</option>
                </select>
                {modalType === 'edit' && editingItem?.counterUsed > 0 && (
                  <p className="mt-2 text-rose-600 text-xs font-bold flex items-center gap-1 text-right">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    لا يمكن تعطيله لأنه مستخدم في بيانات أحد الموظفين
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all active:scale-95">{t('save')}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-900 border-2 border-slate-200 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95">{t('cancel')}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
