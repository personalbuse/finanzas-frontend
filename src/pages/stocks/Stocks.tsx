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

  const defaultStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];

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
    for (const symbol of symbols) {
      try {
        const res = await api.get(`/stocks/${symbol}`);
        if (res.data) {
          results.push(res.data);
          // Update UI incrementally
          setStocks([...results]);
        }
      } catch (err) {
        console.error(`Failed to fetch ${symbol}`, err);
      }
      // Small pause between requests
      await new Promise(r => setTimeout(r, 600));
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
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-8">{t('stocks.title')}</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="flex gap-4">
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
        <div className="bg-white border border-slate-200 rounded-2xl p-20 text-center animate-fade-in">
          <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">{t('stocks.searchPlaceholder')}</h3>
          <p className="text-slate-400 text-sm mt-4">
            <button onClick={() => fetchStocks()} className="text-slate-900 font-bold hover:underline">
              {t('stocks.search')} popular stocks
            </button>
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      )}

      {!loading && !initialLoad && stocks.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-20 text-center">
          <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">{t('stocks.notFound')}</h3>
        </div>
      )}

      {/* Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stocks.map((stock: any) => (
          <div key={stock.symbol} className="glass-card overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stock.symbol}</h3>
                <span className={stock.change >= 0 ? 'tag-success' : 'tag-danger'}>
                  {stock.change_percent}
                </span>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{stock.source}</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('stocks.currentPrice')}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(stock.price)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('stocks.previousClose')}</p>
                  <p className="text-slate-600 font-medium text-sm mt-1">{formatCurrency(stock.previous_close)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('stocks.volume')}</p>
                  <p className="text-slate-600 font-medium text-sm mt-1">{stock.volume?.toLocaleString()}</p>
                </div>
              </div>

              {/* Quantity + Buy */}
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  value={quantities[stock.symbol] || 1}
                  onChange={(e) => setQuantities({ ...quantities, [stock.symbol]: parseInt(e.target.value) || 1 })}
                  className="input-clean w-16 text-center text-sm font-bold"
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
