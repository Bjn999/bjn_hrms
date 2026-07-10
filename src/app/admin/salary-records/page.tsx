'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { FinanceMonth, FinanceCalendar } from '@/types';

interface SalaryRecordMonth extends FinanceMonth {
  start_date_for_pasma?: string;
  end_date_for_pasma?: string;
  number_of_days?: number;
  currentYear?: {
    is_open: number;
  };
  counterOpenMonth?: number;
  counterPreviousMonthWaitingOpen?: number;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || '';

const MONTHS_AR: Record<number, string> = {
  1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
  5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
  9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
};

export default function SalaryRecordsPage() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [data, setData] = useState<SalaryRecordMonth[]>([]);
  const [financeYears, setFinanceYears] = useState<FinanceCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  // Modal State
  const [openMonthModal, setOpenMonthModal] = useState<number | null>(null);
  const [pasmaDates, setPasmaDates] = useState({ start: '', end: '' });
  const [loadingPasma, setLoadingPasma] = useState(false);

  const token = () => localStorage.getItem('admin_token');
  const headers = { 'Authorization': `Bearer ${token()}`, 'Accept': 'application/json' };

  const fetchData = async (currentPage = 1, year = filterYear) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage.toString() });
      if (year) params.append('finance_yr', year);

      const res = await fetch(`${API}/salary-records?${params.toString()}`, { headers });
      const result = await res.json();
      if (result.status) {
        setData(result.data || []);
        setFinanceYears(result.finance_years || []);
        setPagination(result.pagination);
        if (result.active_year && !filterYear) setFilterYear(result.active_year);
      }
    } catch {
      showToast(t('conn_error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(page, filterYear);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterYear]);

  const getRowAction = (item: SalaryRecordMonth) => {
    const yearIsOpen = item.currentYear?.is_open == 1;
    const noOtherMonthOpen = item.counterOpenMonth === 0;
    const noPreviousPending = item.counterPreviousMonthWaitingOpen === 0;

    if (item.is_open == 2) return 'archived';
    if (item.is_open == 1) return 'view';
    if (item.is_open == 0 && yearIsOpen && noOtherMonthOpen && noPreviousPending) return 'open';
    return 'pending';
  };

  const handleOpenMonthClick = async (id: number) => {
    setOpenMonthModal(id);
    setLoadingPasma(true);
    try {
      const res = await fetch(`${API}/salary-records/pasma-dates/${id}`, { headers });
      const result = await res.json();
      if (result.status) {
        setPasmaDates({
          start: result.start_date_for_pasma || '',
          end: result.end_date_for_pasma || ''
        });
      }
    } catch {
      showToast(t('fetch_fingerprint_dates_error'), 'error');
    } finally {
      setLoadingPasma(false);
    }
  };

  const submitOpenMonth = async () => {
    if (!openMonthModal) return;
    if (!pasmaDates.start || !pasmaDates.end) {
      showToast(t('select_fingerprint_dates_error'), 'error');
      return;
    }
    try {
      const res = await fetch(`${API}/salary-records/open-month/${openMonthModal}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date_for_pasma: pasmaDates.start,
          end_date_for_pasma: pasmaDates.end
        })
      });
      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
        setOpenMonthModal(null);
        fetchData(page, filterYear);
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('open_month_error'), 'error');
    }
  };

  const handleCloseMonth = async (id: number) => {
    if (!confirm(t('close_month_confirm'))) return;
    try {
      const res = await fetch(`${API}/salary-records/close-month/${id}`, { method: 'POST', headers });
      const result = await res.json();
      if (result.status) {
        showToast(result.message, 'success');
        fetchData(page, filterYear);
      } else {
        showToast(result.message, 'error');
      }
    } catch {
      showToast(t('conn_error'), 'error');
    }
  };

  if (loading && !data.length) return <LoadingScreen />;

  return (
    <div className="animate-fade-in-up pb-10">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('salary_records_title')}</h2>
          <p className="text-slate-500 mt-1 text-sm">{t('salary_records_desc')}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">{t('finance_year')}</label>
            <select
              value={filterYear}
              onChange={e => { setFilterYear(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold focus:ring-2 focus:ring-violet-500/20 transition-all min-w-[200px]"
            >
              {financeYears.map((y: FinanceCalendar) => (
                <option key={y.finance_yr} value={y.finance_yr}>{y.finance_yr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-violet-500 to-purple-600"></div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">{t('month_name_ar')}</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">{t('start_date_label')}</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">{t('end_date_label')}</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">{t('start_fingerprint')}</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">{t('end_fingerprint')}</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">{t('days_number')}</th>
                <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider">{t('month_status')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: SalaryRecordMonth) => {
                const action = getRowAction(item);
                return (
                  <tr key={item.id} className={`border-b border-slate-50 transition-colors ${item.is_open == 2 ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-5 py-4 font-bold text-slate-800">{item.month_id !== undefined ? MONTHS_AR[item.month_id] : ''}</td>
                    <td className="px-5 py-4 text-slate-600">{item.start_date_m}</td>
                    <td className="px-5 py-4 text-slate-600">{item.end_date_m}</td>
                    <td className="px-5 py-4 text-slate-600">{item.start_date_for_pasma}</td>
                    <td className="px-5 py-4 text-slate-600">{item.end_date_for_pasma}</td>
                    <td className="px-5 py-4 text-slate-700 font-bold">{item.number_of_days}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {action === 'view' && (
                          <>
                            <span className="font-bold text-emerald-600">{t('month_open')}</span>
                            <button onClick={() => handleCloseMonth(item.id)} className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg transition-colors font-bold text-xs">{t('close')}</button>
                          </>
                        )}
                        {action === 'open' && (
                          <>
                            <span className="font-bold text-slate-500">{t('month_waiting_open')}</span>
                            <button onClick={() => handleOpenMonthClick(item.id)} className="px-3 py-1.5 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg transition-colors font-bold text-xs">{t('open')}</button>
                          </>
                        )}
                        {action === 'archived' && (
                          <span className="font-bold text-rose-600">{t('is_archived')}</span>
                        )}
                        {action === 'pending' && (
                          <span className="font-bold text-slate-500">{t('month_waiting_open')}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-slate-500 font-bold">{t('no_months_found')}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {t('showing')} {data.length} {t('of')} {pagination.total} {pagination.total === 1 ? t('record') : t('records')}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              {[...Array(pagination.last_page)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${page === i + 1 ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                disabled={page === pagination.last_page}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Open Month Modal */}
      {openMonthModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative z-[1000]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">{t('open_month_title')}</h3>
              <button onClick={() => setOpenMonthModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {loadingPasma ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('start_fingerprint_date')}</label>
                    <input
                      type="date"
                      value={pasmaDates.start}
                      onChange={e => setPasmaDates(s => ({ ...s, start: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('end_fingerprint_date')}</label>
                    <input
                      type="date"
                      value={pasmaDates.end}
                      onChange={e => setPasmaDates(s => ({ ...s, end: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={submitOpenMonth}
                disabled={loadingPasma || !pasmaDates.start || !pasmaDates.end}
                className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {t('open_month_btn')}
              </button>
              <button
                onClick={() => setOpenMonthModal(null)}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >{t('cancel')}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
