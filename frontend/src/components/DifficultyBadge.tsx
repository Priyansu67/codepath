const cls = {
  easy:   'bg-easy/10 text-easy border border-easy/25',
  medium: 'bg-medium/10 text-medium border border-medium/25',
  hard:   'bg-hard/10 text-hard border border-hard/25',
};

export function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  return (
    <span className={`inline-block min-w-17 text-center font-mono-dm text-xs px-2 py-0.5 rounded-full font-medium tracking-wide capitalize ${cls[difficulty]}`}>
      {difficulty}
    </span>
  );
}
