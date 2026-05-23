import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { topicsApi } from '../../api/topics';
import { progressApi } from '../../api/progress';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../auth/authStore';
import { TopicCard } from './TopicCard';
import { ProgressBar } from '../../components/ProgressBar';
import { QUERY_KEYS } from '../../lib/constants';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: QUERY_KEYS.topics,
    queryFn: topicsApi.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: progressApi.getStats,
  });

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    navigate('/login');
  }

  const overall = stats?.overall;
  const byDiff = stats?.byDifficulty;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 h-16"
        style={{
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="font-syne font-extrabold text-xl tracking-tight">
          Code<span style={{ color: 'var(--accent)' }}>Path</span>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Admin Panel
            </button>
          )}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
            >
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-medium">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent2)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-syne font-extrabold text-4xl tracking-tight leading-tight">
            Code
            <span
              style={{
                background: 'linear-gradient(90deg, var(--accent), var(--accent3))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Path
            </span>
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Track your progress across topics · Resume anytime
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Solved',
              value: overall?.completed ?? 0,
              sub: `of ${overall?.total ?? 0} problems`,
              accent: 'var(--accent)',
              cls: 'total',
            },
            {
              label: 'Easy',
              value: byDiff?.easy.completed ?? 0,
              sub: `of ${byDiff?.easy.total ?? 0} solved`,
              accent: 'var(--easy)',
              cls: 'easy',
            },
            {
              label: 'Medium',
              value: byDiff?.medium.completed ?? 0,
              sub: `of ${byDiff?.medium.total ?? 0} solved`,
              accent: 'var(--medium)',
              cls: 'medium',
            },
            {
              label: 'Hard',
              value: byDiff?.hard.completed ?? 0,
              sub: `of ${byDiff?.hard.total ?? 0} solved`,
              accent: 'var(--hard)',
              cls: 'hard',
            },
          ].map(({ label, value, sub, accent, cls }) => (
            <div
              key={cls}
              className="rounded-xl p-5 relative overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: accent }}
              />
              <div className="text-xs font-mono-dm uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                {label}
              </div>
              <div
                className="font-syne font-extrabold text-4xl mt-1 tracking-tight"
                style={{ color: cls === 'total' ? 'var(--text)' : accent }}
              >
                {value}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                {sub}
              </div>
            </div>
          ))}
        </div>

        {/* Overall progress bar */}
        <div
          className="rounded-xl p-5 mb-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="font-syne font-bold">Overall Progress</span>
            <span className="font-mono-dm text-sm" style={{ color: 'var(--muted)' }}>
              {overall?.percentage ?? 0}%
            </span>
          </div>
          <ProgressBar
            percentage={overall?.percentage ?? 0}
            segments={
              byDiff
                ? {
                    easy: byDiff.easy.completed,
                    medium: byDiff.medium.completed,
                    hard: byDiff.hard.completed,
                    total: overall?.total ?? 1,
                  }
                : undefined
            }
          />
        </div>

        {/* Topics grid */}
        <h2 className="font-syne font-bold text-lg mb-4">Topics</h2>
        {topicsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl h-40 animate-pulse"
                style={{ background: 'var(--surface)' }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <TopicCard key={topic._id} topic={topic} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
