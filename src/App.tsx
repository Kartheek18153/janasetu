import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FileGrievancePage from './pages/FileGrievancePage';
import TrackGrievancePage from './pages/TrackGrievancePage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import SchemesPage from './pages/SchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import DocumentsPage from './pages/DocumentsPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Lazy-loaded admin routes (code splitting)
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage'));
const AdminGrievancesPage = lazy(() => import('./pages/admin/GrievancesPage'));
const AdminAnnouncementsPage = lazy(() => import('./pages/admin/AnnouncementsPage'));
const AdminAppointmentsPage = lazy(() => import('./pages/admin/AppointmentsPage'));
const AdminOfficersPage = lazy(() => import('./pages/admin/OfficersPage'));
const AdminSchedulePage = lazy(() => import('./pages/admin/SchedulePage'));
const AdminWorkspacePage = lazy(() => import('./pages/admin/WorkspacePage'));

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAdmin } = useAuth();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={
          isAdmin ? <Navigate to="/admin" replace /> : <HomePage />
        } />
        <Route path="/file-grievance" element={
          <ProtectedRoute><FileGrievancePage /></ProtectedRoute>
        } />
        <Route path="/track" element={
          <ProtectedRoute><TrackGrievancePage /></ProtectedRoute>
        } />
        <Route path="/announcements" element={
          <ProtectedRoute><AnnouncementsPage /></ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute><AppointmentsPage /></ProtectedRoute>
        } />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/schemes" element={<ProtectedRoute><SchemesPage /></ProtectedRoute>} />
        <Route path="/schemes/:id" element={<ProtectedRoute><SchemeDetailPage /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute><MyApplicationsPage /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />

        {/* Admin Routes (lazy loaded) */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}><AdminDashboard /></Suspense></ProtectedRoute>
        } />
        <Route path="/admin/grievances" element={
          <ProtectedRoute adminOnly><Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}><AdminGrievancesPage /></Suspense></ProtectedRoute>
        } />
        <Route path="/admin/schedule" element={
          <ProtectedRoute adminOnly><Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}><AdminSchedulePage /></Suspense></ProtectedRoute>
        } />
        <Route path="/admin/workspace" element={
          <ProtectedRoute adminOnly><Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}><AdminWorkspacePage /></Suspense></ProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <ProtectedRoute adminOnly><Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}><AdminAnnouncementsPage /></Suspense></ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute adminOnly><Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}><AdminAppointmentsPage /></Suspense></ProtectedRoute>
        } />
        <Route path="/admin/officers" element={
          <ProtectedRoute adminOnly><Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}><AdminOfficersPage /></Suspense></ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute adminOnly><Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}><AccountPage /></Suspense></ProtectedRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AppProvider>
    </AuthProvider>
  );
}