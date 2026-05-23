import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
