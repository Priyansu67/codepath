import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { router } from './routes/router';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './features/auth/authStore';
import { authApi } from './api/auth';
import { useTheme } from './hooks/useTheme';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, setUser, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => logout())
      .finally(() => setChecking(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-dim border-t-accent animate-spin" />
          <span className="text-sm font-mono-dm text-muted">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  useTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <RouterProvider router={router} />
      </AuthGate>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface-2)',
            color: 'var(--color-prose)',
            border: '1px solid var(--color-dim)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.85rem',
          },
        }}
      />
    </QueryClientProvider>
  );
}
