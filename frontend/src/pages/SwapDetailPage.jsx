import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { swapsApi, reviewsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar, StatusBadge, SkillTag, StarRating, Modal, Spinner, toast } from '../components/ui';
import { ChatUI } from '../components/chat/ChatUI';
import { timeAgo } from '../utils/helpers';

export default function SwapDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [acting, setActing] = useState(false);

  useEffect(() => {
    swapsApi.getById(id)
      .then(({ data }) => setSwap(data.swap))
      .catch(() => navigate('/swaps'))
      .finally(() => setLoading(false));
  }, [id]);

  const handle = async (action) => {
    try {
      setActing(true);
      if (action === 'accept') await swapsApi.accept(id);
      else if (action === 'complete') await swapsApi.complete(id);
      else if (action === 'cancel') await swapsApi.cancel(id);
      const { data } = await swapsApi.getById(id);
      setSwap(data.swap);
      toast.success(`Swap ${action}d`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const submitReview = async () => {
    const isRequester = swap.requester._id === user._id;
    const revieweeId = isRequester ? swap.receiver._id : swap.requester._id;
    try {
      setActing(true);
      await reviewsApi.create({
        revieweeId,
        referenceId: swap._id,
        referenceModel: 'Swap',
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      toast.success('Review submitted!');
      setReviewModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!swap) return null;

  const isRequester = swap.requester._id === user._id;
  const other = isRequester ? swap.receiver : swap.requester;
  const mySkill = isRequester ? swap.requesterSkill : swap.receiverSkill;
  const theirSkill = isRequester ? swap.receiverSkill : swap.requesterSkill;
  const canChat = ['accepted', 'in_progress', 'completed'].includes(swap.status);

  return (
    <div className="page-container">
      <button onClick={() => navigate('/swaps')} className="btn-ghost text-sm mb-4 -ml-2">← Back</button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <StatusBadge status={swap.status} />
              <span className="text-xs text-ink-5">{timeAgo(swap.updatedAt)}</span>
            </div>

            {/* Other user */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-surface-3">
              <Avatar user={other} size="lg" />
              <div>
                <p className="font-medium text-ink-1">{other.name}</p>
                <p className="text-xs text-ink-4 mt-0.5">{other.bio?.slice(0, 60)}</p>
              </div>
            </div>

            {/* Skill exchange */}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-ink-5 uppercase tracking-wider mb-1.5">You offer</p>
                <SkillTag name={mySkill} />
              </div>
              <div className="text-center text-ink-4">⇄</div>
              <div>
                <p className="text-[10px] text-ink-5 uppercase tracking-wider mb-1.5">You receive</p>
                <span className="badge bg-surface-3 text-ink-3 border border-surface-4">{theirSkill}</span>
              </div>
            </div>

            {swap.message && (
              <div className="mt-4 pt-4 border-t border-surface-3">
                <p className="text-[10px] text-ink-5 uppercase tracking-wider mb-1.5">Message</p>
                <p className="text-sm text-ink-3 italic">"{swap.message}"</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 space-y-2">
              {swap.status === 'pending' && !isRequester && (
                <>
                  <button className="btn-primary w-full justify-center" onClick={() => handle('accept')} disabled={acting}>
                    Accept Swap
                  </button>
                  <button className="btn-danger w-full justify-center" onClick={() => handle('cancel')} disabled={acting}>
                    Reject
                  </button>
                </>
              )}
              {swap.status === 'accepted' && (
                <button className="btn-secondary w-full justify-center" onClick={() => handle('complete')} disabled={acting}>
                  Mark as Completed (+30 ◈)
                </button>
              )}
              {swap.status === 'completed' && (
                <button className="btn-primary w-full justify-center" onClick={() => setReviewModal(true)}>
                  Leave Review ★
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-3">
          <div className="card h-[520px] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-surface-2 flex items-center gap-3">
              <Avatar user={other} size="sm" />
              <div>
                <p className="text-sm font-medium">{other.name}</p>
                <p className="text-xs text-ink-5">{canChat ? 'Chat active' : 'Accept swap to enable chat'}</p>
              </div>
            </div>
            {canChat ? (
              <div className="flex-1 overflow-hidden">
                <ChatUI room={swap.chatRoom} otherUser={other} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center px-6">
                <div>
                  <p className="text-2xl mb-3 opacity-30">💬</p>
                  <p className="text-ink-4 text-sm">Chat will unlock once the swap is accepted</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review modal */}
      <Modal open={reviewModal} onClose={() => setReviewModal(false)} title={`Review ${other.name}`}>
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Rating</label>
            <StarRating value={reviewForm.rating} onChange={r => setReviewForm(p => ({ ...p, rating: r }))} size="lg" />
          </div>
          <div>
            <label className="label mb-1.5 block">Comment (optional)</label>
            <textarea className="input resize-none" rows={3}
              placeholder="Share your experience…"
              value={reviewForm.comment}
              onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => setReviewModal(false)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={submitReview} disabled={acting}>Submit Review</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
