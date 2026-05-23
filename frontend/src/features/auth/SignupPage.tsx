import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { useAuthStore } from './authStore';
import { queryClient } from '../../lib/queryClient';
import { QUERY_KEYS } from '../../lib/constants';

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
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topics });
      await queryClient.invalidateQueries({ queryKey: ['topic'] });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Sign up failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { label: 'NAME',     value: name,     setter: setName,     type: 'text',     placeholder: 'Your name' },
    { label: 'EMAIL',    value: email,    setter: setEmail,    type: 'email',    placeholder: 'you@example.com' },
    { label: 'PASSWORD', value: password, setter: setPassword, type: 'password', placeholder: 'Min 8 chars, 1 upper, 1 number' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-app">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-syne font-extrabold text-2xl tracking-tight text-prose">
            Code<span className="text-accent">Path</span>
          </h1>
          <p className="text-sm mt-1 text-muted">Create your account and start tracking</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-4 bg-surface border border-dim">
          {fields.map(({ label, value, setter, type, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-mono-dm mb-1.5 text-muted">{label}</label>
              <input
                type={type}
                required
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors bg-surface-2 border border-dim text-prose focus:border-accent"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-60 bg-accent text-white hover:opacity-90"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent no-underline hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
