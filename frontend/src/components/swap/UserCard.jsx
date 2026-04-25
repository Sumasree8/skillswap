import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, SkillTag, MatchScoreBadge, Modal, toast } from '../ui';
import { getAvgRating } from '../../utils/helpers';
import { swapsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const UserCard = ({ user, matchScore = 0, matchedSkills = [] }) => {
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [swapModal, setSwapModal] = useState(false);
  const [form, setForm] = useState({ requesterSkill: '', receiverSkill: '', message: '' });
  const [loading, setLoading] = useState(false);

  const avgRating = getAvgRating(user.rating, user.ratingCount);

  const handleRequestSwap = async () => {
    if (!form.requesterSkill || !form.receiverSkill) {
      toast.error('Please select skills for both sides');
      return;
    }
    try {
      setLoading(true);
      await swapsApi.request({
        receiverId: user._id,
        requesterSkill: form.requesterSkill,
        receiverSkill: form.receiverSkill,
        message: form.message,
      });
      toast.success('Swap request sent!');
      setSwapModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card-hover p-5 cursor-pointer group" onClick={() => navigate(`/users/${user._id}`)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar user={user} size="lg" />
            <div>
              <h3 className="font-semibold text-ink-1 group-hover:text-accent-light transition-colors">{user.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {avgRating && (
                  <span className="flex items-center gap-1 text-xs text-credit">
                    ★ {avgRating}
                    <span className="text-ink-5">({user.ratingCount})</span>
                  </span>
                )}
                {user.location && <span className="text-xs text-ink-5">· {user.location}</span>}
              </div>
            </div>
          </div>
          {matchScore > 0 && <MatchScoreBadge score={matchScore} />}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-ink-4 mb-4 line-clamp-2 leading-relaxed">{user.bio}</p>
        )}

        {/* Skills offered */}
        {user.skillsOffered?.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] text-ink-5 uppercase tracking-wider mb-1.5">Offers</p>
            <div className="flex flex-wrap gap-1.5">
              {user.skillsOffered.slice(0, 4).map((s) => (
                <SkillTag key={s.name} name={s.name} verified={s.verified} small />
              ))}
              {user.skillsOffered.length > 4 && (
                <span className="badge bg-surface-3 text-ink-5 text-xs">+{user.skillsOffered.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Skills wanted */}
        {user.skillsWanted?.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] text-ink-5 uppercase tracking-wider mb-1.5">Wants</p>
            <div className="flex flex-wrap gap-1.5">
              {user.skillsWanted.slice(0, 3).map((s) => (
                <span key={s.name} className="badge bg-surface-3 text-ink-4 border border-surface-4 text-xs">{s.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-surface-3" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn-primary flex-1 text-xs py-2"
            onClick={() => setSwapModal(true)}
          >
            ⇄ Request Swap
          </button>
          <button
            className="btn-secondary text-xs py-2 px-3"
            onClick={() => navigate(`/users/${user._id}`)}
          >
            View
          </button>
        </div>
      </div>

      {/* Swap Request Modal */}
      <Modal open={swapModal} onClose={() => setSwapModal(false)} title={`Swap with ${user.name}`}>
        <div className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Your skill to offer</label>
            <select
              className="input"
              value={form.requesterSkill}
              onChange={(e) => setForm((p) => ({ ...p, requesterSkill: e.target.value }))}
            >
              <option value="">Select a skill you offer</option>
              {me?.skillsOffered?.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label mb-1.5 block">Skill you want from {user.name}</label>
            <select
              className="input"
              value={form.receiverSkill}
              onChange={(e) => setForm((p) => ({ ...p, receiverSkill: e.target.value }))}
            >
              <option value="">Select a skill to learn</option>
              {user.skillsOffered?.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label mb-1.5 block">Message (optional)</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Introduce yourself..."
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button className="btn-secondary flex-1" onClick={() => setSwapModal(false)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={handleRequestSwap} disabled={loading}>
              {loading ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
