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
      className="grid items-center gap-4 px-4 py-3 rounded-xl transition-all"
      style={{
        gridTemplateColumns: '36px 1fr auto auto auto',
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
      <label className="check-wrap" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={problem.isCompleted ?? false}
          onChange={(e) => onToggle(problem._id, e.target.checked)}
        />
        <div className="check-box" />
      </label>

      {/* Title */}
      <span
        className="text-sm font-medium"
        style={{
          textDecoration: problem.isCompleted ? 'line-through' : 'none',
          textDecorationColor: 'var(--muted)',
        }}
      >
        {problem.title}
      </span>

      {/* Difficulty */}
      <DifficultyBadge difficulty={problem.difficulty} />

      {/* Resources */}
      <ResourceLinks resources={problem.resources} />
    </div>
  );
}
