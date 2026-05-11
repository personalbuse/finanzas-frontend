import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../provider/ThemeProvider';

interface ExchangeRateChartProps {
  data: { date: string; rate: number }[];
  currentRate: number;
  changePercent: number | null;
  fromCurrency: string;
  toCurrency: string;
}

export function ExchangeRateChart({ data, currentRate, changePercent, fromCurrency, toCurrency }: ExchangeRateChartProps) {
  const { darkMode } = useTheme();
  const chartData = data.map(item => ({
    ...item,
    rate: Number(item.rate.toFixed(2))
  }));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
  };

  const formatRate = (value: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {fromCurrency}/{toCurrency}
          </p>
          <p className="text-xl font-semibold text-white">
            {formatRate(currentRate)}
          </p>
        </div>
        {changePercent !== null && (
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
            changePercent >= 0 
              ? 'bg-emerald-900/30 text-emerald-400' 
              : 'bg-red-900/30 text-red-400'
          }`}>
            {changePercent >= 0 ? '+' : ''}{changePercent}%
          </div>
        )}
      </div>
      
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#262626' : '#e2e8f0'} />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke={darkMode ? '#525252' : '#64748b'}
              fontSize={10}
              tickLine={false}
            />
            <YAxis 
              stroke={darkMode ? '#525252' : '#64748b'} 
              fontSize={10}
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: darkMode ? '#1a1a1a' : '#ffffff', 
                border: darkMode ? '1px solid #262626' : '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                color: darkMode ? '#ffffff' : '#1e293b'
              }}
              labelStyle={{ color: darkMode ? '#a1a1aa' : '#64748b', marginBottom: '4px' }}
              formatter={(value: number) => [formatRate(value), 'Tasa']}
              labelFormatter={(label) => formatDate(label)}
            />
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke={darkMode 
                ? (changePercent !== null && changePercent >= 0 ? '#10b981' : '#ef4444')
                : (changePercent !== null && changePercent >= 0 ? '#059669' : '#dc2626')
              }
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}