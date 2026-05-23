interface Props {
  percentage: number;
  segments?: { easy: number; medium: number; hard: number; total: number };
  height?: number;
}

export function ProgressBar({ percentage, segments, height = 8 }: Props) {
  const trackStyle = { height };

  if (segments) {
    const ep = segments.total ? (segments.easy   / segments.total) * 100 : 0;
    const mp = segments.total ? (segments.medium / segments.total) * 100 : 0;
    const hp = segments.total ? (segments.hard   / segments.total) * 100 : 0;

    return (
      <div className="rounded-full overflow-hidden flex gap-0.5 bg-surface-2" style={trackStyle}>
        <div className="rounded-full progress-fill bg-easy"   style={{ width: `${ep}%` }} />
        <div className="rounded-full progress-fill bg-medium" style={{ width: `${mp}%` }} />
        <div className="rounded-full progress-fill bg-hard"   style={{ width: `${hp}%` }} />
      </div>
    );
  }

  return (
    <div className="rounded-full overflow-hidden bg-surface-2" style={trackStyle}>
      <div className="h-full rounded-full progress-fill bg-accent-3" style={{ width: `${percentage}%` }} />
    </div>
  );
}
