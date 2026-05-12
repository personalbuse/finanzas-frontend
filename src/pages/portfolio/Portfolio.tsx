import { useState, useEffect } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

type SortField = 'symbol' | 'quantity' | 'avgCost' | 'currentPrice' | 'value' | 'profit';
type SortDirection = 'asc' | 'desc';

export function Portfolio() {
  const { t } = useTranslation();
  const { updateBalance } = useStore();
  const [portfolio, setPortfolio] = useState<any>({
    total_cost: 0,
    total_value: 0,
    total_profit: 0,
    total_profit_percent: 0,
    stocks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellQuantities, setSellQuantities] = useState<Record<string, number>>({});
  const [selling, setSelling] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setError(null);
      const res = await api.get('/portfolio/values');
      setPortfolio(res.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setError('Error al cargar el portafolio. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async (symbol: string) => {
    const qty = sellQuantities[symbol] || 1;
    setSelling(symbol);
    try {
      const res = await api.post('/portfolio/sell', {
        symbol,
        quantity: qty,
      });
      toast.success(res.data.message || t('portfolio.sellSuccess'));
      updateBalance(res.data.remaining_balance);
      fetchPortfolio();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t('portfolio.sellError'));
    } finally {
      setSelling(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStocks = [...portfolio.stocks].sort((a, b) => {
    let aVal: any, bVal: any;
    
    switch (sortField) {
      case 'symbol':
        aVal = a.symbol.toLowerCase();
        bVal = b.symbol.toLowerCase();
        break;
      case 'quantity':
        aVal = a.quantity;
        bVal = b.quantity;
        break;
      case 'avgCost':
        aVal = a.average_cost;
        bVal = b.average_cost;
        break;
      case 'currentPrice':
        aVal = a.current_price;
        bVal = b.current_price;
        break;
      case 'value':
        aVal = a.stock_value;
        bVal = b.stock_value;
        break;
      case 'profit':
        aVal = a.stock_profit;
        bVal = b.stock_profit;
        break;
      default:
        return 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${(value || 0).toFixed(2)}%`;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 inline ml-1" />
      : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-900 dark:border-white border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <svg className="w-16 h-16 text-red-300 dark:text-red-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={fetchPortfolio}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
        {t('portfolio.title')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="stat-card group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('portfolio.totalCost')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(portfolio.total_cost)}</p>
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('portfolio.totalValue')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(portfolio.total_value)}</p>
            </div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              portfolio.total_profit >= 0 
                ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {portfolio.total_profit >= 0 ? (
                <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('portfolio.totalProfit')}</p>
              <p className={`text-2xl font-bold mt-1 ${
                portfolio.total_profit >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(portfolio.total_profit)}
                <span className="text-xs font-bold ml-2 opacity-70">{formatPercentage(portfolio.total_profit_percent)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-[#1a1a1a]">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">{t('portfolio.holdings')}</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-[#1a1a1a]/50">
              <tr>
                {[
                  { key: 'symbol', label: t('portfolio.stock') },
                  { key: 'quantity', label: t('portfolio.quantity') },
                  { key: 'avgCost', label: t('portfolio.avgCost') },
                  { key: 'currentPrice', label: t('portfolio.currentPrice') },
                  { key: 'value', label: t('portfolio.value') },
                  { key: 'profit', label: t('portfolio.profit') },
                  { key: 'actions', label: t('portfolio.actions') },
                ].map(({ key, label }) => (
                  <th 
                    key={key}
                    onClick={() => key !== 'actions' && handleSort(key as SortField)}
                    className={`px-6 py-4 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors ${
                      key === 'actions' ? 'cursor-default' : ''
                    }`}
                  >
                    {label}
                    <SortIcon field={key as SortField} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {sortedStocks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <h4 className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">
                        {t('portfolio.noHoldings')}
                      </h4>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedStocks.map((stock: any) => (
                  <tr key={stock.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {stock.symbol.substring(0, 2)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{stock.symbol}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {stock.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {formatCurrency(stock.average_cost)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {formatCurrency(stock.current_price)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(stock.stock_value)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1 font-bold ${
                        stock.stock_profit >= 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stock.stock_profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {formatCurrency(stock.stock_profit)}
                        <span className="text-[10px] ml-1 opacity-70">{formatPercentage(stock.stock_profit_percent)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={stock.quantity}
                          value={sellQuantities[stock.symbol] || 1}
                          onChange={(e) => setSellQuantities({ ...sellQuantities, [stock.symbol]: parseInt(e.target.value) || 1 })}
                          className="w-16 px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-center text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        />
                        <button
                          onClick={() => handleSell(stock.symbol)}
                          disabled={selling === stock.symbol}
                          className="px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all uppercase tracking-wider whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {selling === stock.symbol ? t('common.loading') : t('portfolio.sell')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
