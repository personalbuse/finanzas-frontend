import { useState, useEffect } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';
import api from '../../services/api';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CURRENCIES: Record<string, { name: string; flag: string }> = {
  USD: { name: 'Dólar Americano', flag: '🇺🇸' },
  EUR: { name: 'Euro', flag: '🇪🇺' },
  GBP: { name: 'Libra Esterlina', flag: '🇬🇧' },
  JPY: { name: 'Yen Japonés', flag: '🇯🇵' },
  BRL: { name: 'Real Brasileño', flag: '🇧🇷' },
  MXN: { name: 'Peso Mexicano', flag: '🇲🇽' },
  COP: { name: 'Peso Colombiano', flag: '🇨🇴' },
  CLP: { name: 'Peso Chileno', flag: '🇨🇱' },
  PEN: { name: 'Sol Peruano', flag: '🇵🇪' },
  ARS: { name: 'Peso Argentino', flag: '🇦🇷' },
};

const PAIRS_ORDER = [
  'usd_cop', 'eur_cop', 'usd_mxn', 'usd_brl', 'usd_clp',
  'usd_pen', 'usd_ars', 'eur_usd', 'gbp_usd', 'usd_jpy'
];

export function Forex() {
  const { t } = useTranslation();
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exchange-rates/multi');
      setRates(res.data);
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRates();
    setRefreshing(false);
  };

  const formatRate = (rate: number | undefined, toCurrency: string) => {
    if (!rate) return '-';
    if (toCurrency === 'JPY') {
      return rate.toFixed(2);
    }
    if (['COP', 'CLP', 'ARS'].includes(toCurrency)) {
      return new Intl.NumberFormat('es-CO').format(Math.round(rate));
    }
    return rate.toFixed(4);
  };

  const getPairInfo = (key: string) => {
    const parts = key.split('_');
    const from = parts[0].toUpperCase();
    const to = parts.slice(1).join('').toUpperCase();
    return { from, to };
  };

  const pairsList = PAIRS_ORDER.map(key => {
    const pairData = rates?.[key];
    const { from, to } = getPairInfo(key);

    let change = 0;
    // Usar change_percent del backend si existe, sino calcular del historial
    if (pairData?.change_percent !== undefined && pairData?.change_percent !== null) {
      change = pairData.change_percent;
    } else if (pairData?.history && pairData.history.length >= 2) {
      const current = pairData.history[pairData.history.length - 1]?.rate || 0;
      const previous = pairData.history[pairData.history.length - 2]?.rate || 0;
      change = previous ? ((current - previous) / previous) * 100 : 0;
    }

    return {
      key,
      from,
      to,
      rate: pairData?.rate ?? pairData?.today,
      change,
      history: pairData?.history || []
    };
  });

  const selectedPair = pairsList[0];
  const chartData = selectedPair.history.length > 0 ? selectedPair.history : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8" />
            {t('forex.title', 'Mercado de Divisas (Forex)')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {t('forex.subtitle', 'Tasas de cambio actualizadas diariamente')}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#1a1a1a] rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#262626] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Actualizar</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-900 dark:border-white border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-[#1a1a1a]/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Par
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Cambio 24h
                    </th>
                    <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Mín
                    </th>
                    <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Máx
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {pairsList.map((pair) => (
                    <tr key={pair.key} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{CURRENCIES[pair.from]?.flag}</span>
                          <span className="text-xl">{CURRENCIES[pair.to]?.flag}</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {pair.from}/{pair.to}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">
                          {formatRate(pair.rate, pair.to)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                          pair.change >= 0
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {pair.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                        {pair.history.length > 0 ? formatRate(pair.history.reduce((m: number, h: any) => h.rate < m ? h.rate : m, Infinity), pair.to) : '-'}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                        {pair.history.length > 0 ? formatRate(pair.history.reduce((m: number, h: any) => h.rate > m ? h.rate : m, -Infinity), pair.to) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {selectedPair.from}/{selectedPair.to} - Precio Actual
              </h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {formatRate(selectedPair.rate, selectedPair.to)}
                </span>
                <span className="text-lg text-slate-500">{selectedPair.to}</span>
              </div>
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${
                selectedPair.change >= 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {selectedPair.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-medium">{selectedPair.change >= 0 ? '+' : ''}{selectedPair.change.toFixed(2)}%</span>
                <span className="text-xs opacity-70">(24h)</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Historial - {selectedPair.from}/{selectedPair.to} (7 días)
              </h3>
              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={10}
                      tickFormatter={(value) => value.slice(5)}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [formatRate(value, selectedPair.to), selectedPair.to]}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-400">
                  {t('forex.noHistoricalData')}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Guía de Monedas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.entries(CURRENCIES).map(([code, { name, flag }]) => (
            <div
              key={code}
              className="bg-slate-50 dark:bg-[#1a1a1a] rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{flag}</span>
                <span className="font-bold text-slate-900 dark:text-white">{code}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}