import { useState, useEffect } from 'react';
import { creditsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreditBadge, Spinner } from '../components/ui';
import { timeAgo } from '../utils/helpers';

const TYPE_CONFIG = {
  earn:    { icon: '↑', color: 'text-success', label: 'Earned' },
  spend:   { icon: '↓', color: 'text-danger',  label: 'Spent' },
  penalty: { icon: '✕', color: 'text-danger',  label: 'Penalty' },
  bonus:   { icon: '★', color: 'text-credit',  label: 'Bonus' },
  refund:  { icon: '↩', color: 'text-success', label: 'Refund' },
};

export default function CreditsPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    creditsApi.getHistory({ page, limit: 20 })
      .then(({ data }) => { setHistory(data.transactions); setTotalPages(data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="page-container max-w-2xl">
      {/* Balance card */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-surface-2 to-surface-1">
        <p className="text-sm text-ink-4 mb-2">Total Balance</p>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold text-credit font-mono">{user?.creditBalance?.toLocaleString()}</span>
          <span className="text-ink-4 text-lg">◈ credits</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-surface-3">
          {[
            ['Swaps', user?.swapsCompleted ?? 0, '⇄'],
            ['Sessions', user?.sessionsCompleted ?? 0, '⚡'],
            ['Rating', user?.ratingCount ? (user.rating / user.ratingCount).toFixed(1) : '—', '★'],
          ].map(([label, val, icon]) => (
            <div key={label} className="text-center">
              <p className="text-ink-2 font-semibold">{icon} {val}</p>
              <p className="text-xs text-ink-5 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="section-title mb-4">Transaction History</h2>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 text-ink-4 text-sm">No transactions yet</div>
      ) : (
        <>
          <div className="space-y-2">
            {history.map(tx => {
              const cfg = TYPE_CONFIG[tx.type] || TYPE_CONFIG.earn;
              const isPositive = ['earn', 'bonus', 'refund'].includes(tx.type);
              return (
                <div key={tx._id} className="card p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                      {cfg.icon}
                    </div>
                    <div>
                      <p className="text-sm text-ink-1 font-medium">{tx.description}</p>
                      <p className="text-xs text-ink-5">{timeAgo(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-semibold font-mono ${isPositive ? 'text-success' : 'text-danger'}`}>
                      {isPositive ? '+' : '-'}{tx.amount} ◈
                    </p>
                    <p className="text-xs text-ink-5">{tx.balanceAfter} bal</p>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button className="btn-secondary text-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span className="btn-ghost text-sm pointer-events-none">{page} / {totalPages}</span>
              <button className="btn-secondary text-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
