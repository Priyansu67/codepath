import {
  ArrowUpDown,
  Layers,
  Link2,
  Network,
  Repeat,
  Sparkles,
  TreeDeciduous,
  Type,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';

const TOPIC_ICONS: Record<string, LucideIcon> = {
  arrays: LayoutGrid,
  strings: Type,
  'linked-list': Link2,
  trees: TreeDeciduous,
  graphs: Network,
  dp: Sparkles,
  sorting: ArrowUpDown,
  recursion: Repeat,
};

export function getTopicIcon(slug?: string, title?: string): LucideIcon {
  if (slug && TOPIC_ICONS[slug]) return TOPIC_ICONS[slug];

  const key = title?.toLowerCase() ?? '';
  if (key.includes('array') || key.includes('hash')) return LayoutGrid;
  if (key.includes('string')) return Type;
  if (key.includes('linked')) return Link2;
  if (key.includes('tree')) return TreeDeciduous;
  if (key.includes('graph')) return Network;
  if (key.includes('dynamic') || key.includes('dp')) return Sparkles;
  if (key.includes('sort') || key.includes('search')) return ArrowUpDown;
  if (key.includes('recurs') || key.includes('backtrack')) return Repeat;

  return Layers;
}
