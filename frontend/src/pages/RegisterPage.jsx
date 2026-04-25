import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui';

const POPULAR_SKILLS = [
  'JavaScript','Python','React','UI/UX Design','Figma','Node.js',
  'Data Analysis','Machine Learning','Photography','Writing',
  'SEO','Marketing','Spanish','French','Guitar','Video Editing',
  'SQL','Docker','TypeScript','Go',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    bio: '', location: '',
    skillsOffered: [],
    skillsWanted: [],
    customOffer: '',
    customWant: '',
  });

  const addSkillOffered = (skill) => {
    if (!form.skillsOffered.find(s => s.name === skill)) {
      setForm(p => ({ ...p, skillsOffered: [...p.skillsOffered, { name: skill }] }));
    }
  };
  const addSkillWanted = (skill) => {
    if (!form.skillsWanted.find(s => s.name === skill)) {
      setForm(p => ({ ...p, skillsWanted: [...p.skillsWanted, { name: skill }] }));
    }
  };
  const removeOffered = (name) => setForm(p => ({ ...p, skillsOffered: p.skillsOffered.filter(s => s.name !== name) }));
  const removeWanted = (name) => setForm(p => ({ ...p, skillsWanted: p.skillsWanted.filter(s => s.name !== name) }));

  const handleStep1 = () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.email.trim()) return toast.error('Email is required');
    if (!form.password || form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setStep(2);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        bio: form.bio.trim(),
        location: form.location.trim(),
        skillsOffered: form.skillsOffered,
        skillsWanted: form.skillsWanted,
      });
      // navigate AFTER register sets user state - ProtectedRoute will allow through
      navigate('/discover', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      // If it's a duplicate email, go back to step 1
      if (err.response?.status === 409) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface-0 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">S</div>
          <h1 className="text-2xl font-semibold text-ink-1">Join SkillSwap</h1>
          <p className="text-sm text-ink-4 mt-1">Exchange skills. Earn credits. Grow together.</p>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-colors duration-300 ${step >= s ? 'bg-accent' : 'bg-surface-3'}`} />
          ))}
        </div>

        <div className="card p-6">
          {/* Step 1: Basic info */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-medium text-ink-1 mb-4">Basic Information</h2>
              <div>
                <label className="label mb-1.5 block">Full Name *</label>
                <input className="input" placeholder="Alex Johnson" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleStep1()}
                  autoFocus />
              </div>
              <div>
                <label className="label mb-1.5 block">Email *</label>
                <input type="email" className="input" placeholder="alex@example.com" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleStep1()} />
              </div>
              <div>
                <label className="label mb-1.5 block">Password *</label>
                <input type="password" className="input" placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleStep1()} />
              </div>
              <div>
                <label className="label mb-1.5 block">Location <span className="text-ink-5 normal-case font-normal">(optional)</span></label>
                <input className="input" placeholder="City, Country" value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div>
                <label className="label mb-1.5 block">Short Bio <span className="text-ink-5 normal-case font-normal">(optional)</span></label>
                <textarea className="input resize-none" rows={2} placeholder="Tell people about yourself…"
                  value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
              </div>
              <button className="btn-primary w-full justify-center py-2.5 mt-2" onClick={handleStep1}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Skills offered */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-medium text-ink-1 mb-1">What can you teach?</h2>
              <p className="text-sm text-ink-4 mb-4">Select skills you're comfortable sharing <span className="text-ink-5">(optional — you can add later)</span></p>

              <div className="flex gap-2">
                <input className="input flex-1 text-sm" placeholder="Add a custom skill…"
                  value={form.customOffer}
                  onChange={e => setForm(p => ({ ...p, customOffer: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && form.customOffer.trim()) {
                      addSkillOffered(form.customOffer.trim());
                      setForm(p => ({ ...p, customOffer: '' }));
                    }
                  }} />
                <button className="btn-secondary text-sm px-3"
                  onClick={() => {
                    if (form.customOffer.trim()) {
                      addSkillOffered(form.customOffer.trim());
                      setForm(p => ({ ...p, customOffer: '' }));
                    }
                  }}>Add</button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.map(s => (
                  <button key={s} type="button" onClick={() => addSkillOffered(s)}
                    className={`badge border cursor-pointer transition-colors text-xs ${
                      form.skillsOffered.find(x => x.name === s)
                        ? 'bg-accent/20 text-accent-light border-accent/40'
                        : 'bg-surface-3 text-ink-3 border-surface-4 hover:border-accent/30 hover:text-ink-2'
                    }`}>
                    {form.skillsOffered.find(x => x.name === s) ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>

              {form.skillsOffered.length > 0 && (
                <div>
                  <p className="label mb-1.5">Selected ({form.skillsOffered.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.skillsOffered.map(s => (
                      <span key={s.name} className="skill-tag cursor-pointer text-xs" onClick={() => removeOffered(s.name)}>
                        {s.name} ✕
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <button className="btn-secondary flex-1" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary flex-1 justify-center" onClick={() => setStep(3)}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Skills wanted + submit */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-medium text-ink-1 mb-1">What do you want to learn?</h2>
              <p className="text-sm text-ink-4 mb-4">Select skills you'd like to acquire <span className="text-ink-5">(optional)</span></p>

              <div className="flex gap-2">
                <input className="input flex-1 text-sm" placeholder="Add a skill you want…"
                  value={form.customWant}
                  onChange={e => setForm(p => ({ ...p, customWant: e.target.value }))}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && form.customWant.trim()) {
                      addSkillWanted(form.customWant.trim());
                      setForm(p => ({ ...p, customWant: '' }));
                    }
                  }} />
                <button className="btn-secondary text-sm px-3"
                  onClick={() => {
                    if (form.customWant.trim()) {
                      addSkillWanted(form.customWant.trim());
                      setForm(p => ({ ...p, customWant: '' }));
                    }
                  }}>Add</button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.map(s => (
                  <button key={s} type="button" onClick={() => addSkillWanted(s)}
                    className={`badge border cursor-pointer transition-colors text-xs ${
                      form.skillsWanted.find(x => x.name === s)
                        ? 'bg-surface-3 text-ink-1 border-ink-4'
                        : 'bg-surface-3 text-ink-3 border-surface-4 hover:border-ink-4 hover:text-ink-2'
                    }`}>
                    {form.skillsWanted.find(x => x.name === s) ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>

              {form.skillsWanted.length > 0 && (
                <div>
                  <p className="label mb-1.5">Selected ({form.skillsWanted.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.skillsWanted.map(s => (
                      <span key={s.name} className="badge bg-surface-3 text-ink-3 border border-surface-4 cursor-pointer text-xs"
                        onClick={() => removeWanted(s.name)}>
                        {s.name} ✕
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-accent/5 border border-accent/20 rounded-xl p-3 text-xs text-ink-3">
                🎁 You'll start with <strong className="text-credit">100 credits</strong> — use them to join sessions
              </div>

              <div className="flex gap-2 mt-2">
                <button className="btn-secondary flex-1" onClick={() => setStep(2)} disabled={loading}>← Back</button>
                <button className="btn-primary flex-1 justify-center" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : 'Create Account ✓'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-ink-4 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-light hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
