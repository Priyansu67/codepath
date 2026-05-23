import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Check, Undo2 } from 'lucide-react';
import { topicsApi } from '../../api/topics';
import { progressApi } from '../../api/progress';
import { ProblemRow } from './ProblemRow';
import { UserMenu } from '../../components/UserMenu';
import { TopicIcon } from '../../components/TopicIcon';
import { QUERY_KEYS } from '../../lib/constants';
import type { Problem } from '../../types';

type Filter = 'all' | 'easy' | 'medium' | 'hard' | 'solved' | 'unsolved';

const filterCls: Record<Filter, { active: string; inactive: string }> = {
  all:      { active: 'border-accent bg-accent text-white',          inactive: 'border-dim text-muted' },
  easy:     { active: 'border-easy bg-easy/15 text-easy',            inactive: 'border-dim text-muted' },
  medium:   { active: 'border-medium bg-medium/15 text-medium',      inactive: 'border-dim text-muted' },
  hard:     { active: 'border-hard bg-hard/15 text-hard',            inactive: 'border-dim text-muted' },
  solved:   { active: 'border-accent bg-accent text-white',          inactive: 'border-dim text-muted' },
  unsolved: { active: 'border-accent bg-accent text-white',          inactive: 'border-dim text-muted' },
};

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const { data: allTopics = [] } = useQuery({
    queryKey: QUERY_KEYS.topics,
    queryFn: topicsApi.getAll,
  });

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.topic(slug!),
    queryFn: () => topicsApi.getBySlug(slug!),
    enabled: !!slug,
  });

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
      if (isCompleted) {
        toast.success('Marked as solved', { icon: <Check size={16} strokeWidth={2.5} className="text-easy" /> });
      } else {
        toast('Marked as unsolved', { icon: <Undo2 size={16} strokeWidth={2.5} className="text-muted" /> });
      }
      qc.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.topics });
    },
  });

  const filteredProblems = useMemo(() => {
    return (data?.problems ?? []).filter((p) => {
      const matchFilter =
        activeFilter === 'all'      ? true
        : activeFilter === 'solved'   ? !!p.isCompleted
        : activeFilter === 'unsolved' ? !p.isCompleted
        : p.difficulty === activeFilter;
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [data?.problems, activeFilter, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Problem[]>();
    filteredProblems.forEach((p) => {
      if (!map.has(p.subtopic)) map.set(p.subtopic, []);
      map.get(p.subtopic)!.push(p);
    });
    return map;
  }, [filteredProblems]);

  const pct = data?.stats.percentage ?? 0;

  return (
    <div className="bg-app min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 bg-app/90 backdrop-blur-xl border-b border-dim">
        <Link to="/dashboard" className="font-syne font-extrabold text-lg sm:text-xl tracking-tight text-prose no-underline">
          Code<span className="text-accent">Path</span>
        </Link>

        <UserMenu />
      </header>

      {/* Mobile topic selector */}
      <div className="lg:hidden px-4 py-2.5 border-b border-dim bg-surface">
        <select
          value={slug}
          onChange={(e) => navigate(`/topics/${e.target.value}`)}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none bg-surface-2 border border-dim text-prose"
        >
          {allTopics.map((t) => (
            <option key={t._id} value={t.slug}>
              {t.title} · {t.stats?.completed ?? 0}/{t.stats?.total ?? 0}
            </option>
          ))}
        </select>
      </div>

      {/* Body */}
      <div className="max-w-screen-xl mx-auto">
        <div className="lg:grid" style={{ gridTemplateColumns: '260px 1fr' }}>

          {/* Sidebar — desktop only */}
          <nav className="hidden lg:block py-6 pr-6 sticky top-20 h-fit">
            <div className="text-xs font-mono-dm uppercase tracking-widest mb-3 px-2 text-muted">
              Topics
            </div>
            {allTopics.map((t) => {
              const isActive = t.slug === slug;
              const topicPct = t.stats?.percentage ?? 0;
              return (
                <div key={t._id} className="mb-0.5">
                  <Link
                    to={`/topics/${t.slug}`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all no-underline border ${
                      isActive
                        ? 'text-prose bg-surface-2 border-dim'
                        : 'text-muted bg-transparent border-transparent hover:text-prose'
                    }`}
                  >
                    <TopicIcon title={t.title} slug={t.slug} size="sm" />
                    <span className="flex-1 text-[0.83rem]">{t.title}</span>
                    <span className="font-mono-dm text-xs text-muted">
                      {t.stats?.completed ?? 0}/{t.stats?.total ?? 0}
                    </span>
                  </Link>
                  <div className="mx-3 mt-0.5 mb-1.5">
                    <div className="rounded-full overflow-hidden h-[3px] bg-dim">
                      <div
                        className="h-full rounded-full progress-fill bg-accent-3"
                        style={{ width: `${topicPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Content */}
          <div className="py-4 sm:py-6 px-4 sm:px-6 lg:border-l lg:border-dim">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl animate-pulse bg-surface" />
                ))}
              </div>
            ) : data ? (
              <>
                {/* Topic header */}
                <div className="pb-4 mb-4 border-b border-dim">
                  <div className="flex items-center gap-3">
                    <TopicIcon title={data.topic.title} slug={data.topic.slug} size="lg" />
                    <h1 className="font-syne font-bold text-xl sm:text-2xl tracking-tight text-prose">
                      {data.topic.title}
                    </h1>
                  </div>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span className="text-xs px-2.5 py-1 rounded-full font-mono-dm border border-dim text-muted">
                      {data.stats.total} problems
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full overflow-hidden bg-dim" style={{ width: 80, height: 4 }}>
                        <div
                          className="h-full rounded-full progress-fill bg-accent-3"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted">
                        {data.stats.completed}/{data.stats.total} solved
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter bar */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(['all', 'easy', 'medium', 'hard', 'unsolved', 'solved'] as Filter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`text-xs px-3 py-1.5 rounded-full font-mono-dm transition-all border ${
                        activeFilter === f ? filterCls[f].active : filterCls[f].inactive
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                  <input
                    type="text"
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="text-sm px-3 py-1.5 rounded-lg outline-none w-full sm:w-40 sm:ml-auto bg-surface border border-dim text-prose focus:border-accent transition-colors"
                  />
                </div>

                {/* Problems grouped by subtopic */}
                {grouped.size === 0 ? (
                  <div className="py-12 text-center text-sm text-muted">
                    No problems match your filter.
                  </div>
                ) : (
                  Array.from(grouped.entries()).map(([subtopic, problems]) => (
                    <div key={subtopic} className="animate-fade-up">
                      <div className="flex items-center gap-2 px-4 pt-4 pb-2 font-syne text-xs uppercase tracking-widest text-muted">
                        <span>{subtopic}</span>
                        <div className="flex-1 h-px bg-dim" />
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
    </div>
  );
}
