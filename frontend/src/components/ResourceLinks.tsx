import type { Resources } from '../types';

interface Props {
  resources: Resources;
}

interface LinkDef {
  key: keyof Resources;
  label: string;
  className: string;
  hoverStyle: React.CSSProperties;
}

const LINKS: LinkDef[] = [
  {
    key: 'youtubeUrl',
    label: 'YT',
    className: 'yt',
    hoverStyle: { background: 'rgba(255,0,0,0.12)', borderColor: 'rgba(255,0,0,0.3)', color: '#ff4444' },
  },
  {
    key: 'leetcodeUrl',
    label: 'LC',
    className: 'lc',
    hoverStyle: { background: 'rgba(255,161,22,0.12)', borderColor: 'rgba(255,161,22,0.3)', color: '#ffa116' },
  },
  {
    key: 'articleUrl',
    label: '📄',
    className: 'art',
    hoverStyle: { background: 'rgba(124,106,255,0.12)', borderColor: 'rgba(124,106,255,0.3)', color: 'var(--accent)' },
  },
];

function ResourceLink({ href, label, hoverStyle }: { href: string; label: string; hoverStyle: React.CSSProperties }) {
  const [hovered, setHovered] = React.useState(false);

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="font-mono-dm text-xs font-medium rounded-md flex items-center justify-center transition-all"
      style={{
        width: 28,
        height: 28,
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        color: 'var(--muted)',
        textDecoration: 'none',
        ...(hovered ? hoverStyle : {}),
      }}
    >
      {label}
    </a>
  );
}

import React from 'react';

export function ResourceLinks({ resources }: Props) {
  return (
    <div className="flex gap-1">
      {LINKS.map(({ key, label, hoverStyle }) => (
        <ResourceLink
          key={key}
          href={resources[key]}
          label={label}
          hoverStyle={hoverStyle}
        />
      ))}
    </div>
  );
}
