import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui';

const DEMO = { email: 'demo@gmail.com', password: 'demo@1234' };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const doLogin = async (email, password) => {
    try {
      setLoading(true);
      await login(email, password);
      navigate('/discover');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill in all fields');
    doLogin(form.email, form.password);
  };

  // Instantly fill the demo credentials and sign in.
  const useDemo = () => {
    setForm(DEMO);
    doLogin(DEMO.email, DEMO.password);
  };

  return (
    <div className="min-h-dvh bg-surface-0 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">S</div>
          <h1 className="text-2xl font-semibold text-ink-1">Welcome back</h1>
          <p className="text-sm text-ink-4 mt-1">Sign in to your SkillSwap account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label mb-1.5 block">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="label mb-1.5 block">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-2.5 mt-2" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-4 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-light hover:underline">Sign up</Link>
        </p>

        {/* Demo account — one click to explore */}
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 divider" />
            <span className="text-xs text-ink-5">or</span>
            <div className="flex-1 divider" />
          </div>
          <button
            type="button"
            onClick={useDemo}
            disabled={loading}
            className="btn-secondary w-full justify-center py-2.5"
          >
            ✦ Try the demo account
          </button>
          <p className="text-center text-xs text-ink-5 mt-2">
            Loads <span className="font-mono text-ink-4">{DEMO.email}</span> and signs in instantly
          </p>
        </div>
      </div>
    </div>
  );
}
