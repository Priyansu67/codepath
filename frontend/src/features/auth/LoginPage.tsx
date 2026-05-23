import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { useAuthStore } from './authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      setAuth(data.user, data.accessToken);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-app">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-syne font-extrabold text-2xl tracking-tight text-prose">
            Code<span className="text-accent">Path</span>
          </h1>
          <p className="text-sm mt-1 text-muted">Sign in to track your progress</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-6 space-y-4 bg-surface border border-dim"
        >
          <div>
            <label className="block text-xs font-mono-dm mb-1.5 text-muted">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors bg-surface-2 border border-dim text-prose focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-dm mb-1.5 text-muted">PASSWORD</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors bg-surface-2 border border-dim text-prose focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60 bg-accent text-white hover:opacity-90"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-muted">
          No account?{' '}
          <Link to="/signup" className="text-accent no-underline hover:underline">
            Sign up
          </Link>
        </p>

        <p className="text-center text-xs mt-3 font-mono-dm text-muted">
          demo@codepath.com / Demo@1234
        </p>
      </div>
    </div>
  );
}
