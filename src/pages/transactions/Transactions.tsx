import { useState, useEffect } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency } from '../../utils/format';
import SortIcon from '../../components/ui/SortIcon';

type SortField = 'date' | 'symbol' | 'quantity' | 'price' | 'total';
type SortDirection = 'asc' | 'desc';

interface Transaction {
  id: number;
  symbol: string;
  transaction_type: 'buy' | 'sell';
  total_amount: number;
  price_per_unit: number;
  quantity: number;
  created_at: string;
}

export function Transactions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/portfolio/history');
      setTransactions(res.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedTransactions = [...transactions].sort((a: Transaction, b: Transaction) => {
    let aVal: string | number, bVal: string | number;
    
    switch (sortField) {
      case 'date':
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
        break;
      case 'symbol':
        aVal = a.symbol.toLowerCase();
        bVal = b.symbol.toLowerCase();
        break;
      case 'quantity':
        aVal = a.quantity;
        bVal = b.quantity;
        break;
      case 'price':
        aVal = a.price_per_unit;
        bVal = b.price_per_unit;
        break;
      case 'total':
        aVal = a.total_amount;
        bVal = b.total_amount;
        break;
      default:
        return 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIconField = ({ field }: { field: SortField }) => (
    <SortIcon field={field} currentField={sortField} direction={sortDirection} />
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-900 dark:border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
        {t('transactions.title')}
      </h1>

      <div className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-[#1a1a1a] flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
            {t('transactions.recentActivity')}
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {sortedTransactions.length} {t('transactions.totalCount').toLowerCase()}
            </span>
            <button 
              onClick={fetchTransactions} 
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors bg-slate-50 dark:bg-[#1a1a1a] rounded-lg hover:bg-slate-100 dark:hover:bg-[#262626]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('transactions.refresh')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full responsive-table">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {[
                  { key: 'date', label: t('transactions.date') },
                  { key: 'type', label: t('transactions.type') },
                  { key: 'symbol', label: t('transactions.stock') },
                  { key: 'quantity', label: t('transactions.quantity') },
                  { key: 'price', label: t('transactions.price') },
                  { key: 'total', label: t('transactions.total') },
                ].map(({ key, label }) => (
                  <th 
                    key={key}
                    onClick={() => key !== 'type' && handleSort(key as SortField)}
                    className={`px-6 py-4 text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors ${
                      key === 'type' ? 'cursor-default' : ''
                    }`}
                  >
                    {label}
                    <SortIconField field={key as SortField} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 responsive-table-card">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h4 className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">
                        {t('transactions.noTransactions')}
                      </h4>
                      <button
                        onClick={() => navigate('/stocks')}
                        className="mt-4 px-4 py-2 text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Ir a comprar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx: Transaction) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td data-label={t('transactions.date')} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td data-label={t('transactions.type')} className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        tx.transaction_type === 'buy' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {tx.transaction_type === 'buy' ? t('transactions.buy') : t('transactions.sell')}
                      </span>
                    </td>
                    <td data-label={t('transactions.stock')} className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                      {tx.symbol}
                    </td>
                    <td data-label={t('transactions.quantity')} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {tx.quantity}
                    </td>
                    <td data-label={t('transactions.price')} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {formatCurrency(tx.price_per_unit)}
                    </td>
                    <td data-label={t('transactions.total')} className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(tx.total_amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t('common.page')} {currentPage} {t('common.of')} {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('common.previous')}
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
