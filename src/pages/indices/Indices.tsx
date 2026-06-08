import { useState, useEffect } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';
import api from '../../services/api';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

const REGIONS = [
  { id: 'North America', name: 'Norteamérica', flag: '🇺🇸' },
  { id: 'South America', name: 'Sudamérica', flag: '🇧🇷' },
  { id: 'Europe', name: 'Europa', flag: '🇪🇺' },
  { id: 'Asia', name: 'Asia', flag: '🌏' },
  { id: 'Global', name: 'Global', flag: '🌍' },
  { id: 'Oceania', name: 'Oceania', flag: '🌊' },
];

const REGION_FLAGS: Record<string, string> = {
  'North America': '🇺🇸',
  'South America': '🇧🇷',
  'Europe': '🇪🇺',
  'Asia': '🌏',
  'Global': '🌍',
  'Oceania': '🌊',
};

export function Indices() {
  const { t } = useTranslation();
  const [indices, setIndices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    fetchIndices();
  }, []);

  const fetchIndices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/indices');
      setIndices(res.data.indices || []);
    } catch (error) {
      console.error('Error fetching indices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchByRegion = async (region: string) => {
    setLoading(true);
    setSelectedRegion(region);
    try {
      const res = await api.get(`/indices?region=${region}`);
      setIndices(res.data.indices || []);
    } catch (error) {
      console.error('Error fetching indices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number | null | undefined, currency: string) => {
    if (value === null || value === undefined) return '-';
    if (currency === 'JPY' || currency === 'KRW') {
      return new Intl.NumberFormat('ja-JP').format(Math.round(value));
    }
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <BarChart2 className="w-8 h-8" />
          {t('indices.title', 'Índices Mundiales')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {t('indices.subtitle', 'Sigue los principales índices de las bolsas globales')}
        </p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => { setSelectedRegion(null); fetchIndices(); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            selectedRegion === null
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#262626]'
          }`}
        >
          Todos
        </button>
        {REGIONS.map((region) => (
          <button
            key={region.id}
            onClick={() => fetchByRegion(region.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedRegion === region.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#262626]'
            }`}
          >
            <span>{region.flag}</span> {region.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-900 dark:border-white border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full responsive-table">
              <thead className="bg-slate-50 dark:bg-[#1a1a1a]/50">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Índice
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    País
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Cambio
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 responsive-table-card">
                {indices.map((index) => (
                  <tr key={index.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td data-label="Índice" className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl">
                          {REGION_FLAGS[index.region] || '🌐'}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{index.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{index.symbol.replace('^', '')}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="País" className="px-4 sm:px-6 py-4">
                      <span className="text-slate-600 dark:text-slate-400">{index.country}</span>
                    </td>
                    <td data-label="Valor" className="px-4 sm:px-6 py-4 text-right">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatValue(index.current_value, index.currency)}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">{index.currency}</span>
                    </td>
                    <td data-label="Cambio" className="px-4 sm:px-6 py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 font-medium ${
                        (index.change || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(index.change || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {formatValue(Math.abs(index.change || 0), index.currency)}
                      </div>
                    </td>
                    <td data-label="%" className="px-4 sm:px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                        (index.change_percent || 0) >= 0
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {(index.change_percent || 0) >= 0 ? '+' : ''}{((index.change_percent || 0)).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}