import { useState, useEffect } from 'react';
import { useTranslation } from '../../provider/LanguageProvider';
import api, { createCancelSource } from '../../services/api';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '../../utils/format';

interface LeaderboardUser {
  user_id: number;
  username: string;
  total_value: number;
  profitability: number;
  rank: number;
  total_users?: number;
}

export function Leaderboard() {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<LeaderboardUser | null>(null);

  useEffect(() => {
    const source = createCancelSource();
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leaderboardRes, myRankRes] = await Promise.all([
          api.get('/leaderboard', { signal: source.signal }),
          api.get('/leaderboard/me', { signal: source.signal }).catch(() => ({ data: null }))
        ]);
        setLeaderboard(leaderboardRes.data.leaderboard || []);
        setMyRank(myRankRes.data);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Error fetching leaderboard data:', error);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => source.cancel();
  }, [t]);

  const getMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-3xl">🥇</span>;
      case 2:
        return <span className="text-3xl">🥈</span>;
      case 3:
        return <span className="text-3xl">🥉</span>;
      default:
        return <span className="text-lg font-bold text-slate-400 dark:text-slate-500">{rank}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-500" />
          {t('leaderboard.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {t('leaderboard.subtitle')}
        </p>
      </div>

      {myRank && myRank.rank && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{t('leaderboard.yourPosition')}</p>
              <p className="text-3xl font-bold">#{myRank.rank} de {myRank.total_users}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">{t('leaderboard.yourProfitability')}</p>
              <p className="text-2xl font-bold">{myRank.profitability >= 0 ? '+' : ''}{myRank.profitability?.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}

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
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {t('leaderboard.position')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {t('leaderboard.investor')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {t('leaderboard.totalValue')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {t('leaderboard.profitability')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 responsive-table-card">
                {leaderboard.map((user, index) => (
                  <tr
                    key={user.user_id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      index < 3 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                    }`}
                  >
                    <td data-label={t('leaderboard.position')} className="px-6 py-4">
                      <div className="flex items-center justify-center w-10">
                        {getMedal(user.rank)}
                      </div>
                    </td>
                    <td data-label={t('leaderboard.investor')} className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {user?.username ?? '?'}
                        </span>
                      </div>
                    </td>
                    <td data-label={t('leaderboard.totalValue')} className="px-6 py-4 text-right">
                      <span className="text-slate-600 dark:text-slate-400">
                        {formatCurrency(user.total_value)}
                      </span>
                    </td>
                    <td data-label={t('leaderboard.profitability')} className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-bold ${
                        user.profitability >= 0
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {user.profitability >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {user.profitability >= 0 ? '+' : ''}{user.profitability.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {leaderboard.length === 0 && !loading && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-400 dark:text-slate-500">
            {t('leaderboard.noData')}
          </p>
        </div>
      )}
    </div>
  );
}