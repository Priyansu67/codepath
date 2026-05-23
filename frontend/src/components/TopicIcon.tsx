import { getTopicIcon } from '../lib/topicIcons';

interface Props {
  title: string;
  slug?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PALETTES = [
  { bg: 'bg-accent/15', text: 'text-accent' },
  { bg: 'bg-easy/15', text: 'text-easy' },
  { bg: 'bg-medium/15', text: 'text-medium' },
  { bg: 'bg-hard/15', text: 'text-hard' },
  { bg: 'bg-accent-2/15', text: 'text-accent-2' },
  { bg: 'bg-accent-3/15', text: 'text-accent-3' },
];

const sizeClasses = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-10 h-10',
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 18,
};

function hash(s: string) {
  return s.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

export function TopicIcon({ title, slug, size = 'md' }: Props) {
  const palette = PALETTES[hash(slug ?? title) % PALETTES.length];
  const Icon = getTopicIcon(slug, title);

  return (
    <div
      className={`rounded-xl flex items-center justify-center shrink-0 ${palette.bg} ${palette.text} ${sizeClasses[size]}`}
    >
      <Icon size={iconSizes[size]} strokeWidth={2} />
    </div>
  );
}
