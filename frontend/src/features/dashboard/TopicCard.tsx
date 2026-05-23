import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../../components/ProgressBar';
import { TopicIcon } from '../../components/TopicIcon';
import type { Topic } from '../../types';

const diffTextCls = { easy: 'text-easy', medium: 'text-medium', hard: 'text-hard' } as const;

interface Props {
  topic: Topic;
  showProgress?: boolean;
}

export function TopicCard({ topic, showProgress = true }: Props) {
  const navigate = useNavigate();
  const { stats } = topic;

  return (
    <div
      onClick={() => navigate(`/topics/${topic.slug}`)}
      className="rounded-xl p-5 cursor-pointer transition-all bg-surface border border-dim hover:border-accent"
    >
      <div className="flex items-center gap-3 mb-4">
        <TopicIcon title={topic.title} slug={topic.slug} size="lg" />
        <div className="min-w-0">
          <h3 className="font-syne font-bold text-sm truncate text-prose">{topic.title}</h3>
          <p className="text-xs mt-0.5 truncate text-muted">{topic.description}</p>
        </div>
      </div>

      {showProgress ? (
        <>
          <div className="flex gap-3 mb-3">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <div key={d} className="flex-1 text-center">
                <div className={`text-xs font-mono-dm font-bold ${diffTextCls[d]}`}>
                  {stats.completedByDifficulty[d]}/{stats.byDifficulty[d]}
                </div>
                <div className="text-xs capitalize text-muted">{d}</div>
              </div>
            ))}
          </div>

          <ProgressBar percentage={stats.percentage} height={6} />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted">{stats.completed}/{stats.total} solved</span>
            <span className="text-xs font-mono-dm font-bold text-accent-3">{stats.percentage}%</span>
          </div>
        </>
      ) : (
        <div className="text-xs font-mono-dm text-muted">
          {stats.total} problems
        </div>
      )}
    </div>
  );
}
