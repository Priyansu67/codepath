interface Props {
  percentage: number;
  /** Split the bar into easy/medium/hard segments */
  segments?: { easy: number; medium: number; hard: number; total: number };
  height?: number;
}

export function ProgressBar({ percentage, segments, height = 8 }: Props) {
  if (segments) {
    const ep = segments.total ? (segments.easy / segments.total) * 100 : 0;
    const mp = segments.total ? (segments.medium / segments.total) * 100 : 0;
    const hp = segments.total ? (segments.hard / segments.total) * 100 : 0;

    return (
      <div
        className="rounded-full overflow-hidden flex gap-0.5"
        style={{ height, background: 'var(--surface2)' }}
      >
        <div
          className="rounded-full progress-fill"
          style={{ width: `${ep}%`, background: 'var(--easy)' }}
        />
        <div
          className="rounded-full progress-fill"
          style={{ width: `${mp}%`, background: 'var(--medium)' }}
        />
        <div
          className="rounded-full progress-fill"
          style={{ width: `${hp}%`, background: 'var(--hard)' }}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-full overflow-hidden"
      style={{ height, background: 'var(--surface2)' }}
    >
      <div
        className="h-full rounded-full progress-fill"
        style={{ width: `${percentage}%`, background: 'var(--accent3)' }}
      />
    </div>
  );
}
