import { Link } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export function AppHeader() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 bg-app/90 backdrop-blur-xl border-b border-dim">
      <Link
        to="/"
        className="font-syne font-extrabold text-lg sm:text-xl tracking-tight text-prose no-underline"
      >
        Code<span className="text-accent">Path</span>
      </Link>

      {isAuthenticated ? (
        <UserMenu />
      ) : (
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            to="/signup"
            className="hidden sm:inline text-sm text-muted no-underline hover:text-prose transition-colors"
          >
            Sign up
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold px-3 py-1.5 rounded-lg no-underline bg-accent text-white hover:opacity-90 transition-opacity"
          >
            Log in
          </Link>
        </div>
      )}
    </header>
  );
}
