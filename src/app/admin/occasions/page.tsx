'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Occasion } from '@/types';

export default function OccasionsPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    from_date: '',
    to_date: '',
    days_counter: '1',
    active: '1'
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/occasions`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const result = await res.json();
      if (result.status) setData(result.data);
    } catch {
      setMessage({ type: 'error', text: t('fetch_failed') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (type: string, item: Occasion | null = null) => {
    setMessage({ type: '', text: '' });
    setModalType(type);
    if (type === 'edit' && item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        from_date: item.from_date,
        to_date: item.to_date,
        days_counter: item.days_counter.toString(),
        active: item.active.toString()
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', from_date: '', to_date: '', days_counter: '1', active: '1' });
    }
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const url = modalType === 'add' ? `${process.env.NEXT_PUBLIC_API_URL || ''}/occasions` : `${process.env.NEXT_PUBLIC_API_URL || ''}/occasions/${editingId}`;
      const res = await fetch(url, {
        method: modalType === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.status) {
        setShowModal(false);
        fetchData();
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch { setMessage({ type: 'error', text: t('conn_error') }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirm_delete'))) return;
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/occasions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const result = await res.json();
      if (result.status) {
        fetchData();
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch { setMessage({ type: 'error', text: t('conn_error') }); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('occasions')}</h2>
        <button onClick={() => handleOpenModal('add')} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:scale-95">
          {t('add_occasion')}
        </button>
      </div>

      {message.text && !showModal && (
        <div className={`p-4 mb-8 rounded-2xl font-bold shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-purple-500"></div>
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-50 text-slate-700 uppercase font-black border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">{t('occasion_name')}</th>
              <th className="px-6 py-4">{t('start_date')}</th>
              <th className="px-6 py-4">{t('end_date')}</th>
              <th className="px-6 py-4">{t('days_counter')}</th>
              <th className="px-6 py-4">{t('status')}</th>
              <th className="px-6 py-4 text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: Occasion) => (
              <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-black text-slate-900">{item.name}</td>
                <td className="px-6 py-4 text-slate-700 font-bold">{item.from_date}</td>
                <td className="px-6 py-4 text-slate-700 font-bold">{item.to_date}</td>
                <td className="px-6 py-4 text-indigo-600 font-black">{item.days_counter}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${item.active == 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {item.active == 1 ? t('active') : t('inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-center gap-2">
                  <button onClick={() => handleOpenModal('edit', item)} className="text-amber-500 p-2 hover:bg-amber-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mounted && showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-zoom-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-l from-indigo-500 to-purple-500"></div>
            <h3 className="text-2xl font-black text-slate-800 mb-6">{modalType === 'add' ? t('add_occasion') : t('edit_occasion')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-base font-black text-slate-950 mb-2">{t('occasion_name')}</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{t('start_date')}</label>
                  <input type="date" name="from_date" value={formData.from_date} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{t('end_date')}</label>
                  <input type="date" name="to_date" value={formData.to_date} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-base font-black text-slate-950 mb-2">{t('days_counter')}</label>
                <input type="number" name="days_counter" value={formData.days_counter} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-base font-black text-slate-950 mb-2">{t('status')}</label>
                <select name="active" value={formData.active} onChange={handleChange} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm">
                  <option value="1">{t('active')}</option>
                  <option value="0">{t('inactive')}</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black hover:shadow-lg transition-all active:scale-95">{t('save')}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-900 border-2 border-slate-200 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95">{t('cancel')}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
