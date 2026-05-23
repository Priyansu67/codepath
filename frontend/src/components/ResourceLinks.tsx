import { CirclePlay, Code2, FileText, type LucideIcon } from 'lucide-react';
import type { Resources } from '../types';

const LINKS: {
  key: keyof Resources;
  tooltip: string;
  Icon: LucideIcon;
  hoverCls: string;
}[] = [
  {
    key: 'youtubeUrl',
    tooltip: 'YouTube',
    Icon: CirclePlay,
    hoverCls: 'hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400',
  },
  {
    key: 'leetcodeUrl',
    tooltip: 'LeetCode',
    Icon: Code2,
    hoverCls: 'hover:bg-orange-400/10 hover:border-orange-400/30 hover:text-orange-400',
  },
  {
    key: 'articleUrl',
    tooltip: 'Article',
    Icon: FileText,
    hoverCls: 'hover:bg-accent/10 hover:border-accent/30 hover:text-accent',
  },
];

export function ResourceLinks({ resources }: { resources: Resources }) {
  return (
    <div className="flex gap-1">
      {LINKS.map(({ key, tooltip, Icon, hoverCls }) => {
        const href = resources[key];
        if (!href) return null;
        return (
          <a
            key={key}
            href={href}
            title={tooltip}
            aria-label={tooltip}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`rounded-md w-7 h-7 flex items-center justify-center no-underline transition-all border border-dim text-muted bg-surface-2 ${hoverCls}`}
          >
            <Icon size={14} strokeWidth={2} />
          </a>
        );
      })}
    </div>
  );
}
