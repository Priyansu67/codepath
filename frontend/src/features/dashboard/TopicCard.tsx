import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../../components/ProgressBar';
import type { Topic } from '../../types';

interface Props {
  topic: Topic;
}

export function TopicCard({ topic }: Props) {
  const navigate = useNavigate();
  const { stats } = topic;

  return (
    <div
      onClick={() => navigate(`/topics/${topic.slug}`)}
      className="rounded-xl p-5 cursor-pointer transition-all"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)')}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          {topic.icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-syne font-bold text-sm truncate">{topic.title}</h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
            {topic.description}
          </p>
        </div>
      </div>

      {/* Difficulty breakdown */}
      <div className="flex gap-3 mb-3">
        {(['easy', 'medium', 'hard'] as const).map((d) => (
          <div key={d} className="flex-1 text-center">
            <div
              className="text-xs font-mono-dm font-bold"
              style={{
                color: d === 'easy' ? 'var(--easy)' : d === 'medium' ? 'var(--medium)' : 'var(--hard)',
              }}
            >
              {stats.completedByDifficulty[d]}/{stats.byDifficulty[d]}
            </div>
            <div className="text-xs capitalize" style={{ color: 'var(--muted)' }}>
              {d}
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <ProgressBar percentage={stats.percentage} height={6} />
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {stats.completed}/{stats.total} solved
        </span>
        <span className="text-xs font-mono-dm font-bold" style={{ color: 'var(--accent3)' }}>
          {stats.percentage}%
        </span>
      </div>
    </div>
  );
}
