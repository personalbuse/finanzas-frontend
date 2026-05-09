import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../provider/LanguageProvider';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useStore();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userId = user?.id || JSON.parse(localStorage.getItem('user') || '{}').id;
      if (!userId) { setLoading(false); return; }

      const [portfolioRes, transactionsRes] = await Promise.allSettled([
        api.get(`/portfolio/values/${userId}`),
        api.get(`/portfolio/history/${userId}`),
      ]);

      if (portfolioRes.status === 'fulfilled') setPortfolio(portfolioRes.value.data);
      if (transactionsRes.status === 'fulfilled') setTransactions(transactionsRes.value.data.transactions?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');

  const pieChartData = portfolio?.stocks?.slice(0, 5).map((stock: any, index: number) => ({
    name: stock.symbol,
    value: stock.stock_value,
    color: COLORS[index % COLORS.length],
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-900 dark:border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('dashboard.welcome')}, {currentUser.username || 'Investor'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">{t('app.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="stat-card group cursor-pointer" onClick={() => navigate('/portfolio')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('dashboard.balance')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {formatCurrency(currentUser.current_balance || 10000)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer" onClick={() => navigate('/portfolio')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('dashboard.portfolioValue')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {formatCurrency(portfolio?.total_value)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer" onClick={() => navigate('/portfolio')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('dashboard.totalProfit')}</p>
              <p className={`text-2xl font-bold mt-2 ${
                (portfolio?.total_profit || 0) >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(portfolio?.total_profit)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              (portfolio?.total_profit || 0) >= 0 
                ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {(portfolio?.total_profit || 0) >= 0 ? (
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer" onClick={() => navigate('/transactions')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('dashboard.cashBalance')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {formatCurrency(currentUser.current_balance || 10000)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t('dashboard.performance')}</h3>
          </div>
          <div className="p-6">
            {portfolio?.stocks?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={portfolio.stocks.map((s: any) => ({
                  name: s.symbol,
                  cost: s.average_cost * s.quantity,
                  value: s.stock_value,
                  profit: s.stock_profit,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" darkStroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    dot={{ fill: '#94a3b8', strokeWidth: 2, r: 4 }}
                    name={t('dashboard.totalCost')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name={t('portfolio.totalValue')}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400 dark:text-slate-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm font-medium">{t('portfolio.noHoldings')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t('portfolio.holdings')}</h3>
          </div>
          <div className="p-6">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400 dark:text-slate-500">
                <p className="text-sm font-medium">{t('portfolio.noHoldings')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t('dashboard.quickActions')}</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/stocks')} className="btn-primary flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('dashboard.buyStocks')}
            </button>
            <button onClick={() => navigate('/portfolio')} className="btn-secondary flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {t('dashboard.sellStocks')}
            </button>
            <button onClick={() => navigate('/portfolio')} className="px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all text-center flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {t('dashboard.viewPortfolio')}
            </button>
            <button onClick={() => navigate('/transactions')} className="px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-all text-center flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {t('dashboard.viewTransactions')}
            </button>
          </div>
        </div>

        <div className="glass-card">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t('dashboard.recentActivity')}</h3>
          </div>
          <div className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-10">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h4 className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">{t('dashboard.noTransactions')}</h4>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">{t('dashboard.noTransactionsDesc')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.transaction_type === 'buy' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {tx.transaction_type === 'buy' ? (
                          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          tx.transaction_type === 'buy' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {tx.transaction_type === 'buy' ? t('transactions.buy') : t('transactions.sell')}
                        </span>
                        <span className="ml-2 text-slate-900 dark:text-white font-bold">{tx.symbol}</span>
                      </div>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 font-bold">{formatCurrency(tx.total_amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}