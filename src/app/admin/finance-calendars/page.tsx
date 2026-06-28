'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { FinanceCalendar, FinanceMonth } from '@/types';

interface FinanceMonthItem extends FinanceMonth {
  year_and_month?: string;
  number_of_days?: number;
}

export default function FinanceCalendarsPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<FinanceCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasOpen, setHasOpen] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Months modal state
  const [showMonthsModal, setShowMonthsModal] = useState(false);
  const [monthsData, setMonthsData] = useState<FinanceMonthItem[]>([]);

  const [formData, setFormData] = useState({
    finance_yr: '',
    finance_yr_desc: '',
    start_date: '',
    end_date: ''
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/finance-calendars`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await res.json();
      if (result.status) {
        setData(result.data);
        setHasOpen(result.has_open);
      }
    } catch {
      showToast(t('fetch_failed'), 'error');
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

  const handleOpenModal = (type: string, item: FinanceCalendar | null = null) => {
    setModalType(type);
    if (type === 'edit' && item) {
      setEditingId(item.id);
      setFormData({
        finance_yr: item.finance_yr.toString(),
        finance_yr_desc: item.finance_yr_desc,
        start_date: item.start_date,
        end_date: item.end_date
      });
    } else {
      setEditingId(null);
      setFormData({
        finance_yr: '',
        finance_yr_desc: '',
        start_date: '',
        end_date: ''
      });
    }
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const url = modalType === 'add'
        ? `${process.env.NEXT_PUBLIC_API_URL || ''}/finance-calendars`
        : `${process.env.NEXT_PUBLIC_API_URL || ''}/finance-calendars/${editingId}`;
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
    } catch {
      showToast(t('conn_error'), 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: t('confirm_delete_title'),
      description: t('confirm_delete_year'),
      icon: 'danger'
    });
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/finance-calendars/${id}`, {
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

  const handleOpenYear = async (id: number) => {
    const isConfirmed = await confirm({
      title: t('open_confirm'),
      description: t('confirm_open_year'),
      icon: 'warning'
    });
    if (!isConfirmed) return;

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/finance-calendars/${id}/open`, {
        method: 'POST',
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

  const handleShowMonths = async (id: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/finance-calendars/${id}/months`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const result = await res.json();
      if (result.status) {
        setMonthsData(result.data);
        setShowMonthsModal(true);
      }
    } catch {
      showToast(t('fetch_failed'), 'error');
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <div className="animate-fade-in-up pb-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('finance_calendars')}</h2>
          </div>
          <button
            onClick={() => handleOpenModal('add')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('add_finance_yr')}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-indigo-500 to-purple-500"></div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">{t('finance_yr')}</th>
                  <th className="px-6 py-4">{t('finance_yr_desc')}</th>
                  <th className="px-6 py-4">{t('start_date')}</th>
                  <th className="px-6 py-4">{t('end_date')}</th>
                  <th className="px-6 py-4">{t('status')}</th>
                  <th className="px-6 py-4">{t('added_by')}</th>
                  <th className="px-6 py-4">{t('updated_by')}</th>
                  <th className="px-6 py-4 text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item: FinanceCalendar) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.finance_yr}</td>
                    <td className="px-6 py-4 text-slate-700 font-bold">{item.finance_yr_desc}</td>
                    <td className="px-6 py-4 text-slate-900 font-bold">{item.start_date}</td>
                    <td className="px-6 py-4 text-slate-900 font-bold">{item.end_date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.is_open === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {item.is_open === 1 ? t('opened') : t('closed')}
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
                          <span className="text-[10px] text-slate-500">{item.updated_at ? new Date(item.updated_at).toLocaleString('ar-EG') : '---'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold italic">{t('not_updated')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-center gap-2">
                      <button onClick={() => handleShowMonths(item.id)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title={t('finance_months')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </button>
                      {item.is_open === 0 && (
                        <>
                          <button onClick={() => handleOpenModal('edit', item)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title={t('edit_finance_yr')}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title={t('delete_finance_yr')}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                          {!hasOpen && (
                            <button onClick={() => handleOpenYear(item.id)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title={t('open_finance_yr')}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {mounted && showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-zoom-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <h3 className="text-2xl font-black text-slate-800 mb-6">{modalType === 'add' ? t('add_finance_yr') : t('edit_finance_yr')}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-base font-black text-slate-950 mb-2">{t('finance_yr')}</label>
                <input type="number" name="finance_yr" value={formData.finance_yr} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-base font-black text-slate-950 mb-2">{t('finance_yr_desc')}</label>
                <input type="text" name="finance_yr_desc" value={formData.finance_yr_desc} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{t('start_date')}</label>
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-base font-black text-slate-950 mb-2">{t('end_date')}</label>
                  <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-950 font-black shadow-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" />
                </div>
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

      {/* Months Modal */}
      {mounted && showMonthsModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-zoom-in relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{t('finance_months')}</h3>
              <button onClick={() => setShowMonthsModal(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1 p-4">
              <table className="w-full text-sm text-right">
                <thead className="bg-slate-50 text-slate-700 uppercase border-b border-slate-100 sticky top-0">
                  <tr>
                    <th className="px-6 py-4">{t('month')} (Year & Month)</th>
                    <th className="px-6 py-4">{t('start_date')}</th>
                    <th className="px-6 py-4">{t('end_date')}</th>
                    <th className="px-6 py-4 text-center">{t('days')}</th>
                  </tr>
                </thead>
                <tbody>
                  {monthsData.map((month: FinanceMonthItem) => (
                    <tr key={month.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-black text-indigo-600" dir="ltr">{month.year_and_month}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{month.start_date_m}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{month.end_date_m}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-slate-100 text-slate-900 rounded-lg font-black">{month.number_of_days}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button onClick={() => setShowMonthsModal(false)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                {t('close')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
