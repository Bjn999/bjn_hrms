'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('overview')}</h2>
          <p className="text-slate-500 mt-1">{t('welcome')}</p>
        </div>
        <div className="hidden sm:block">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">{t('system_online')}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row (Mock) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: t('total_employees'), value: '1,248', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'indigo' },
          { title: t('current_month_salaries'), value: '$84,520', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'emerald' },
          { title: t('pending_leave_requests'), value: '12', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'amber' },
          { title: t('absences_today'), value: '5', icon: 'M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z M21 12h-6', color: 'rose' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute rtl:-left-4 ltr:-right-4 -top-4 w-24 h-24 bg-${stat.color}-500/10 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 text-${stat.color}-500 flex items-center justify-center`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
        <div className="border-2 border-dashed border-slate-200 rounded-xl h-64 flex flex-col items-center justify-center bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <p className="text-xl font-medium text-slate-500">{t('charts_under_dev')}</p>
        </div>
      </div>
    </div>
  );
}




