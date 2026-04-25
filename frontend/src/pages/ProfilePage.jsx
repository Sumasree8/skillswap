import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi, reviewsApi } from '../services/api';
import { Avatar, SkillTag, StarRating, CreditBadge, Spinner, Modal, toast } from '../components/ui';
import { getAvgRating, timeAgo } from '../utils/helpers';

const POPULAR = ['JavaScript','Python','React','Node.js','Figma','UI/UX','Data Analysis','Machine Learning','Photography','Writing','Spanish','French','Guitar','Video Editing','SQL','Docker'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [verifyForm, setVerifyForm] = useState({ skillName: '', method: 'github', portfolioLink: '' });
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || [],
    customOffer: '', customWant: '',
  });

  useEffect(() => {
    if (user) {
      reviewsApi.getByUser(user._id)
        .then(({ data }) => setReviews(data.reviews))
        .catch(() => {});
    }
  }, [user?._id]);

  const saveProfile = async () => {
    try {
      setLoading(true);
      const { data } = await usersApi.updateProfile({
        name: form.name,
        bio: form.bio,
        location: form.location,
        skillsOffered: form.skillsOffered,
        skillsWanted: form.skillsWanted,
      });
      updateUser(data.user);
      toast.success('Profile updated!');
      setEditModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const verifySkill = async () => {
    try {
      setLoading(true);
      const { data } = await usersApi.verifySkill(verifyForm);
      updateUser(data.user);
      toast.success(`"${verifyForm.skillName}" verified!`);
      setVerifyModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const addOffered = (name) => {
    if (!form.skillsOffered.find(s => s.name === name)) {
      setForm(p => ({ ...p, skillsOffered: [...p.skillsOffered, { name }] }));
    }
  };
  const addWanted = (name) => {
    if (!form.skillsWanted.find(s => s.name === name)) {
      setForm(p => ({ ...p, skillsWanted: [...p.skillsWanted, { name }] }));
    }
  };

  const avg = getAvgRating(user?.rating, user?.ratingCount);

  return (
    <div className="page-container max-w-3xl">
      {/* Profile header */}
      <div className="card p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar user={user} size="xl" />
            <div>
              <h1 className="text-xl font-semibold text-ink-1">{user?.name}</h1>
              {user?.location && <p className="text-sm text-ink-4 mt-0.5">📍 {user.location}</p>}
              {user?.bio && <p className="text-sm text-ink-3 mt-1 max-w-sm leading-relaxed">{user.bio}</p>}
              <div className="flex items-center gap-3 mt-3">
                <CreditBadge balance={user?.creditBalance} />
                {avg && (
                  <span className="flex items-center gap-1 text-sm text-credit">
                    ★ {avg} <span className="text-ink-5 text-xs">({user?.ratingCount})</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="btn-secondary text-sm shrink-0" onClick={() => {
            setForm({ name: user?.name||'', bio: user?.bio||'', location: user?.location||'',
              skillsOffered: user?.skillsOffered||[], skillsWanted: user?.skillsWanted||[],
              customOffer:'', customWant:'' });
            setEditModal(true);
          }}>
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-surface-3">
          {[['Swaps', user?.swapsCompleted || 0], ['Sessions', user?.sessionsCompleted || 0], ['Reviews', user?.ratingCount || 0]]
            .map(([l, v]) => (
              <div key={l} className="text-center">
                <p className="text-lg font-bold text-ink-1">{v}</p>
                <p className="text-xs text-ink-5">{l}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-ink-1">Skills I Offer</h2>
            <button className="btn-ghost text-xs text-accent-light" onClick={() => setVerifyModal(true)}>Verify ✓</button>
          </div>
          {user?.skillsOffered?.length === 0 ? (
            <p className="text-sm text-ink-5">No skills added yet</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {user?.skillsOffered?.map(s => (
                <SkillTag key={s.name} name={s.name} verified={s.verified} level={s.level} />
              ))}
            </div>
          )}
        </div>
        <div className="card p-5">
          <h2 className="font-medium text-ink-1 mb-3">Skills I Want</h2>
          {user?.skillsWanted?.length === 0 ? (
            <p className="text-sm text-ink-5">No skills added yet</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {user?.skillsWanted?.map(s => (
                <span key={s.name} className="badge bg-surface-3 text-ink-3 border border-surface-4 text-xs">{s.name}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="card p-5">
        <h2 className="font-medium text-ink-1 mb-4">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-ink-5">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r._id} className="pb-4 border-b border-surface-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar user={r.reviewer} size="sm" />
                  <span className="text-sm font-medium text-ink-2">{r.reviewer?.name}</span>
                  <StarRating value={r.rating} readonly size="sm" />
                  <span className="text-xs text-ink-5 ml-auto">{timeAgo(r.createdAt)}</span>
                </div>
                {r.comment && <p className="text-sm text-ink-3 leading-relaxed pl-9">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Profile" maxWidth="max-w-xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Name</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label mb-1.5 block">Location</label>
              <input className="input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label mb-1.5 block">Bio</label>
            <textarea className="input resize-none" rows={2} value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
          </div>

          {/* Skills Offered */}
          <div>
            <label className="label mb-2 block">Skills I Offer</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1 text-sm" placeholder="Add skill…"
                value={form.customOffer} onChange={e => setForm(p => ({ ...p, customOffer: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter' && form.customOffer.trim()) { addOffered(form.customOffer.trim()); setForm(p => ({ ...p, customOffer: '' })); } }} />
              <button className="btn-secondary text-sm px-3"
                onClick={() => { if (form.customOffer.trim()) { addOffered(form.customOffer.trim()); setForm(p => ({ ...p, customOffer: '' })); } }}>+</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {POPULAR.map(s => (
                <button key={s} onClick={() => addOffered(s)}
                  className={`badge border text-xs cursor-pointer ${form.skillsOffered.find(x => x.name === s) ? 'bg-accent/20 text-accent-light border-accent/30' : 'bg-surface-3 text-ink-4 border-surface-4'}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.skillsOffered.map(s => (
                <span key={s.name} className="skill-tag cursor-pointer text-xs"
                  onClick={() => setForm(p => ({ ...p, skillsOffered: p.skillsOffered.filter(x => x.name !== s.name) }))}>
                  {s.name} ✕
                </span>
              ))}
            </div>
          </div>

          {/* Skills Wanted */}
          <div>
            <label className="label mb-2 block">Skills I Want</label>
            <div className="flex gap-2 mb-2">
              <input className="input flex-1 text-sm" placeholder="Add skill…"
                value={form.customWant} onChange={e => setForm(p => ({ ...p, customWant: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter' && form.customWant.trim()) { addWanted(form.customWant.trim()); setForm(p => ({ ...p, customWant: '' })); } }} />
              <button className="btn-secondary text-sm px-3"
                onClick={() => { if (form.customWant.trim()) { addWanted(form.customWant.trim()); setForm(p => ({ ...p, customWant: '' })); } }}>+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.skillsWanted.map(s => (
                <span key={s.name} className="badge bg-surface-3 text-ink-3 border border-surface-4 cursor-pointer text-xs"
                  onClick={() => setForm(p => ({ ...p, skillsWanted: p.skillsWanted.filter(x => x.name !== s.name) }))}>
                  {s.name} ✕
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="btn-secondary flex-1" onClick={() => setEditModal(false)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={saveProfile} disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Verify Skill Modal */}
      <Modal open={verifyModal} onClose={() => setVerifyModal(false)} title="Verify a Skill">
        <div className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Skill to verify</label>
            <select className="input" value={verifyForm.skillName}
              onChange={e => setVerifyForm(p => ({ ...p, skillName: e.target.value }))}>
              <option value="">Select skill</option>
              {user?.skillsOffered?.filter(s => !s.verified).map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label mb-1.5 block">Verification method</label>
            <select className="input" value={verifyForm.method}
              onChange={e => setVerifyForm(p => ({ ...p, method: e.target.value }))}>
              <option value="github">GitHub Link</option>
              <option value="portfolio">Portfolio Link</option>
              <option value="quiz">Quiz (auto)</option>
            </select>
          </div>
          {verifyForm.method !== 'quiz' && (
            <div>
              <label className="label mb-1.5 block">Link</label>
              <input className="input" placeholder="https://github.com/…"
                value={verifyForm.portfolioLink}
                onChange={e => setVerifyForm(p => ({ ...p, portfolioLink: e.target.value }))} />
            </div>
          )}
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => setVerifyModal(false)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={verifySkill} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify Skill ✓'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
