import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { router } from './routes/router';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './features/auth/authStore';
import { authApi } from './api/auth';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, setUser, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If no persisted user, skip the network call
    if (!user) {
      setChecking(false);
      return;
    }
    // Verify the session is still valid (refresh cookie will be used automatically)
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
          />
          <span className="text-sm font-mono-dm" style={{ color: 'var(--muted)' }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <RouterProvider router={router} />
      </AuthGate>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.85rem',
          },
        }}
      />
    </QueryClientProvider>
  );
}
