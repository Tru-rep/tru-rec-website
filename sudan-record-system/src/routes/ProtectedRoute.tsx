import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/common/StateViews';

/** Guards routes that require an authenticated session. */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState label="جارٍ التحقق من الجلسة..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}

/** Guards admin-only routes. Falls back to dashboard for non-admins. */
export function AdminRoute() {
  const { isAdmin, loading } = useAuth();

  if (loading) return <LoadingState />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
