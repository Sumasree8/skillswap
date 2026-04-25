import { useState, useEffect } from 'react';
import { sessionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar, StatusBadge, CreditBadge, Spinner, EmptyState, Modal, toast } from '../components/ui';
import { timeAgo } from '../utils/helpers';

const TABS = ['browse', 'my'];

export default function SessionsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('browse');
  const [sessions, setSessions] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ skill: '', description: '', type: 'instant', creditCost: 20 });
  const [acting, setActing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [open, my] = await Promise.all([sessionsApi.getOpen(), sessionsApi.getMy()]);
        setSessions(open.data.sessions);
        setMySessions(my.data.sessions);
      } catch (_) {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const joinSession = async (sessionId) => {
    try {
      setActing(sessionId);
      await sessionsApi.join(sessionId);
      toast.success('Joined session! Credits deducted.');
      const [open, my] = await Promise.all([sessionsApi.getOpen(), sessionsApi.getMy()]);
      setSessions(open.data.sessions);
      setMySessions(my.data.sessions);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    } finally {
      setActing(null);
    }
  };

  const createSession = async () => {
    if (!form.skill) return toast.error('Skill is required');
    try {
      setActing('create');
      await sessionsApi.create(form);
      toast.success('Session created!');
      setCreateModal(false);
      const [open, my] = await Promise.all([sessionsApi.getOpen(), sessionsApi.getMy()]);
      setSessions(open.data.sessions);
      setMySessions(my.data.sessions);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setActing(null);
    }
  };

  const completeSession = async (id) => {
    try {
      setActing(id);
      await sessionsApi.complete(id);
      toast.success('Session completed! Credits earned.');
      const my = await sessionsApi.getMy();
      setMySessions(my.data.sessions);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink-1">Sessions</h1>
          <p className="text-sm text-ink-4 mt-0.5">15-minute micro-learning sessions</p>
        </div>
        <button className="btn-primary text-sm" onClick={() => setCreateModal(true)}>
          + Offer Session
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-2 p-1 rounded-xl w-fit">
        {[['browse', 'Browse'], ['my', 'My Sessions']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === val ? 'bg-surface-0 text-ink-1' : 'text-ink-4 hover:text-ink-2'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : tab === 'browse' ? (
        sessions.length === 0 ? (
          <EmptyState icon="⚡" title="No open sessions" description="Be the first to offer a session!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map(session => (
              <div key={session._id} className="card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar user={session.mentor} size="md" />
                    <div>
                      <p className="font-medium text-ink-1 text-sm">{session.mentor?.name}</p>
                      <p className="text-xs text-ink-5">{session.mentor?.rating ? (session.mentor.rating / session.mentor.ratingCount).toFixed(1) : 'New'} ★</p>
                    </div>
                  </div>
                  <CreditBadge balance={session.creditCost} />
                </div>
                <h3 className="font-semibold text-ink-1 mb-1">{session.skill}</h3>
                {session.description && <p className="text-sm text-ink-4 mb-3 line-clamp-2">{session.description}</p>}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-3">
                  <span className="text-xs text-ink-5 flex items-center gap-1">
                    ⏱ {session.duration} min · {session.type}
                  </span>
                  <button
                    className="btn-primary text-xs py-1.5 px-3"
                    disabled={!!acting || (user?.creditBalance ?? 0) < session.creditCost}
                    onClick={() => joinSession(session._id)}
                  >
                    {acting === session._id ? 'Joining…' : 'Join'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        mySessions.length === 0 ? (
          <EmptyState icon="⚡" title="No sessions yet" description="Join or create sessions to get started" />
        ) : (
          <div className="space-y-3">
            {mySessions.map(session => {
              const isMentor = session.mentor?._id === user?._id;
              return (
                <div key={session._id} className="card p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar user={isMentor ? session.learner : session.mentor} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink-1 text-sm">{session.skill}</span>
                        <StatusBadge status={session.status} />
                        <span className="badge bg-surface-3 text-ink-4 border border-surface-4 text-xs">
                          {isMentor ? 'Mentor' : 'Learner'}
                        </span>
                      </div>
                      <p className="text-xs text-ink-5 mt-0.5">
                        {isMentor ? `Learner: ${session.learner?.name ?? 'Waiting…'}` : `Mentor: ${session.mentor?.name}`}
                        {' · '}{timeAgo(session.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditBadge balance={session.creditCost} />
                    {isMentor && session.status === 'active' && (
                      <button className="btn-secondary text-xs py-1.5 px-3" disabled={!!acting}
                        onClick={() => completeSession(session._id)}>
                        {acting === session._id ? '…' : 'Complete'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Create Session Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Offer a Session">
        <div className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Skill to teach *</label>
            <input className="input" placeholder="e.g. React, Guitar, Python…"
              value={form.skill} onChange={e => setForm(p => ({ ...p, skill: e.target.value }))} autoFocus />
          </div>
          <div>
            <label className="label mb-1.5 block">Description</label>
            <textarea className="input resize-none" rows={2}
              placeholder="What will you cover in 15 minutes?"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1.5 block">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="instant">Instant</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="label mb-1.5 block">Credits</label>
              <input type="number" className="input" min={5} max={100}
                value={form.creditCost} onChange={e => setForm(p => ({ ...p, creditCost: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => setCreateModal(false)}>Cancel</button>
            <button className="btn-primary flex-1" onClick={createSession} disabled={!!acting}>
              {acting === 'create' ? 'Creating…' : 'Create Session'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
