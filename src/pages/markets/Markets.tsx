import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';
import api from '../../services/api';
import { TrendingUp, TrendingDown, Globe } from 'lucide-react';

const REGIONS = [
  { id: 'North America', name: 'Norteamérica', nameEn: 'North America', flag: '🌎' },
  { id: 'South America', name: 'Sudamérica', nameEn: 'South America', flag: '🌎' },
  { id: 'Europe', name: 'Europa', nameEn: 'Europe', flag: '🇪🇺' },
  { id: 'Asia', name: 'Asia', nameEn: 'Asia', flag: '🌏' },
];

const COUNTRIES: Record<string, { name: string; flag: string; currency: string }> = {
  US: { name: 'Estados Unidos', flag: '🇺🇸', currency: 'USD' },
  MX: { name: 'México', flag: '🇲🇽', currency: 'MXN' },
  BR: { name: 'Brasil', flag: '🇧🇷', currency: 'BRL' },
  CO: { name: 'Colombia', flag: '🇨🇴', currency: 'COP' },
  CL: { name: 'Chile', flag: '🇨🇱', currency: 'CLP' },
  GB: { name: 'Reino Unido', flag: '🇬🇧', currency: 'GBP' },
  DE: { name: 'Alemania', flag: '🇩🇪', currency: 'EUR' },
  FR: { name: 'Francia', flag: '🇫🇷', currency: 'EUR' },
  JP: { name: 'Japón', flag: '🇯🇵', currency: 'JPY' },
  CN: { name: 'China', flag: '🇨🇳', currency: 'CNY' },
};

export function Markets() {
  const { t } = useTranslation();
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionData, setRegionData] = useState<any>(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stocks/international');
      setStocks(res.data.stocks || []);
    } catch (error) {
      console.error('Error fetching international stocks:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'COP') {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price);
    } else if (currency === 'BRL') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    } else if (currency === 'CLP') {
      return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    } else if (currency === 'JPY') {
      return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
    } else if (currency === 'CNY') {
      return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(price);
    } else if (currency === 'GBP') {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
    } else if (currency === 'EUR') {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(price);
  };

  const displayStocks = selectedRegion ? regionData : stocks;
  const groupedStocks = useMemo(() => {
    if (selectedRegion) return null;
    return stocks.reduce((acc: any, stock: any) => {
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
            className={`p-4 rounded-xl border transition-all ${
              selectedRegion === region.id
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white dark:bg-[#0d0d0d] border-slate-200 dark:border-[#1a1a1a] hover:border-emerald-500'
            }`}
          >
            <div className="text-2xl mb-2">{region.flag}</div>
            <div className={`font-semibold ${selectedRegion === region.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {region.name}
            </div>
            <div className={`text-xs ${selectedRegion === region.id ? 'text-white/80' : 'text-slate-500'}`}>
              {selectedRegion === region.id && loading ? '...' : `${stocks.filter((s: any) => s.region === region.id).length} acciones`}
            </div>
          </button>
        ))}
      </div>

      {selectedRegion && (
        <button
          onClick={() => { setSelectedRegion(null); setRegionData(null); }}
          className="mb-4 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          ← Volver a todos los mercados
        </button>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-900 dark:border-white border-t-transparent" />
        </div>
      ) : selectedRegion ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayStocks?.map((stock: any) => (
            <div
              key={stock.symbol}
              className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 hover:border-slate-300 dark:hover:border-[#262626] transition-all"
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
          {Object.entries(groupedStocks || {}).map(([region, regionStocks]: [string, any]) => (
            <div key={region}>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                {REGIONS.find(r => r.id === region)?.flag || '🌐'} {region}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionStocks.slice(0, 6).map((stock: any) => (
                  <div
                    key={stock.symbol}
                    className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-4 hover:border-slate-300 dark:hover:border-[#262626] transition-all"
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