import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';
import api, { createCancelSource } from '../../services/api';
import { TrendingUp, TrendingDown, Globe } from 'lucide-react';
import { formatPrice } from '../../utils/format';

interface StockData {
  symbol: string;
  name: string;
  region: string;
  country: string;
  exchange: string;
  currency: string;
  current_price: number;
  change_percent: number;
}

const REGIONS = [
  { id: 'North America', flag: '🌎' },
  { id: 'South America', flag: '🌎' },
  { id: 'Europe', flag: '🇪🇺' },
  { id: 'Asia', flag: '🌏' },
];

const COUNTRIES: Record<string, { flag: string; currency: string }> = {
  US: { flag: '🇺🇸', currency: 'USD' },
  MX: { flag: '🇲🇽', currency: 'MXN' },
  BR: { flag: '🇧🇷', currency: 'BRL' },
  CO: { flag: '🇨🇴', currency: 'COP' },
  CL: { flag: '🇨🇱', currency: 'CLP' },
  GB: { flag: '🇬🇧', currency: 'GBP' },
  DE: { flag: '🇩🇪', currency: 'EUR' },
  FR: { flag: '🇫🇷', currency: 'EUR' },
  JP: { flag: '🇯🇵', currency: 'JPY' },
  CN: { flag: '🇨🇳', currency: 'CNY' },
};

export function Markets() {
  const { t } = useTranslation();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionData, setRegionData] = useState<StockData[] | null>(null);

  const fetchStocks = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      const res = await api.get('/stocks/international', { signal });
      setStocks(res.data.stocks || []);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Error fetching international stocks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const source = createCancelSource();
    fetchStocks(source.signal);
    return () => source.cancel();
  }, [fetchStocks]);

  const fetchByRegion = async (region: string) => {
    setLoading(true);
    setSelectedRegion(region);
    try {
      const res = await api.get(`/stocks/international?region=${region}`);
      setRegionData(res.data.stocks || []);
    } catch (error) {
      console.error('Error fetching region:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayStocks = selectedRegion ? regionData : stocks;
  const groupedStocks = useMemo(() => {
    if (selectedRegion) return null;
    return stocks.reduce((acc: Record<string, StockData[]>, stock: StockData) => {
      if (!acc[stock.region]) acc[stock.region] = [];
      acc[stock.region].push(stock);
      return acc;
    }, {});
  }, [stocks, selectedRegion]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in py-6">
      <div className="mb-8">
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Globe className="w-8 h-8" />
          {t('markets.title', 'Mercados Globales')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {t('markets.subtitle', 'Invierte en acciones de mercados internacionales')}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {REGIONS.map((region) => (
          <button
            key={region.id}
            onClick={() => fetchByRegion(region.id)}
            className={`p-4 rounded-xl border transition-colors ${
              selectedRegion === region.id
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white dark:bg-[#0d0d0d] border-slate-200 dark:border-[#1a1a1a] hover:border-emerald-500'
            }`}
          >
            <div className="text-2xl mb-2">{region.flag}</div>
            <div className={`font-semibold ${selectedRegion === region.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {t(`markets.region.${region.id.replace(/\s+/g, '')}`, region.id)}
            </div>
            <div className={`text-xs ${selectedRegion === region.id ? 'text-white/80' : 'text-slate-500'}`}>
              {selectedRegion === region.id && loading ? '...' : `${stocks.filter((s: StockData) => s.region === region.id).length} ${t('markets.stocks')}`}
            </div>
          </button>
        ))}
      </div>

      {selectedRegion && (
        <button
          onClick={() => { setSelectedRegion(null); setRegionData(null); }}
          className="mb-4 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          ← {t('markets.backToAll')}
        </button>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-900 dark:border-white border-t-transparent" />
        </div>
      ) : selectedRegion ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayStocks?.map((stock: StockData) => (
            <div
              key={stock.symbol}
                  className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 hover:border-slate-300 dark:hover:border-[#262626] transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{COUNTRIES[stock.country]?.flag || '🌐'}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{stock.symbol}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{stock.exchange}</p>
                  </div>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded ${
                  stock.change_percent >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent?.toFixed(2)}%
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 truncate">{stock.name}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formatPrice(stock.current_price, stock.currency)}
                </span>
                <div className="flex items-center gap-1">
                  {stock.change_percent >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedStocks || {}).map(([region, regionStocks]: [string, StockData[]]) => (
            <div key={region}>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                {REGIONS.find(r => r.id === region)?.flag || '🌐'} {region}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionStocks.slice(0, 6).map((stock: StockData) => (
                  <div
                    key={stock.symbol}
              className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 hover:border-slate-300 dark:hover:border-[#262626] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{COUNTRIES[stock.country]?.flag || '🌐'}</span>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{stock.symbol}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{stock.exchange}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 truncate">{stock.name}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">
                        {formatPrice(stock.current_price, stock.currency)}
                      </span>
                      <span className={`text-xs font-medium ${stock.change_percent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}