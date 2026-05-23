import { Clock } from 'lucide-react';
import { DifficultyBadge } from '../../components/DifficultyBadge';
import { ResourceLinks } from '../../components/ResourceLinks';
import type { Problem } from '../../types';

interface Props {
  problem: Problem;
  onToggle: (problemId: string, isCompleted: boolean) => void;
}

export function ProblemRow({ problem, onToggle }: Props) {
  const isCompleted = problem.isCompleted ?? false;

  function toggle() {
    onToggle(problem._id, !isCompleted);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  }

  const companies = problem.companyTags ?? [];
  const visibleCompanies = companies.slice(0, 2);
  const extraCount = companies.length - visibleCompanies.length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl transition-all border border-transparent hover:bg-surface hover:border-dim cursor-pointer ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      <div className="check-wrap shrink-0 pointer-events-none" aria-hidden="true">
        <input type="checkbox" checked={isCompleted} readOnly tabIndex={-1} />
        <div className="check-box" />
      </div>

      <span
        className={`flex-1 text-sm font-medium truncate min-w-0 text-prose ${
          isCompleted ? 'line-through decoration-muted' : ''
        }`}
        title={problem.title}
      >
        {problem.title}
      </span>

      {/* Company chips — desktop only */}
      {visibleCompanies.length > 0 && (
        <div className="hidden lg:flex items-center gap-1 shrink-0 pointer-events-none">
          {visibleCompanies.map((c) => (
            <span
              key={c}
              className="text-[10px] px-1.5 py-0.5 rounded font-mono-dm border border-dim text-muted truncate max-w-[72px]"
              title={c}
            >
              {c}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono-dm border border-dim text-muted">
              +{extraCount}
            </span>
          )}
        </div>
      )}

      {/* Time badge — tablet and up */}
      {problem.avgTime && (
        <span className="hidden sm:inline-flex items-center gap-1 shrink-0 text-[10px] px-2 py-0.5 rounded font-mono-dm border border-dim text-muted pointer-events-none whitespace-nowrap">
          <Clock size={11} strokeWidth={2} />
          {problem.avgTime}
        </span>
      )}

      <span className="shrink-0 pointer-events-none">
        <DifficultyBadge difficulty={problem.difficulty} />
      </span>

      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <ResourceLinks resources={problem.resources} />
      </div>
    </div>
  );
}
