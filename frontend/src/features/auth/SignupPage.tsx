import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { useAuthStore } from './authStore';

export function SignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.signup({ name, email, password });
      setAuth(data.user, data.accessToken);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Sign up failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-syne font-extrabold text-2xl tracking-tight">
            Code<span style={{ color: 'var(--accent)' }}>Path</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Create your account and start tracking
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-6 space-y-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {[
            { label: 'NAME', value: name, setter: setName, type: 'text', placeholder: 'Priyansu Choudhury' },
            { label: 'EMAIL', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com' },
            { label: 'PASSWORD', value: password, setter: setPassword, type: 'password', placeholder: 'Min 8 chars, 1 upper, 1 number' },
          ].map(({ label, value, setter, type, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-mono-dm mb-1.5" style={{ color: 'var(--muted)' }}>
                {label}
              </label>
              <input
                type={type}
                required
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-4" style={{ color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
