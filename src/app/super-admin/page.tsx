'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function SuperAdminDashboard() {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [stats, setStats] = useState({ total_companies: 0, active_users: 0, chart_data: [] });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/super-admin/dashboard?period=${period}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const result = await res.json();
        if (result.status) {
          setStats(result.data);
        }
      } catch (error) {
        showToast(language === 'ar' ? 'حدث خطأ أثناء جلب الإحصائيات' : 'Failed to fetch statistics', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [language, showToast, period]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {language === 'ar' ? 'لوحة التحكم الرئيسية' : 'Super Admin Dashboard'}
        </h1>
        <p className="text-slate-400">
          {language === 'ar' ? 'مرحباً بك في إدارة المنصة المركزية.' : 'Welcome to the central platform management.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">{language === 'ar' ? 'إجمالي الشركات' : 'Total Companies'}</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {loading ? (
              <span className="inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></span>
            ) : (
              stats.total_companies
            )}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">{language === 'ar' ? 'المستخدمين النشطين' : 'Active Users'}</h3>
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {loading ? (
              <span className="inline-block w-8 h-8 border-4 border-slate-600 border-t-green-500 rounded-full animate-spin"></span>
            ) : (
              stats.active_users
            )}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {language === 'ar' ? 'إحصائيات انضمام الشركات' : 'Company Onboarding Statistics'}
          </h2>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value={30}>{language === 'ar' ? 'آخر 30 يوم' : 'Last 30 Days'}</option>
            <option value={90}>{language === 'ar' ? 'آخر 3 أشهر' : 'Last 3 Months'}</option>
            <option value={180}>{language === 'ar' ? 'آخر 6 أشهر' : 'Last 6 Months'}</option>
          </select>
        </div>

        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <span className="inline-block w-10 h-10 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></span>
          </div>
        ) : stats.chart_data && stats.chart_data.length > 0 ? (
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chart_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#334155' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar 
                  dataKey="count" 
                  name={language === 'ar' ? 'الشركات الجديدة' : 'New Companies'}
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={period === 30 ? 20 : 40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-500">
            {language === 'ar' ? 'لا توجد بيانات متاحة لهذه الفترة' : 'No data available for this period'}
          </div>
        )}
      </div>
    </div>
  );
}
