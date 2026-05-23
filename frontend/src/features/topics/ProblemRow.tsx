import { DifficultyBadge } from '../../components/DifficultyBadge';
import { ResourceLinks } from '../../components/ResourceLinks';
import type { Problem } from '../../types';

interface Props {
  problem: Problem;
  onToggle: (problemId: string, isCompleted: boolean) => void;
}

export function ProblemRow({ problem, onToggle }: Props) {
  return (
    <div
      className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl transition-all"
      style={{
        border: '1px solid transparent',
        opacity: problem.isCompleted ? 0.65 : 1,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
      }}
    >
      {/* Checkbox */}
      <label className="check-wrap shrink-0" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={problem.isCompleted ?? false}
          onChange={(e) => onToggle(problem._id, e.target.checked)}
        />
        <div className="check-box" />
      </label>

      {/* Title — fills remaining space, truncates on overflow */}
      <span
        className="flex-1 text-sm font-medium truncate min-w-0"
        style={{
          textDecoration: problem.isCompleted ? 'line-through' : 'none',
          textDecorationColor: 'var(--muted)',
        }}
        title={problem.title}
      >
        {problem.title}
      </span>

      {/* Difficulty */}
      <span className="shrink-0">
        <DifficultyBadge difficulty={problem.difficulty} />
      </span>

      {/* Resources */}
      <div className="shrink-0">
        <ResourceLinks resources={problem.resources} />
      </div>
    </div>
  );
}
