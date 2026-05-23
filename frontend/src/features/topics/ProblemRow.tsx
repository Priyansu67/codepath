import { Clock } from 'lucide-react';
import { CompanyTags } from '../../components/CompanyTags';
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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      className={`grid items-center gap-x-2 sm:gap-x-3 px-3 sm:px-4 py-3 rounded-xl transition-all border border-transparent hover:bg-surface hover:border-dim cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:grid-cols-[auto_minmax(0,1fr)_5.5rem_auto_auto] lg:grid-cols-[auto_minmax(0,1fr)_9.5rem_5.5rem_4.5rem_5.75rem] ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      <div className="check-wrap shrink-0 pointer-events-none" aria-hidden="true">
        <input type="checkbox" checked={isCompleted} readOnly tabIndex={-1} />
        <div className="check-box" />
      </div>

      <span
        className={`text-sm font-medium truncate min-w-0 text-prose ${
          isCompleted ? 'line-through decoration-muted' : ''
        }`}
        title={problem.title}
      >
        {problem.title}
      </span>

      <div className="hidden lg:flex items-center justify-end min-w-0 pointer-events-auto">
        <CompanyTags companies={problem.companyTags ?? []} />
      </div>

      <div className="hidden sm:flex items-center justify-end pointer-events-none">
        {problem.avgTime ? (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-mono-dm border border-dim text-muted whitespace-nowrap">
            <Clock size={11} strokeWidth={2} />
            {problem.avgTime}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-center pointer-events-none">
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      <div className="flex items-center justify-end w-23 shrink-0" onClick={(e) => e.stopPropagation()}>
        <ResourceLinks resources={problem.resources} />
      </div>
    </div>
  );
}
