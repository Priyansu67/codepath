import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { topicsApi } from '../../api/topics';
import { progressApi } from '../../api/progress';
import { useAuthStore } from '../auth/authStore';
import { authApi } from '../../api/auth';
import { ProblemRow } from './ProblemRow';
import { QUERY_KEYS } from '../../lib/constants';
import type { Problem } from '../../types';

type Filter = 'all' | 'easy' | 'medium' | 'hard' | 'solved' | 'unsolved';

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, logout } = useAuthStore();

  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  // Sidebar topics list
  const { data: allTopics = [] } = useQuery({
    queryKey: QUERY_KEYS.topics,
    queryFn: topicsApi.getAll,
  });

  // Current topic + problems
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.topic(slug!),
    queryFn: () => topicsApi.getBySlug(slug!),
    enabled: !!slug,
  });

  // Toggle progress (optimistic)
  const toggleMutation = useMutation({
    mutationFn: ({ problemId, isCompleted }: { problemId: string; isCompleted: boolean }) =>
      progressApi.toggle(problemId, isCompleted),

    onMutate: async ({ problemId, isCompleted }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.topic(slug!) });
      const prev = qc.getQueryData(QUERY_KEYS.topic(slug!));

      qc.setQueryData(QUERY_KEYS.topic(slug!), (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          problems: old.problems.map((p: Problem) =>
            p._id === problemId ? { ...p, isCompleted } : p
          ),
          stats: {
            ...old.stats,
            completed: old.problems.filter((p: Problem) =>
              p._id === problemId ? isCompleted : p.isCompleted
            ).length,
          },
        };
      });

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.topic(slug!), ctx.prev);
      toast.error('Could not save. Try again.');
    },

    onSuccess: (_, { isCompleted }) => {
      toast.success(isCompleted ? '✓ Marked as solved' : '↩ Marked as unsolved');
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.topics });
    },
  });

  const filteredProblems = useMemo(() => {
    return (data?.problems ?? []).filter((p) => {
      const matchFilter =
        activeFilter === 'all' ? true
        : activeFilter === 'solved' ? !!p.isCompleted
        : activeFilter === 'unsolved' ? !p.isCompleted
        : p.difficulty === activeFilter;
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [data?.problems, activeFilter, search]);

  // Group by subtopic
  const grouped = useMemo(() => {
    const map = new Map<string, Problem[]>();
    filteredProblems.forEach((p) => {
      if (!map.has(p.subtopic)) map.set(p.subtopic, []);
      map.get(p.subtopic)!.push(p);
    });
    return map;
  }, [filteredProblems]);

  async function handleLogout() {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  }

  const pct = data?.stats.percentage ?? 0;

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
        <Link to="/dashboard" className="font-syne font-extrabold text-xl tracking-tight" style={{ textDecoration: 'none', color: 'var(--text)' }}>
          Code<span style={{ color: 'var(--accent)' }}>Path</span>
        </Link>
        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
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
            <span className="font-medium text-sm">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div
        className="max-w-screen-xl mx-auto px-6 pb-16"
        style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '0', minHeight: 'calc(100vh - 64px)' }}
      >
        {/* Sidebar */}
        <nav
          className="py-6 pr-6"
          style={{ position: 'sticky', top: '80px', height: 'fit-content' }}
        >
          <div className="text-xs font-mono-dm uppercase tracking-widest mb-3 px-2" style={{ color: 'var(--muted)' }}>
            Topics
          </div>
          {allTopics.map((t) => {
            const isActive = t.slug === slug;
            const topicPct = t.stats?.percentage ?? 0;
            return (
              <div key={t._id} className="mb-0.5">
                <Link
                  to={`/topics/${t.slug}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    textDecoration: 'none',
                    color: isActive ? 'var(--text)' : 'var(--muted)',
                    background: isActive ? 'var(--surface2)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{t.icon}</span>
                  <span className="flex-1" style={{ fontSize: '0.83rem' }}>{t.title}</span>
                  <span className="font-mono-dm text-xs" style={{ color: 'var(--muted)' }}>
                    {t.stats?.completed ?? 0}/{t.stats?.total ?? 0}
                  </span>
                </Link>
                <div className="mx-3 mt-0.5 mb-1.5">
                  <div className="rounded-full overflow-hidden" style={{ height: 3, background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full progress-fill"
                      style={{ width: `${topicPct}%`, background: 'var(--accent3)' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Content */}
        <div className="py-6 pl-6" style={{ borderLeft: '1px solid var(--border)' }}>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
              ))}
            </div>
          ) : data ? (
            <>
              {/* Topic header */}
              <div className="pb-4 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
                  >
                    {data.topic.icon}
                  </div>
                  <h1 className="font-syne font-bold text-2xl tracking-tight">{data.topic.title}</h1>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-mono-dm"
                    style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
                  >
                    {data.stats.total} problems
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full overflow-hidden" style={{ width: 80, height: 4, background: 'var(--border)' }}>
                      <div className="h-full rounded-full progress-fill" style={{ width: `${pct}%`, background: 'var(--accent3)' }} />
                    </div>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {data.stats.completed}/{data.stats.total} solved
                    </span>
                  </div>
                </div>
              </div>

              {/* Filter bar */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {(['all', 'easy', 'medium', 'hard', 'unsolved', 'solved'] as Filter[]).map((f) => {
                  const isActive = activeFilter === f;
                  const colorMap: Record<string, string> = {
                    easy: 'var(--easy)', medium: 'var(--medium)', hard: 'var(--hard)',
                  };
                  const bg = isActive && colorMap[f]
                    ? `rgba(${f === 'easy' ? '106,255,212' : f === 'medium' ? '255,216,106' : '255,106,106'},.15)`
                    : isActive ? 'var(--accent)' : 'transparent';
                  return (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className="text-xs px-3 py-1.5 rounded-full font-mono-dm transition-all"
                      style={{
                        border: `1px solid ${isActive && colorMap[f] ? colorMap[f] : isActive ? 'var(--accent)' : 'var(--border)'}`,
                        background: bg,
                        color: isActive ? (colorMap[f] ?? '#fff') : 'var(--muted)',
                      }}
                    >
                      {f}
                    </button>
                  );
                })}
                <input
                  type="text"
                  placeholder="Search problems…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ml-auto text-sm px-3 py-1.5 rounded-lg outline-none"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    width: 180,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {/* Problems grouped by subtopic */}
              {grouped.size === 0 ? (
                <div className="py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
                  No problems match your filter.
                </div>
              ) : (
                Array.from(grouped.entries()).map(([subtopic, problems]) => (
                  <div key={subtopic} className="fade-up">
                    {/* Subtopic heading */}
                    <div
                      className="flex items-center gap-2 px-4 pt-4 pb-2 font-syne text-xs uppercase tracking-widest"
                      style={{ color: 'var(--muted)' }}
                    >
                      <span>{subtopic}</span>
                      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>
                    {problems.map((p) => (
                      <ProblemRow
                        key={p._id}
                        problem={p}
                        onToggle={(id, done) => toggleMutation.mutate({ problemId: id, isCompleted: done })}
                      />
                    ))}
                  </div>
                ))
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
