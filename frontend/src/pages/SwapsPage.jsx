import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwaps } from '../hooks/useSwaps';
import { useAuth } from '../context/AuthContext';
import { Avatar, StatusBadge, Spinner, EmptyState, toast } from '../components/ui';
import { timeAgo } from '../utils/helpers';
import { swapsApi } from '../services/api';

const TABS = ['all', 'pending', 'accepted', 'completed'];

export default function SwapsPage() {
  const { user } = useAuth();
  const { swaps, loading, refetch } = useSwaps();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [acting, setActing] = useState(null);

  const filtered = tab === 'all' ? swaps : swaps.filter(s => s.status === tab);

  const handle = async (action, id) => {
    try {
      setActing(id + action);
      if (action === 'accept') await swapsApi.accept(id);
      else if (action === 'reject') await swapsApi.reject(id);
      else if (action === 'complete') await swapsApi.complete(id);
      else if (action === 'cancel') await swapsApi.cancel(id);
      toast.success(`Swap ${action}ed`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-ink-1">My Swaps</h1>
        <span className="badge bg-surface-2 text-ink-4 border border-surface-3">{swaps.length} total</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-2 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-surface-0 text-ink-1' : 'text-ink-4 hover:text-ink-2'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="⇄"
          title={tab === 'all' ? 'No swaps yet' : `No ${tab} swaps`}
          description="Discover people to swap skills with"
          action={<button onClick={() => navigate('/discover')} className="btn-primary">Browse Discover</button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(swap => {
            const isRequester = swap.requester?._id === user?._id;
            const other = isRequester ? swap.receiver : swap.requester;
            const mySkill = isRequester ? swap.requesterSkill : swap.receiverSkill;
            const theirSkill = isRequester ? swap.receiverSkill : swap.requesterSkill;

            return (
              <div key={swap._id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/swaps/${swap._id}`)}>
                    <Avatar user={other} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink-1">{other?.name}</span>
                        <StatusBadge status={swap.status} />
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-ink-4">
                        <span className="skill-tag text-[11px] px-1.5 py-0.5">{mySkill}</span>
                        <span>⇄</span>
                        <span className="badge bg-surface-3 text-ink-3 border border-surface-4 text-[11px] px-1.5 py-0.5">{theirSkill}</span>
                      </div>
                      <p className="text-xs text-ink-5 mt-1">{timeAgo(swap.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {swap.status === 'pending' && !isRequester && (
                      <>
                        <button className="btn-primary text-xs py-1.5 px-3" disabled={!!acting}
                          onClick={() => handle('accept', swap._id)}>
                          {acting === swap._id + 'accept' ? '…' : 'Accept'}
                        </button>
                        <button className="btn-danger text-xs py-1.5 px-3" disabled={!!acting}
                          onClick={() => handle('reject', swap._id)}>
                          Reject
                        </button>
                      </>
                    )}
                    {swap.status === 'pending' && isRequester && (
                      <button className="btn-ghost text-xs py-1.5 px-3 text-danger" disabled={!!acting}
                        onClick={() => handle('cancel', swap._id)}>
                        Cancel
                      </button>
                    )}
                    {swap.status === 'accepted' && (
                      <>
                        <button className="btn-primary text-xs py-1.5 px-3"
                          onClick={() => navigate(`/swaps/${swap._id}`)}>
                          Chat
                        </button>
                        <button className="btn-secondary text-xs py-1.5 px-3" disabled={!!acting}
                          onClick={() => handle('complete', swap._id)}>
                          Complete
                        </button>
                      </>
                    )}
                    {swap.status === 'completed' && (
                      <button className="btn-ghost text-xs py-1.5 px-3"
                        onClick={() => navigate(`/swaps/${swap._id}`)}>
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
