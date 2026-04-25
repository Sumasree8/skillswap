import { useState, useEffect } from 'react';
import { circlesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar, StatusBadge, CreditBadge, Spinner, EmptyState, Modal, toast } from '../components/ui';
import { formatDate, timeAgo } from '../utils/helpers';

export default function CirclesPage() {
  const { user } = useAuth();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('browse');
  const [myCircles, setMyCircles] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [acting, setActing] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', skill: '',
    maxMembers: 10, creditCostPerMember: 10,
    scheduledAt: '', tags: '',
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [all, my] = await Promise.all([circlesApi.getAll(), circlesApi.getMy()]);
      setCircles(all.data.circles);
      setMyCircles(my.data.circles);
    } catch (_) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const join = async (id) => {
    try {
      setActing(id);
      await circlesApi.join(id);
      toast.success('Joined circle!');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    } finally { setActing(null); }
  };

  const create = async () => {
    if (!form.title || !form.skill || !form.scheduledAt) return toast.error('Fill required fields');
    try {
      setActing('create');
      await circlesApi.create({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
      toast.success('Circle created!');
      setCreateModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally { setActing(null); }
  };

  const displayList = tab === 'browse' ? circles : myCircles;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Learning Circles</h1>
          <p className="text-sm text-ink-4 mt-0.5">Group sessions hosted by experts</p>
        </div>
        <button className="btn-primary text-sm" onClick={() => setCreateModal(true)}>+ Host Circle</button>
      </div>

      <div className="flex gap-1 mb-6 bg-surface-2 p-1 rounded-xl w-fit">
        {[['browse','Browse'],['my','My Circles']].map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === v ? 'bg-surface-0 text-ink-1' : 'text-ink-4 hover:text-ink-2'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : displayList.length === 0 ? (
        <EmptyState icon="◎" title="No circles found" description="Be the first to host a learning circle!" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayList.map(circle => {
            const isHost = circle.host?._id === user?._id;
            const joined = circle.members?.some(m => m._id === user?._id || m === user?._id);
            const full = circle.members?.length >= circle.maxMembers;
            return (
              <div key={circle._id} className="card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <StatusBadge status={circle.status} />
                  <CreditBadge balance={circle.creditCostPerMember} />
                </div>
                <h3 className="font-semibold text-ink-1 mb-1">{circle.title}</h3>
                <p className="text-xs text-accent-light mb-2">{circle.skill}</p>
                {circle.description && <p className="text-sm text-ink-4 mb-3 line-clamp-2">{circle.description}</p>}

                <div className="flex items-center gap-2 mb-4">
                  <Avatar user={circle.host} size="sm" />
                  <div>
                    <p className="text-xs text-ink-3">{circle.host?.name}</p>
                    <p className="text-xs text-ink-5">{formatDate(circle.scheduledAt, 'MMM d · h:mm a')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-surface-3">
                  <span className="text-xs text-ink-5">
                    {circle.members?.length ?? 0}/{circle.maxMembers} members
                  </span>
                  {!isHost && !joined && circle.status === 'open' && (
                    <button className="btn-primary text-xs py-1.5 px-3" disabled={!!acting || full}
                      onClick={() => join(circle._id)}>
                      {acting === circle._id ? '…' : full ? 'Full' : 'Join'}
                    </button>
                  )}
                  {(isHost || joined) && (
                    <span className="badge bg-accent/10 text-accent-light border border-accent/20 text-xs">
                      {isHost ? 'Host' : 'Joined'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Host a Learning Circle">
        <div className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Title *</label>
            <input className="input" placeholder="e.g. Intro to Machine Learning"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} autoFocus />
          </div>
          <div>
            <label className="label mb-1.5 block">Skill *</label>
            <input className="input" placeholder="e.g. Machine Learning"
              value={form.skill} onChange={e => setForm(p => ({ ...p, skill: e.target.value }))} />
          </div>
          <div>
            <label className="label mb-1.5 block">Description</label>
            <textarea className="input resize-none" rows={2}
              placeholder="What will attendees learn?"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label mb-1.5 block">Max Members</label>
              <input type="number" className="input" min={2} max={50}
                value={form.maxMembers} onChange={e => setForm(p => ({ ...p, maxMembers: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label mb-1.5 block">Credits/member</label>
              <input type="number" className="input" min={5} max={100}
                value={form.creditCostPerMember} onChange={e => setForm(p => ({ ...p, creditCostPerMember: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label mb-1.5 block">Scheduled At *</label>
              <input type="datetime-local" className="input text-xs"
                value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => setCreateModal(false)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={create} disabled={!!acting}>
              {acting === 'create' ? 'Creating…' : 'Create Circle'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
