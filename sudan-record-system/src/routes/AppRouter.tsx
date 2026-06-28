import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingState } from '@/components/common/StateViews';

// Lazy-load every page so each route is a separate chunk (performance).
const LoginPage = lazy(() => import('@/pages/Login/LoginPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPassword/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage'));
const SearchPage = lazy(() => import('@/pages/Search/SearchPage'));
const AddRecordPage = lazy(() => import('@/pages/AddRecord/AddRecordPage'));
const EditRecordPage = lazy(() => import('@/pages/EditRecord/EditRecordPage'));
const RecordDetailsPage = lazy(() => import('@/pages/RecordDetails/RecordDetailsPage'));
const UsersPage = lazy(() => import('@/pages/Users/UsersPage'));
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<LoadingState />}>{node}</Suspense>;
}

const router = createBrowserRouter([
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/reset-password', element: withSuspense(<ResetPasswordPage />) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: withSuspense(<DashboardPage />) },
          { path: '/search', element: withSuspense(<SearchPage />) },
          { path: '/records/new', element: withSuspense(<AddRecordPage />) },
          { path: '/records/:id', element: withSuspense(<RecordDetailsPage />) },
          { path: '/records/:id/edit', element: withSuspense(<EditRecordPage />) },
          { path: '/settings', element: withSuspense(<SettingsPage />) },
          {
            element: <AdminRoute />,
            children: [{ path: '/users', element: withSuspense(<UsersPage />) }],
          },
        ],
      },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
