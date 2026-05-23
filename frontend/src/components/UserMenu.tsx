import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore';
import { authApi } from '../api/auth';
import { ThemeToggle } from './ThemeToggle';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

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

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    logout();
    setOpen(false);
    navigate('/login');
  }

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? '?';

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <ThemeToggle />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-linear-to-br from-accent to-accent-2 shrink-0 hover:opacity-90 transition-opacity"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] w-56 rounded-xl py-1 bg-surface border border-dim shadow-lg shadow-black/20 z-50"
        >
          <div className="px-4 py-3 border-b border-dim">
            <p className="text-sm font-medium text-prose truncate">{user?.name}</p>
            <p className="text-xs text-muted truncate mt-0.5">{user?.email}</p>
          </div>

          {user?.role === 'admin' && !isAdminPage && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                navigate('/admin');
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-prose hover:bg-surface-2 transition-colors"
            >
              Admin Panel
            </button>
          )}

          {isAdminPage && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                navigate('/');
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-prose hover:bg-surface-2 transition-colors"
            >
              Dashboard
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-accent-2 hover:bg-surface-2 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
