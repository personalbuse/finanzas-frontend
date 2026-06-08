import { useState, useEffect } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';
import { toast } from 'react-toastify';

const DEFAULT_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC',
  'BA', 'JNJ', 'UNH', 'HD', 'PG', 'MA', 'DIS', 'V', 'KO', 'PEP',
  'CSCO', 'T', 'ADBE', 'CRM', 'CMCSA', 'XOM', 'PFE', 'ORCL', 'QCOM', 'TXN',
  'AVGO', 'COST', 'MCD', 'NKE', 'WMT'
];

const STOCKS_CONFIG = {
  default: DEFAULT_STOCKS,
  maxPerRequest: 50,
  cacheTTL: 86400 // 24 horas
};

export function Stocks() {
  const { t } = useTranslation();
  const { updateBalance } = useAuthStore();
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async (symbols: string[] = STOCKS_CONFIG.default) => {
    setLoading(true);
    
    try {
      const uniqueSymbols = [...new Set(symbols)].slice(0, STOCKS_CONFIG.maxPerRequest);
      
      const res = await api.post('/stocks/batch', {
        symbols: uniqueSymbols,
        cache_ttl: STOCKS_CONFIG.cacheTTL
      });
      
      if (res.data && res.data.length > 0) {
        setStocks(res.data);
      } else {
        setStocks([]);
      }
    } catch (error: unknown) {
      console.error('Error fetching stocks:', error);
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Error al cargar acciones');
      setStocks([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim().toUpperCase();
    if (!term) {
      fetchStocks();
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.get(`/stocks/${term}`);
      setStocks(res.data ? [res.data] : []);
    } catch (error) {
      console.error('Error searching stock:', error);
      toast.error('Accion no encontrada. Verifica el simbolo e intenta de nuevo.');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (symbol: string) => {
    const qty = quantities[symbol] || 1;
    setBuying(symbol);
    
    try {
      const res = await api.post('/portfolio/buy', {
        symbol: symbol,
        quantity: qty
      });
      
      if (res.data) {
        updateBalance(res.data.remaining_balance);
        
        setQuantities((prev) => ({ ...prev, [symbol]: 1 }));
        toast.success(`${t('stocks.successBuy')}\n${res.data.message}`);
        
        await fetchStocks();
      }
    } catch (error: any) {
      console.error('Buy error:', error);
      toast.error(`Error: ${error.response?.data?.detail || t('stocks.buyError')}`);
    } finally {
      setBuying(null);
    }
  };

  const handleQuantityChange = (symbol: string, value: string) => {
    const qty = parseInt(value) || 1;
    setQuantities((prev) => ({ ...prev, [symbol]: qty }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in py-6 md:py-8">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-6">
        {t('stocks.title')}
      </h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            placeholder={t('stocks.searchPlaceholder')}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-[#262626] bg-white dark:bg-[#0d0d0d] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button type="submit" className="btn-primary">
            {t('stocks.search')}
          </button>
        </div>
      </form>

      {loading && !initialLoad && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Obteniendo información en tiempo real...
          </div>
        </div>
      )}

      {initialLoad && loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando datos del mercado...
          </div>
        </div>
      )}

      {!loading && stocks.length === 0 && (
        <div className="text-center py-8">
          <h3 className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest text-sm">
            {t('stocks.searchPlaceholder')}
          </h3>
          <button onClick={() => fetchStocks()} className="text-slate-900 dark:text-white font-medium hover:underline mt-2">
            {t('stocks.search')} popular stocks
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stocks.map((stock: any) => (
          <div
            key={stock.symbol}
            className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 hover:border-slate-300 dark:hover:border-[#262626] transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {stock.symbol}
                </h3>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {t('stocks.currentPrice')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  ${stock.price?.toFixed(2) || '0.00'}
                </p>
                {stock.change_percent && (
                  <p className={`text-xs font-medium ${
                    stock.change_percent.startsWith('+') 
                      ? 'text-emerald-500' 
                      : 'text-red-500'
                  }`}>
                    {stock.change_percent}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-3 text-xs">
              <div>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {t('stocks.previousClose')}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  ${stock.previous_close?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={quantities[stock.symbol] || 1}
                onChange={(e) => handleQuantityChange(stock.symbol, e.target.value)}
                className="w-20 px-2 py-1 text-sm rounded-lg border border-slate-200 dark:border-[#262626] bg-white dark:bg-[#0d0d0d] text-slate-900 dark:text-white"
              />
              <button
                onClick={() => handleBuy(stock.symbol)}
                disabled={buying === stock.symbol}
                className="flex-1 btn-primary text-sm py-1"
              >
                {buying === stock.symbol ? '...' : t('stocks.buy')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
