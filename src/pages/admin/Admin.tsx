import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { VirtualizedTable } from '../../components/ui/VirtualizedTable';
import {
  BarChart3, Users, Database, Shield, Settings, Menu,
  Search, Ban, UserCheck, DollarSign, Eye, X, RefreshCw,
  Activity, TrendingUp, AlertTriangle, Server, Wifi
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

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

interface UserDetail extends User {
  transactions: Tx[];
  portfolio: PortfolioItem[];
}

interface PortfolioItem {
  symbol: string;
  quantity: number;
  average_cost: number;
}

interface KPIs {
  total_users: number;
  active_users: number;
  admin_count: number;
  total_transactions: number;
  total_volume: number;
}

interface EvolutionData {
  users_by_month: { month: string; count: number }[];
  volume_by_month: { month: string; transactions: number; volume: number }[];
}

interface TopStock {
  symbol: string;
  transaction_count: number;
  total_volume: number;
  total_shares: number;
}

interface Distribution {
  transaction_types: Record<string, { count: number; volume: number }>;
  average_balance: number;
  total_completed_courses: number;
  average_transactions_per_user: number;
}

interface Tx {
  id: number;
  user_id: number;
  symbol: string;
  transaction_type: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  created_at: string;
}

interface LogEntry {
  id: number;
  admin_id: number;
  admin_username: string;
  action: string;
  target_type: string;
  target_id: number | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface Config {
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

interface TableStat {
  table: string;
  records: number;
}

interface SuspiciousData {
  large_transactions: Tx[];
  suspicious_users: { id: number; username: string; current_balance: number; initial_balance: number; growth_multiplier: number }[];
}

type Section = 'kpis' | 'users' | 'data' | 'audit' | 'config';

const PIE_COLORS = ['#10b981', '#ef4444'];

const CHART_DEFAULT_HEIGHT = 260;

export function Admin() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<Section>('kpis');
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [evolution, setEvolution] = useState<EvolutionData | null>(null);
  const [topStocks, setTopStocks] = useState<TopStock[]>([]);
  const [distribution, setDistribution] = useState<Distribution | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [tableStats, setTableStats] = useState<TableStat[]>([]);
  const [suspicious, setSuspicious] = useState<SuspiciousData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [txFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [balanceModal, setBalanceModal] = useState<{ user: User; open: boolean }>({ user: null as unknown as User, open: false });
  const [balanceValue, setBalanceValue] = useState('');
  const [sectionLoading, setSectionLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({
    open: false, title: '', message: '', onConfirm: () => {},
  });

  const adminApi = async (path: string, options?: { method?: string; body?: unknown }) => {
    const res = await api(path, {
      method: options?.method || 'GET',
      data: options?.body,
    });
    return res.data;
  };

  const loadKpis = useCallback(async () => {
    try {
      const data = await adminApi('/admin/kpis');
      setKpis(data);
    } catch { /* ignore */ }
  }, []);

  const loadUsers = useCallback(async (skip = 0) => {
    try {
      const data = await adminApi(`/admin/users?skip=${skip}&limit=25`);
      setUsers(data.users);
      setUsersTotal(data.total);
    } catch { /* ignore */ }
  }, []);

  const loadEvolution = useCallback(async () => {
    try {
      const data = await adminApi('/admin/kpis/evolution?days=365');
      setEvolution(data);
    } catch { /* ignore */ }
  }, []);

  const loadTopStocks = useCallback(async () => {
    try {
      const data = await adminApi('/admin/kpis/top-stocks?limit=10');
      setTopStocks(data.top_stocks);
    } catch { /* ignore */ }
  }, []);

  const loadDistribution = useCallback(async () => {
    try {
      const data = await adminApi('/admin/kpis/distribution');
      setDistribution(data);
    } catch { /* ignore */ }
  }, []);

  const loadTransactions = useCallback(async (skip = 0) => {
    try {
      const url = txFilter
        ? `/admin/transactions?skip=${skip}&limit=25&${txFilter}`
        : `/admin/transactions?skip=${skip}&limit=25`;
      const data = await adminApi(url);
      setTransactions(data.transactions);
      setTxTotal(data.total);
    } catch { /* ignore */ }
  }, [txFilter]);

  const loadLogs = useCallback(async (skip = 0) => {
    try {
      const data = await adminApi(`/admin/logs?skip=${skip}&limit=25`);
      setLogs(data.logs);
    } catch { /* ignore */ }
  }, []);

  const loadConfigs = useCallback(async () => {
    try {
      const data = await adminApi('/admin/config');
      setConfigs(data.configs);
    } catch { /* ignore */ }
  }, []);

  const loadTableStats = useCallback(async () => {
    try {
      const data = await adminApi('/admin/stats/tables');
      setTableStats(data.tables);
    } catch { /* ignore */ }
  }, []);

  const loadSuspicious = useCallback(async () => {
    try {
      const data = await adminApi('/admin/suspicious-transactions?limit=20');
      setSuspicious(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadKpis(), loadUsers()]).finally(() => setLoading(false));
  }, [loadKpis, loadUsers]);

  useEffect(() => {
    setSectionLoading(true);
    switch (activeSection) {
      case 'kpis':
        Promise.all([loadEvolution(), loadTopStocks(), loadDistribution()]).finally(() => setSectionLoading(false));
        break;
      case 'users':
        setSectionLoading(false);
        break;
      case 'data':
        Promise.all([loadTransactions(), loadTableStats()]).finally(() => setSectionLoading(false));
        break;
      case 'audit':
        Promise.all([loadLogs(), loadSuspicious()]).finally(() => setSectionLoading(false));
        break;
      case 'config':
        loadConfigs().finally(() => setSectionLoading(false));
        break;
    }
  }, [activeSection, loadEvolution, loadTopStocks, loadDistribution, loadTransactions, loadTableStats, loadLogs, loadSuspicious, loadConfigs]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mobileMenuOpen]);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBan = async (user: User) => {
    const action = user.is_active ? 'banear' : 'activar';
    setConfirmModal({
      open: true,
      title: `${user.is_active ? 'Banear' : 'Activar'} usuario`,
      message: `¿Seguro que quieres ${action} a "${user.username}"?`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        try {
          const res = await adminApi(`/admin/users/${user.id}/ban`, { method: 'PATCH' });
          setUsers(users.map((u) => (u.id === user.id ? { ...u, is_active: res.is_active } : u)));
          toast.success(res.message);
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : 'Error');
        }
      },
    });
  };

  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      const res = await adminApi(`/admin/users/${user.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ new_role: newRole }),
      });
      setUsers(users.map((u) => (u.id === user.id ? { ...u, rol: newRole } : u)));
      toast.success(res.message);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const handleBalanceAdjust = async () => {
    if (!balanceModal.user || !balanceValue) return;
    const val = parseFloat(balanceValue);
    if (isNaN(val) || val < 0) {
      toast.error('Ingresa un valor válido');
      return;
    }
    try {
      const res = await adminApi(`/admin/users/${balanceModal.user.id}/balance`, {
        method: 'PATCH',
        body: JSON.stringify({ new_balance: val }),
      });
      setUsers(users.map((u) => (u.id === balanceModal.user.id ? { ...u, current_balance: res.new_balance } : u)));
      toast.success(res.message);
      setBalanceModal({ user: null as unknown as User, open: false });
      setBalanceValue('');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const loadUserDetail = async (userId: number) => {
    try {
      const data = await adminApi(`/admin/users/${userId}`);
      setSelectedUser(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const updateConfig = async (key: string, value: string) => {
    try {
      const res = await adminApi(`/admin/config/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      });
      setConfigs(configs.map((c) => (c.key === key ? { ...c, value } : c)));
      toast.success(res.message);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const toggleMaintenance = async () => {
    try {
      const res = await adminApi('/admin/maintenance', { method: 'POST' });
      setConfigs(configs.map((c) => (c.key === 'maintenance_mode' ? { ...c, value: String(res.maintenance_mode) } : c)));
      toast.success(res.maintenance_mode ? 'Modo mantenimiento activado' : 'Modo mantenimiento desactivado');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const refreshData = async (type: string, endpoint: string) => {
    try {
      await adminApi(endpoint, { method: 'POST' });
      toast.success(`Datos de ${type} actualizados`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error');
    }
  };

  const clearCache = () => {
    setConfirmModal({
      open: true,
      title: 'Limpiar Caché',
      message: '¿Limpiar toda la caché del sistema? Los datos se volverán a cargar desde las APIs.',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        try {
          await adminApi('/admin/cache/clear', { method: 'POST' });
          toast.success('Caché limpiada');
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : 'Error');
        }
      },
    });
  };

  const sidebarItems: { key: Section; label: string; icon: typeof BarChart3 }[] = [
    { key: 'kpis', label: t('admin.kpis'), icon: BarChart3 },
    { key: 'users', label: t('admin.users'), icon: Users },
    { key: 'data', label: t('admin.data'), icon: Database },
    { key: 'audit', label: t('admin.validations'), icon: Shield },
    { key: 'config', label: t('admin.config'), icon: Settings },
  ];

  const kpiCards = kpis
    ? [
        { label: t('admin.totalUsers'), value: kpis.total_users.toLocaleString(), icon: Users, color: 'text-blue-500' },
        { label: t('admin.activeUsers'), value: kpis.active_users.toLocaleString(), icon: Activity, color: 'text-emerald-500' },
        { label: t('admin.admins'), value: kpis.admin_count.toLocaleString(), icon: UserCheck, color: 'text-purple-500' },
        { label: t('admin.totalTx'), value: kpis.total_transactions.toLocaleString(), icon: BarChart3, color: 'text-orange-500' },
        { label: t('admin.totalVolume'), value: `$${(kpis.total_volume / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'text-rose-500' },
      ]
    : [];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] animate-fade-in relative">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white dark:bg-[#0d0d0d] border-r border-slate-200 dark:border-[#1a1a1a] hidden lg:block">
        <nav className="p-3 space-y-1 sticky top-20">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeSection === item.key
                    ? 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-900 dark:text-white'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2.5 rounded-lg bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] shadow-sm hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-[#0d0d0d] border-r border-slate-200 dark:border-[#1a1a1a] shadow-xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navegación de administración"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#1a1a1a]">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{t('admin.title')}</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveSection(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeSection === item.key
                    ? 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-900 dark:text-white'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-16 lg:pt-6 pb-6 overflow-hidden">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-6">
          {t('admin.title')}
        </h1>

        {loading ? (
          <div className="text-center py-12 text-slate-400">{t('common.loading')}</div>
        ) : sectionLoading ? (
          <div className="text-center py-12 text-slate-400">{t('common.loading')}</div>
        ) : (
          <>
            {/* ───────── KPIs ───────── */}
            {activeSection === 'kpis' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {kpiCards.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</p>
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                      </div>
                    );
                  })}
                </div>

                {evolution && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-5">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('admin.usersByMonth')}</h3>
                      {evolution.users_by_month.length > 0 ? (
                        <ResponsiveContainer width="100%" height={CHART_DEFAULT_HEIGHT}>
                          <LineChart data={evolution.users_by_month}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                            <Tooltip
                              contentStyle={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, fontSize: 12 }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-sm text-slate-400 py-8 text-center">Sin datos aún</p>
                      )}
                    </div>

                    <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-5">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('admin.volumeByMonth')}</h3>
                      {evolution.volume_by_month.length > 0 ? (
                        <ResponsiveContainer width="100%" height={CHART_DEFAULT_HEIGHT}>
                          <BarChart data={evolution.volume_by_month}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                            <Tooltip
                              contentStyle={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, fontSize: 12 }}
                              labelStyle={{ color: '#fff' }}
                              formatter={(v: number) => [`$${v.toLocaleString()}`, 'Volumen']}
                            />
                            <Bar dataKey="volume" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-sm text-slate-400 py-8 text-center">Sin datos aún</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('admin.txDistribution')}</h3>
                    {distribution && Object.keys(distribution.transaction_types).length > 0 ? (
                      <div className="flex items-center gap-4">
                        <ResponsiveContainer width="60%" height={220}>
                          <PieChart>
                            <Pie
                              data={Object.entries(distribution.transaction_types).map(([k, v]) => ({
                                name: k,
                                value: v.count,
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {Object.keys(distribution.transaction_types).map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 text-sm">
                          <p className="text-slate-400">{t('admin.avgBalance')}: <span className="text-white font-mono">${distribution.average_balance.toLocaleString()}</span></p>
                          <p className="text-slate-400">{t('admin.avgTxPerUser')}: <span className="text-white font-mono">{distribution.average_transactions_per_user}</span></p>
                          <p className="text-slate-400">{t('admin.totalCourses')}: <span className="text-white font-mono">{distribution.total_completed_courses}</span></p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 py-8 text-center">Sin datos aún</p>
                    )}
                  </div>

                  <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('admin.topStocks')}</h3>
                    {topStocks.length > 0 ? (
                      <ResponsiveContainer width="100%" height={CHART_DEFAULT_HEIGHT}>
                        <BarChart data={topStocks.slice(0, 8)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                          <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                          <YAxis dataKey="symbol" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={50} />
                          <Tooltip
                            contentStyle={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 8, fontSize: 12 }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(v: number) => [v, 'Transacciones']}
                          />
                          <Bar dataKey="transaction_count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-slate-400 py-8 text-center">Sin datos aún</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ───────── USERS ───────── */}
            {activeSection === 'users' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('admin.searchUsers')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <span className="text-xs text-slate-400">{usersTotal} {t('admin.totalUsers').toLowerCase()}</span>
                </div>

                <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl overflow-hidden p-1">
                  <VirtualizedTable
                    data={filteredUsers}
                    emptyMessage={t('admin.noUsers')}
                    rowHeight={52}
                    maxHeight={600}
                    columns={[
                      { key: 'id', label: 'ID', width: 60, render: (u: User) => <span className="text-slate-500 dark:text-slate-400 text-xs">{u.id}</span> },
                      { key: 'username', label: t('admin.username'), width: 150, render: (u: User) => <span className="font-medium text-slate-900 dark:text-white">{u.username}</span> },
                      { key: 'email', label: 'Email', width: 220, render: (u: User) => <span className="text-slate-500 dark:text-slate-400 text-xs truncate block">{u.email}</span> },
                      {
                        key: 'rol', label: t('admin.role'), width: 100, render: (u: User) => (
                          <select
                            value={u.rol}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            className={`text-[10px] font-medium rounded-full px-2 py-0.5 border-0 appearance-none cursor-pointer ${
                              u.rol === 'admin'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            <option value="inversor">inversor</option>
                            <option value="admin">admin</option>
                          </select>
                        )
                      },
                      {
                        key: 'status', label: t('admin.status'), width: 80, render: (u: User) => (
                          <button
                            onClick={() => handleBan(u)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium cursor-pointer transition-all hover:opacity-80 ${
                              u.is_active
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {u.is_active ? t('admin.active') : t('admin.banned')}
                          </button>
                        )
                      },
                      {
                        key: 'balance', label: t('admin.balance'), width: 120, render: (u: User) => (
                          <span className="font-mono text-sm text-slate-900 dark:text-white">${u.current_balance.toLocaleString()}</span>
                        )
                      },
                      {
                        key: 'actions', label: t('admin.actions'), width: 120, render: (u: User) => (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => loadUserDetail(u.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                              title={t('admin.viewDetail')}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { setBalanceModal({ user: u, open: true }); setBalanceValue(String(u.current_balance)); }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                              title={t('admin.adjustBalance')}
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleBan(u)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                              title={u.is_active ? t('admin.banUser') : t('admin.unbanUser')}
                            >
                              {u.is_active ? <Ban className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )
                      },
                    ]}
                  />
                </div>

                {usersTotal > 25 && (
                  <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: Math.ceil(usersTotal / 25) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => { setUserPage(i); loadUsers(i * 25); }}
                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                          userPage === i
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                            : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ───────── DATA ───────── */}
            {activeSection === 'data' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{t('admin.dataManagement')}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button onClick={() => refreshData(t('admin.stocks').toLowerCase(), '/admin/refresh/stocks')} className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1a1a]/70 transition-all">
                      <RefreshCw className="w-3.5 h-3.5" /> {t('admin.refreshStocks')}
                    </button>
                    <button onClick={() => refreshData(t('admin.rates').toLowerCase(), '/admin/refresh/rates')} className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1a1a]/70 transition-all">
                      <RefreshCw className="w-3.5 h-3.5" /> {t('admin.refreshRates')}
                    </button>
                    <button onClick={() => refreshData(t('admin.indices').toLowerCase(), '/admin/refresh/indices')} className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1a1a]/70 transition-all">
                      <RefreshCw className="w-3.5 h-3.5" /> {t('admin.refreshIndices')}
                    </button>
                    <button onClick={clearCache} className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a1a1a]/70 transition-all">
                      <AlertTriangle className="w-3.5 h-3.5" /> {t('admin.clearCache')}
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('admin.recentTransactions')}</h3>
                  {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm responsive-table">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-[#1a1a1a]">
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">ID</th>
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Usuario</th>
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Símbolo</th>
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Tipo</th>
                            <th className="text-right px-3 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Cantidad</th>
                            <th className="text-right px-3 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Total</th>
                            <th className="text-right px-3 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Fecha</th>
                          </tr>
                        </thead>
                        <tbody className="responsive-table-card">
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="border-b border-slate-100 dark:border-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/50">
                              <td data-label="ID" className="px-3 py-2 text-xs text-slate-500">{tx.id}</td>
                              <td data-label="Usuario" className="px-3 py-2 text-xs text-slate-500">{tx.user_id}</td>
                              <td data-label="Símbolo" className="px-3 py-2 text-xs font-medium text-slate-900 dark:text-white">{tx.symbol}</td>
                              <td data-label="Tipo" className="px-3 py-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  tx.transaction_type === 'buy' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                }`}>{tx.transaction_type}</span>
                              </td>
                              <td data-label="Cantidad" className="px-3 py-2 text-right text-xs text-slate-500">{tx.quantity}</td>
                              <td data-label="Total" className="px-3 py-2 text-right text-xs font-mono text-slate-900 dark:text-white">${tx.total_amount.toLocaleString()}</td>
                              <td data-label="Fecha" className="px-3 py-2 text-right text-[10px] text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 py-4 text-center">Sin transacciones</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">{txTotal} transacciones en total</p>
                </div>

                {tableStats.length > 0 && (
                  <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('admin.dbStats')}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {tableStats.map((s) => (
                        <div key={s.table} className="bg-slate-50 dark:bg-[#1a1a1a] rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{s.records.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{s.table}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ───────── AUDIT ───────── */}
            {activeSection === 'audit' && (
              <div className="space-y-6">
                {suspicious && (suspicious.large_transactions.length > 0 || suspicious.suspicious_users.length > 0) && (
                  <div className="bg-white dark:bg-[#0d0d0d] border border-red-200 dark:border-red-900/30 rounded-xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">{t('admin.suspiciousActivity')}</h3>
                    </div>
                    {suspicious.suspicious_users.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-slate-500 mb-2">{t('admin.suspiciousUsers')}</p>
                        <div className="space-y-2">
                          {suspicious.suspicious_users.map((su) => (
                            <div key={su.id} className="flex items-center justify-between bg-red-50 dark:bg-red-900/10 rounded-lg px-3 py-2">
                              <span className="text-sm font-medium text-slate-900 dark:text-white">{su.username}</span>
                              <span className="text-xs font-mono text-red-500">{su.growth_multiplier}x (${su.current_balance.toLocaleString()})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {suspicious.large_transactions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-2">{t('admin.largeTransactions')}</p>
                        <div className="space-y-2">
                          {suspicious.large_transactions.slice(0, 5).map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between bg-red-50 dark:bg-red-900/10 rounded-lg px-3 py-2">
                              <span className="text-sm text-slate-900 dark:text-white">{tx.symbol} ({tx.transaction_type})</span>
                              <span className="text-xs font-mono text-red-500">${tx.total_amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('admin.adminLogs')}</h3>
                  {logs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm responsive-table">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-[#1a1a1a]">
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Fecha</th>
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Admin</th>
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Acción</th>
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Target</th>
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Detalle</th>
                          </tr>
                        </thead>
                        <tbody className="responsive-table-card">
                          {logs.map((log) => (
                            <tr key={log.id} className="border-b border-slate-100 dark:border-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/50">
                              <td data-label="Fecha" className="px-3 py-2 text-[10px] text-slate-400 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                              <td data-label="Admin" className="px-3 py-2 text-xs text-slate-500">{log.admin_username}</td>
                              <td data-label="Acción" className="px-3 py-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  log.action === 'ban' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                                  log.action === 'unban' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                  log.action === 'role_change' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                                  'bg-slate-100 dark:bg-[#1a1a1a] text-slate-500'
                                }`}>{log.action}</span>
                              </td>
                              <td data-label="Target" className="px-3 py-2 text-xs text-slate-500">{log.target_type}#{log.target_id}</td>
                              <td data-label="Detalle" className="px-3 py-2 text-[10px] text-slate-400 max-w-[200px] truncate">{log.details ? JSON.stringify(log.details) : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 py-4 text-center">Sin registros aún</p>
                  )}
                </div>
              </div>
            )}

            {/* ───────── CONFIG ───────── */}
            {activeSection === 'config' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('admin.systemConfig')}</h3>
                  {configs.filter((c) => c.key !== 'maintenance_mode').map((cfg) => (
                    <div key={cfg.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-[#1a1a1a] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{cfg.key.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-slate-400">{cfg.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          defaultValue={cfg.value}
                          onBlur={(e) => {
                            if (e.target.value !== cfg.value) updateConfig(cfg.key, e.target.value);
                          }}
                          className="w-28 px-2 py-1.5 text-xs bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#1a1a1a] rounded-lg text-slate-900 dark:text-white text-right font-mono focus:outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('admin.maintenanceMode')}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{t('admin.maintenanceDesc')}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Estado actual: {configs.find((c) => c.key === 'maintenance_mode')?.value === 'true' ? '🟢 Activado' : '⚪ Desactivado'}
                      </p>
                    </div>
                    <button
                      onClick={toggleMaintenance}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        configs.find((c) => c.key === 'maintenance_mode')?.value === 'true'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200'
                          : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {configs.find((c) => c.key === 'maintenance_mode')?.value === 'true' ? t('admin.disableMaintenance') : t('admin.enableMaintenance')}
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('admin.apiStatus')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-[#1a1a1a] rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">Finnhub API</span>
                      </div>
                      <span className="text-xs text-emerald-500 font-medium">{t('admin.connected')}</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-[#1a1a1a] rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">ExchangeRate API</span>
                      </div>
                      <span className="text-xs text-emerald-500 font-medium">{t('admin.connected')}</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-[#1a1a1a] rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">PostgreSQL</span>
                      </div>
                      <span className="text-xs text-blue-500 font-medium">{t('admin.connected')}</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-[#1a1a1a] rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">Redis</span>
                      </div>
                      <span className="text-xs text-blue-500 font-medium">{t('admin.connected')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── User Detail Modal ─── */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedUser(null)} role="dialog" aria-modal="true" aria-labelledby="user-detail-title">
            <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-[#1a1a1a]">
                <h3 id="user-detail-title" className="text-lg font-semibold text-slate-900 dark:text-white">{selectedUser.username}</h3>
                <button onClick={() => setSelectedUser(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1a1a] text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-lg p-3">
                    <p className="text-[10px] text-slate-400">{t('admin.role')}</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{selectedUser.rol}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-lg p-3">
                    <p className="text-[10px] text-slate-400">{t('admin.status')}</p>
                    <p className={`text-sm font-medium mt-1 ${selectedUser.is_active ? 'text-emerald-500' : 'text-red-500'}`}>
                      {selectedUser.is_active ? t('admin.active') : t('admin.banned')}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-lg p-3">
                    <p className="text-[10px] text-slate-400">{t('admin.balance')}</p>
                    <p className="text-sm font-mono font-medium text-slate-900 dark:text-white mt-1">${selectedUser.current_balance.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-lg p-3">
                    <p className="text-[10px] text-slate-400">{t('admin.coursesCompleted')}</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{selectedUser.completed_courses}/6</p>
                  </div>
                </div>

                {selectedUser.portfolio.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('admin.portfolio')}</h4>
                    <div className="space-y-1">
                      {selectedUser.portfolio.map((p) => (
                        <div key={p.symbol} className="flex items-center justify-between bg-slate-50 dark:bg-[#1a1a1a] rounded-lg px-3 py-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{p.symbol}</span>
                          <span className="text-xs text-slate-400">
                            {p.quantity} × ${p.average_cost.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Balance Modal ─── */}
        {balanceModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setBalanceModal({ user: null as unknown as User, open: false })} role="dialog" aria-modal="true" aria-labelledby="balance-title">
            <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-100 dark:border-[#1a1a1a]">
                <h3 id="balance-title" className="text-lg font-semibold text-slate-900 dark:text-white">{t('admin.adjustBalance')} — {balanceModal.user?.username}</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">{t('admin.newBalance')}</label>
                  <input
                    type="number"
                    value={balanceValue}
                    onChange={(e) => setBalanceValue(e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#1a1a1a] rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setBalanceModal({ user: null as unknown as User, open: false })} className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all">
                    {t('common.cancel')}
                  </button>
                  <button onClick={handleBalanceAdjust} className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition-all">
                    {t('admin.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Confirm Modal ─── */}
        {confirmModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmModal((prev) => ({ ...prev, open: false }))} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
              <h3 id="confirm-title" className="text-base font-semibold text-slate-900 dark:text-white mb-2">{confirmModal.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{confirmModal.message}</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmModal((prev) => ({ ...prev, open: false }))} className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all">
                  {t('common.cancel')}
                </button>
                <button onClick={confirmModal.onConfirm} className="flex-1 px-3 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all">
                  {t('admin.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
