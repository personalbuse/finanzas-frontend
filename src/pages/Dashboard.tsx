import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../provider/LanguageProvider';
import { useStore } from '../store/useStore';
import api from '../services/api';
import { OnboardingModal } from '../components/onboarding/OnboardingModal';
import { ExchangeRateChart } from '../components/charts/ExchangeRatesChart';
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

const generateMockHistory = (baseRate: number, days: number = 7) => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const variation = (Math.random() - 0.5) * 100;
    return {
      date: date.toISOString().split('T')[0],
      rate: Math.round(baseRate + variation)
    };
  });
};

const getMockExchangeRates = (isFallback: boolean = false) => {
  const usdBase = 3850;
  const eurBase = 4200;
  return {
    is_fallback: isFallback,
    usd_cop: {
      rate: usdBase + (Math.random() - 0.5) * 50,
      change_percent: Number((Math.random() * 2 - 1).toFixed(2)),
      history: generateMockHistory(usdBase)
    },
    eur_cop: {
      rate: eurBase + (Math.random() - 0.5) * 50,
      change_percent: Number((Math.random() * 2 - 1).toFixed(2)),
      history: generateMockHistory(eurBase)
    }
  };
};

export function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useStore();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [courseProgress, setCourseProgress] = useState({ completed_courses: 0, bonus_earned: 0 });
  const [exchangeRates, setExchangeRates] = useState<any>(null);
  const [exchangeRatesFallback, setExchangeRatesFallback] = useState(false);
  const [storedUser, setStoredUser] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    return `hace ${diffDays} días`;
  };

  useEffect(() => {
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      setStoredUser(JSON.parse(userFromStorage));
    }
    fetchData();
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const hasSeenOnboarding = localStorage.getItem('onboarding_shown');
    
    try {
      const progressRes = await api.get('/course-progress');
      setCourseProgress(progressRes.data);
      
      if (progressRes.data.completed_courses === 0 && !hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
    }
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  const fetchData = async () => {
    try {
      const [portfolioRes, transactionsRes, exchangeRes, newsRes] = await Promise.allSettled([
        api.get('/portfolio/values'),
        api.get('/portfolio/history'),
        api.get(`/exchange-rates/multi`),
        api.get('/news'),
      ]);

      if (portfolioRes.status === 'fulfilled') setPortfolio(portfolioRes.value.data);
      if (transactionsRes.status === 'fulfilled') setTransactions(transactionsRes.value.data.transactions?.slice(0, 5) || []);
      if (exchangeRes.status === 'fulfilled') {
        const data = exchangeRes.value.data;
        if (data.is_fallback) {
          setExchangeRatesFallback(true);
        }
        setExchangeRates(data);
      } else {
        setExchangeRatesFallback(true);
        setExchangeRates(getMockExchangeRates(true));
      }
      if (newsRes.status === 'fulfilled') {
        setNews(newsRes.value.data.news || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setNewsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const currentUser = user || storedUser;

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
      <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} />
      
      {courseProgress.completed_courses > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-900/20 border border-emerald-800/50">
          <div className="flex items-center justify-between">
            <div>
              {courseProgress.completed_courses >= 6 ? (
                <p className="text-sm text-emerald-400 font-medium">
                  {t('learning.courseCompleted')}
                </p>
              ) : (
                <p className="text-sm text-emerald-400 font-medium">
                  Has completado {courseProgress.completed_courses || 0} módulos. +${courseProgress.bonus_earned || 0} en bonuses.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/learn')}
                className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-900/30 rounded-lg hover:bg-emerald-900/50 transition-colors"
              >
                {t('learning.reviewCourse')}
              </button>
              <button
                onClick={() => navigate('/stocks')}
                className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors"
              >
                {t('learning.goToInvest')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">
          Hola, {currentUser.username || 'Usuario'}
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-10">
        <div className="stat-card group cursor-pointer p-2 sm:p-4" onClick={() => navigate('/portfolio')}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{t('dashboard.balance')}</p>
              <p className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 sm:mt-2 truncate">
                {formatCurrency(currentUser.current_balance || 10000)}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer p-2 sm:p-4" onClick={() => navigate('/portfolio')}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{t('dashboard.portfolioValue')}</p>
              <p className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 sm:mt-2 truncate">
                {formatCurrency(portfolio?.total_value)}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer p-2 sm:p-4" onClick={() => navigate('/portfolio')}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{t('dashboard.totalProfit')}</p>
              <p className={`text-sm sm:text-xl font-bold mt-0.5 sm:mt-2 truncate ${
                (portfolio?.total_profit || 0) >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(portfolio?.total_profit)}
              </p>
            </div>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${
              (portfolio?.total_profit || 0) >= 0 
                ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {(portfolio?.total_profit || 0) >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="stat-card group cursor-pointer p-2 sm:p-4" onClick={() => navigate('/transactions')}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{t('dashboard.cashBalance')}</p>
              <p className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5 sm:mt-2 truncate">
                {formatCurrency(currentUser.current_balance || 10000)}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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

      {exchangeRatesFallback && (
        <div className="mb-6 p-4 rounded-lg bg-amber-900/20 border border-amber-800/50">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm text-amber-400 font-medium">Datos de tasas de cambio近似</p>
              <p className="text-xs text-amber-400/70">Mostrando estimaciones basadas en datos históricos. Los valores reales pueden variar.</p>
            </div>
          </div>
        </div>
      )}

      {exchangeRates && (
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight mb-4">
            Tasas de Cambio (COP)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExchangeRateChart
              data={exchangeRates.usd_cop?.history || []}
              currentRate={exchangeRates.usd_cop?.rate || 0}
              changePercent={exchangeRates.usd_cop?.change_percent}
              fromCurrency="USD"
              toCurrency="COP"
            />
            <ExchangeRateChart
              data={exchangeRates.eur_cop?.history || []}
              currentRate={exchangeRates.eur_cop?.rate || 0}
              changePercent={exchangeRates.eur_cop?.change_percent}
              fromCurrency="EUR"
              toCurrency="COP"
            />
          </div>
        </div>
      )}

      <div className="mb-10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight mb-4">
          Noticias Financieras
        </h3>
        {newsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {news.slice(0, 3).map((item: any) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl overflow-hidden hover:border-emerald-500 transition-all group"
              >
                {item.image && (
                  <div className="h-32 bg-slate-100 dark:bg-[#1a1a1a] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.headline}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                    {item.source}
                  </p>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.headline}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {formatTimeAgo(item.datetime)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 dark:text-slate-500 text-center py-8">
            No hay noticias disponibles
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card">
          <div className="p-4 border-b border-slate-100 dark:border-[#1a1a1a]">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">{t('dashboard.quickActions')}</h3>
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
                  <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-50 dark:bg-[#1a1a1a]/50 group hover:bg-slate-100 dark:hover:bg-[#262626] transition-colors">
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
