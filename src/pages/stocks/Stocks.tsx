import { useState, useEffect } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { toast } from 'react-toastify';

export function Stocks() {
  const { t } = useTranslation();
  const { user, updateBalance } = useStore();
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [buying, setBuying] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const defaultStocks = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
    'BA', 'JNJ', 'UNH', 'HD', 'PG', 'MA', 'DIS', 'V', 'KO', 'PEP',
    'CSCO', 'T', 'ADBE', 'CRM', 'CMCSA', 'XOM', 'PFE', 'ORCL', 'QCOM', 'TXN',
    'AVGO', 'COST', 'MCD', 'NKE', 'WMT'
  ];

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async (symbols: string[] = defaultStocks) => {
    setLoading(true);
    setInitialLoad(false);
    
    // For single stock search, just do the call
    if (symbols.length === 1) {
      try {
        const res = await api.get(`/stocks/${symbols[0]}`);
        setStocks([res.data]);
      } catch (error) {
        console.error('Error fetching stock:', error);
        setStocks([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // For multiple stocks (initial load), do them sequentially with a small delay
    // This respects the Alpha Vantage 5-calls-per-minute limit
    const results: any[] = [];
    const total = symbols.length;
    let loaded = 0;
    
    for (const symbol of symbols) {
      try {
        const res = await api.get(`/stocks/${symbol}`);
        if (res.data) {
          results.push(res.data);
          loaded++;
          setStocks([...results]);
        }
      } catch (err) {
        console.error(`Failed to fetch ${symbol}`, err);
      }
      // Small pause between requests (reduced for better UX)
      await new Promise(r => setTimeout(r, 200));
    }
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchStocks();
      return;
    }
    await fetchStocks([searchTerm.toUpperCase()]);
  };

  const handleBuy = async (symbol: string) => {
    const qty = quantities[symbol] || 1;
    setBuying(symbol);
    try {
      const userId = user?.id || JSON.parse(localStorage.getItem('user') || '{}').id;
      const res = await api.post('/portfolio/buy', {
        user_id: userId,
        symbol,
        quantity: qty,
      });
      toast.success(`${t('stocks.successBuy')}\n${res.data.message}`);
      updateBalance(res.data.remaining_balance);
    } catch (error: any) {
      toast.error(`Error: ${error.response?.data?.detail || t('stocks.buyError')}`);
    } finally {
      setBuying(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-6">{t('stocks.title')}</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-clean flex-1"
            placeholder={t('stocks.searchPlaceholder')}
          />
          <button type="submit" className="btn-primary">
            {t('stocks.search')}
          </button>
        </div>
      </form>

      {initialLoad && (
        <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-16 text-center animate-fade-in">
          <h3 className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest text-sm">{t('stocks.searchPlaceholder')}</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-3">
            <button onClick={() => fetchStocks()} className="text-slate-900 dark:text-white font-medium hover:underline">
              {t('stocks.search')} popular stocks
            </button>
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 dark:border-white border-t-transparent"></div>
        </div>
      )}

      {!loading && !initialLoad && stocks.length === 0 && (
        <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-16 text-center">
          <h3 className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest text-sm">{t('stocks.notFound')}</h3>
        </div>
      )}

      {/* Stock Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stocks.map((stock: any) => (
          <div key={stock.symbol} className="glass-card overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-[#1a1a1a]">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">{stock.symbol}</h3>
                <span className={stock.change >= 0 ? 'tag-success' : 'tag-danger'}>
                  {stock.change_percent}
                </span>
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-medium uppercase tracking-widest mt-1">{stock.source}</p>
            </div>

            <div className="p-3 sm:p-4">
              <div className="mb-3 sm:mb-4">
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('stocks.currentPrice')}</p>
                <p className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mt-1">{formatCurrency(stock.price)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('stocks.previousClose')}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{formatCurrency(stock.previous_close)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('stocks.volume')}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{stock.volume?.toLocaleString()}</p>
                </div>
              </div>

              {/* Quantity + Buy */}
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={quantities[stock.symbol] || 1}
                  onChange={(e) => setQuantities({ ...quantities, [stock.symbol]: parseInt(e.target.value) || 1 })}
                  className="input-clean w-14 text-center text-sm font-medium"
                />
                <button
                  onClick={() => handleBuy(stock.symbol)}
                  disabled={buying === stock.symbol}
                  className="btn-primary flex-1"
                >
                  {buying === stock.symbol ? '...' : t('stocks.buy')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
