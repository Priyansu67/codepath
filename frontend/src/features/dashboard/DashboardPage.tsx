import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { topicsApi } from '../../api/topics';
import { progressApi } from '../../api/progress';
import { TopicCard } from './TopicCard';
import { ProgressBar } from '../../components/ProgressBar';
import { AppHeader } from '../../components/AppHeader';
import { useAuthStore } from '../auth/authStore';
import { QUERY_KEYS } from '../../lib/constants';

const statCards = [
  { label: 'Total Solved', barCls: 'bg-accent',  valCls: 'text-prose',  key: 'total'  as const },
  { label: 'Easy',         barCls: 'bg-easy',    valCls: 'text-easy',   key: 'easy'   as const },
  { label: 'Medium',       barCls: 'bg-medium',  valCls: 'text-medium', key: 'medium' as const },
  { label: 'Hard',         barCls: 'bg-hard',    valCls: 'text-hard',   key: 'hard'   as const },
];

export function DashboardPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: QUERY_KEYS.topics,
    queryFn: topicsApi.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: progressApi.getStats,
    enabled: isAuthenticated,
  });

  const overall = stats?.overall;
  const byDiff  = stats?.byDifficulty;

  function getVal(key: 'total' | 'easy' | 'medium' | 'hard') {
    if (key === 'total') return overall?.completed ?? 0;
    return byDiff?.[key].completed ?? 0;
  }
  function getSub(key: 'total' | 'easy' | 'medium' | 'hard') {
    if (key === 'total') return `of ${overall?.total ?? 0} problems`;
    return `of ${byDiff?.[key].total ?? 0} solved`;
  }

  return (
    <div className="bg-app min-h-screen">
      <AppHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="font-syne font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight text-prose">
            Code
            <span className="bg-linear-to-r from-accent to-accent-3 bg-clip-text text-transparent">
              Path
            </span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isAuthenticated
              ? 'Track your progress across topics · Resume anytime'
              : 'Explore structured DSA topics · Sign in to track your progress'}
          </p>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="inline-block mt-3 text-sm font-semibold text-accent no-underline hover:underline"
            >
              Log in to save progress →
            </Link>
          )}
        </div>

        {isAuthenticated && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {statCards.map(({ label, barCls, valCls, key }) => (
                <div key={key} className="rounded-xl p-4 sm:p-5 relative overflow-hidden bg-surface border border-dim">
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${barCls}`} />
                  <div className="text-xs font-mono-dm uppercase tracking-widest text-muted">{label}</div>
                  <div className={`font-syne font-extrabold text-3xl sm:text-4xl mt-1 tracking-tight ${valCls}`}>
                    {getVal(key)}
                  </div>
                  <div className="text-xs mt-1 text-muted">{getSub(key)}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-4 sm:p-5 mb-8 bg-surface border border-dim">
              <div className="flex justify-between items-center mb-3">
                <span className="font-syne font-bold text-prose">Overall Progress</span>
                <span className="font-mono-dm text-sm text-muted">{overall?.percentage ?? 0}%</span>
              </div>
              <ProgressBar
                percentage={overall?.percentage ?? 0}
                segments={
                  byDiff
                    ? {
                        easy:   byDiff.easy.completed,
                        medium: byDiff.medium.completed,
                        hard:   byDiff.hard.completed,
                        total:  overall?.total ?? 1,
                      }
                    : undefined
                }
              />
            </div>
          </>
        )}

        <h2 className="font-syne font-bold text-lg mb-4 text-prose">Topics</h2>
        {topicsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl h-40 animate-pulse bg-surface" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <TopicCard key={topic._id} topic={topic} showProgress={isAuthenticated} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
