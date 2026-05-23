interface Props {
  difficulty: 'easy' | 'medium' | 'hard';
}

const styles: Record<Props['difficulty'], React.CSSProperties> = {
  easy: {
    background: 'rgba(106, 255, 212, 0.1)',
    color: 'var(--easy)',
    border: '1px solid rgba(106, 255, 212, 0.25)',
  },
  medium: {
    background: 'rgba(255, 216, 106, 0.1)',
    color: 'var(--medium)',
    border: '1px solid rgba(255, 216, 106, 0.25)',
  },
  hard: {
    background: 'rgba(255, 106, 106, 0.1)',
    color: 'var(--hard)',
    border: '1px solid rgba(255, 106, 106, 0.25)',
  },
};

export function DifficultyBadge({ difficulty }: Props) {
  return (
    <span
      className="font-mono-dm text-xs px-2 py-0.5 rounded-full font-medium tracking-wide"
      style={styles[difficulty]}
    >
      {difficulty}
    </span>
  );
}
