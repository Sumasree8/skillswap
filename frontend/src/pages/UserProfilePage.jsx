import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi, reviewsApi } from '../services/api';
import { Avatar, SkillTag, StarRating, CreditBadge, Spinner, toast } from '../components/ui';
import { swapsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getAvgRating, timeAgo } from '../utils/helpers';

export default function UserProfilePage() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swapForm, setSwapForm] = useState({ show: false, requesterSkill: '', receiverSkill: '', message: '' });
  const [acting, setActing] = useState(false);

  useEffect(() => {
    Promise.all([usersApi.getById(id), reviewsApi.getByUser(id)])
      .then(([u, r]) => { setProfile(u.data.user); setReviews(r.data.reviews); })
      .catch(() => navigate('/discover'))
      .finally(() => setLoading(false));
  }, [id]);

  const requestSwap = async () => {
    if (!swapForm.requesterSkill || !swapForm.receiverSkill) return toast.error('Select both skills');
    try {
      setActing(true);
      await swapsApi.request({ receiverId: id, requesterSkill: swapForm.requesterSkill, receiverSkill: swapForm.receiverSkill, message: swapForm.message });
      toast.success('Swap request sent!');
      setSwapForm(p => ({ ...p, show: false }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally { setActing(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!profile) return null;

  const avg = getAvgRating(profile.rating, profile.ratingCount);

  return (
    <div className="page-container max-w-3xl">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm mb-4 -ml-2">← Back</button>

      <div className="card p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar user={profile} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{profile.name}</h1>
                {profile.isOnline && <span className="w-2 h-2 rounded-full bg-success" title="Online" />}
              </div>
              {profile.location && <p className="text-sm text-ink-4 mt-0.5">📍 {profile.location}</p>}
              {avg && <div className="flex items-center gap-1 mt-1"><StarRating value={Math.round(avg)} readonly size="sm" /><span className="text-xs text-ink-4">{avg} ({profile.ratingCount})</span></div>}
              {profile.bio && <p className="text-sm text-ink-3 mt-2 leading-relaxed">{profile.bio}</p>}
            </div>
          </div>
          {profile._id !== me?._id && (
            <button className="btn-primary text-sm shrink-0" onClick={() => setSwapForm(p => ({ ...p, show: !p.show }))}>
              ⇄ Swap
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-surface-3">
          {[['Swaps', profile.swapsCompleted||0],['Sessions',profile.sessionsCompleted||0],['Reviews',profile.ratingCount||0]].map(([l,v]) => (
            <div key={l} className="text-center">
              <p className="text-lg font-bold">{v}</p>
              <p className="text-xs text-ink-5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Swap request form */}
      {swapForm.show && (
        <div className="card p-5 mb-5 border-accent/20 animate-slide-up">
          <h3 className="font-medium mb-4">Request a Swap with {profile.name}</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="label mb-1.5 block">Your skill</label>
              <select className="input" value={swapForm.requesterSkill} onChange={e => setSwapForm(p => ({ ...p, requesterSkill: e.target.value }))}>
                <option value="">Select…</option>
                {me?.skillsOffered?.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Their skill</label>
              <select className="input" value={swapForm.receiverSkill} onChange={e => setSwapForm(p => ({ ...p, receiverSkill: e.target.value }))}>
                <option value="">Select…</option>
                {profile.skillsOffered?.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <textarea className="input resize-none mb-3" rows={2} placeholder="Optional message…"
            value={swapForm.message} onChange={e => setSwapForm(p => ({ ...p, message: e.target.value }))} />
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => setSwapForm(p => ({ ...p, show: false }))}>Cancel</button>
            <button className="btn-primary flex-1" onClick={requestSwap} disabled={acting}>
              {acting ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <h2 className="font-medium mb-3">Offers</h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.skillsOffered?.map(s => <SkillTag key={s.name} name={s.name} verified={s.verified} small />)}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-medium mb-3">Wants to Learn</h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.skillsWanted?.map(s => <span key={s.name} className="badge bg-surface-3 text-ink-3 border border-surface-4 text-xs">{s.name}</span>)}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="card p-5">
        <h2 className="font-medium mb-4">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? <p className="text-sm text-ink-5">No reviews yet</p> : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r._id} className="pb-4 border-b border-surface-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar user={r.reviewer} size="sm" />
                  <span className="text-sm font-medium">{r.reviewer?.name}</span>
                  <StarRating value={r.rating} readonly size="sm" />
                  <span className="text-xs text-ink-5 ml-auto">{timeAgo(r.createdAt)}</span>
                </div>
                {r.comment && <p className="text-sm text-ink-3 leading-relaxed pl-9">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
