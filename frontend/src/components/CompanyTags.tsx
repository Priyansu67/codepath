import { useState, useRef, useEffect } from 'react';

interface Props {
  companies: string[];
  maxVisible?: number;
}

function Chip({ label }: { label: string }) {
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded font-mono-dm border border-dim text-muted truncate max-w-[68px]"
      title={label}
    >
      {label}
    </span>
  );
}

export function CompanyTags({ companies, maxVisible = 2 }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = companies.slice(0, maxVisible);
  const extra = companies.slice(maxVisible);
  const extraCount = extra.length;

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openPopover() {
    clearCloseTimer();
    setOpen(true);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (companies.length === 0) return null;

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-end gap-1 min-w-0"
      onClick={(e) => e.stopPropagation()}
    >
      {visible.map((c) => (
        <Chip key={c} label={c} />
      ))}

      {extraCount > 0 && (
        <div
          className="relative shrink-0"
          onMouseEnter={openPopover}
          onMouseLeave={scheduleClose}
        >
          <button
            type="button"
            aria-expanded={open}
            aria-haspopup="true"
            aria-label={`Show ${extraCount} more companies`}
            onClick={() => setOpen((v) => !v)}
            className="text-[10px] px-1.5 py-0.5 rounded font-mono-dm border border-dim text-muted hover:text-prose hover:border-accent/40 hover:bg-surface-2 transition-colors"
          >
            +{extraCount}
          </button>

          {open && (
            <div className="absolute right-0 top-full pt-1 z-50">
              <div
                role="tooltip"
                aria-label="All companies"
                className="w-56 max-h-48 overflow-y-auto rounded-xl p-3 bg-surface border border-dim shadow-lg shadow-black/20"
              >
                <p className="text-[10px] font-mono-dm uppercase tracking-widest text-muted mb-2">
                  Companies ({companies.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {companies.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] px-1.5 py-0.5 rounded font-mono-dm border border-dim text-muted"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
