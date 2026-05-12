import { useState, useEffect } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';
import { useAuth } from '../../provider/AuthProvider';

interface User {
  id: number;
  username: string;
  email: string;
  rol: string;
  is_active: boolean;
  initial_balance: number;
  current_balance: number;
  completed_courses: number;
  created_at: string;
}

interface KPIs {
  total_users: number;
  active_users: number;
  admin_count: number;
  total_transactions: number;
  total_volume: number;
}

type Tab = 'users' | 'kpis' | 'data' | 'validations' | 'config';

export function Admin() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('kpis');
  const [users, setUsers] = useState<User[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  const api = async (path: string, options?: RequestInit) => {
    const res = await fetch(`/api/v1${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api('/admin/kpis').then(setKpis).catch(() => {}),
      api('/admin/users').then((d) => setUsers(d.users)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tabs: { key: Tab; label: string }[] = [
    { key: 'kpis', label: t('admin.kpis') },
    { key: 'users', label: t('admin.users') },
    { key: 'data', label: t('admin.data') },
    { key: 'validations', label: t('admin.validations') },
    { key: 'config', label: t('admin.config') },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-6">
        {t('admin.title')}
      </h1>

      <div className="flex space-x-1 mb-6 border-b border-slate-200 dark:border-[#1a1a1a] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">{t('common.loading')}</div>
      ) : (
        <>
          {activeTab === 'kpis' && kpis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: t('admin.totalUsers'), value: kpis.total_users },
                { label: t('admin.activeUsers'), value: kpis.active_users },
                { label: t('admin.admins'), value: kpis.admin_count },
                { label: t('admin.totalTx'), value: kpis.total_transactions },
                { label: t('admin.totalVolume'), value: `$${kpis.total_volume.toLocaleString()}` },
              ].map((item) => (
                <div key={item.label} className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[#1a1a1a] bg-slate-50 dark:bg-[#1a1a1a]/50">
                      <th className="text-left px-4 py-3 font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">ID</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">{t('admin.username')}</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">{t('admin.role')}</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">{t('admin.status')}</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">{t('admin.balance')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-100 dark:border-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/50">
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.username}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            u.rol === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400'
                          }`}>
                            {u.rol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            u.is_active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {u.is_active ? t('admin.active') : t('admin.banned')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-slate-900 dark:text-white">
                          ${u.current_balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-6 text-center text-slate-400">
              {t('admin.comingSoon')}
            </div>
          )}

          {activeTab === 'validations' && (
            <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-6 text-center text-slate-400">
              {t('admin.comingSoon')}
            </div>
          )}

          {activeTab === 'config' && (
            <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-6 text-center text-slate-400">
              {t('admin.comingSoon')}
            </div>
          )}
        </>
      )}
    </div>
  );
}
