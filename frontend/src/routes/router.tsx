import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';
import { LoginPage } from '../features/auth/LoginPage';
import { SignupPage } from '../features/auth/SignupPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TopicPage } from '../features/topics/TopicPage';
import { AdminPage } from '../features/admin/AdminPage';

export const router = createBrowserRouter([
  { path: '/', element: <DashboardPage /> },
  { path: '/dashboard', element: <Navigate to="/" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/topics/:slug', element: <TopicPage /> },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminPage />
      </AdminRoute>
    ),
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
