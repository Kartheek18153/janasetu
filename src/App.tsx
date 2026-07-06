import { Routes, Route, Navigate } from 'react-router-dom';
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
import AdminDashboard from './pages/admin/DashboardPage';
import AdminGrievancesPage from './pages/admin/GrievancesPage';
import AdminAnnouncementsPage from './pages/admin/AnnouncementsPage';
import AdminAppointmentsPage from './pages/admin/AppointmentsPage';
import AdminOfficersPage from './pages/admin/OfficersPage';
import AdminSchedulePage from './pages/admin/SchedulePage';
import AdminWorkspacePage from './pages/admin/WorkspacePage';
import LoadingSpinner from './components/ui/LoadingSpinner';

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
        <Route path="/schemes" element={<SchemesPage />} />
        <Route path="/schemes/:id" element={<SchemeDetailPage />} />
        <Route path="/my-applications" element={<MyApplicationsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/grievances" element={
          <ProtectedRoute adminOnly><AdminGrievancesPage /></ProtectedRoute>
        } />
        <Route path="/admin/schedule" element={
          <ProtectedRoute adminOnly><AdminSchedulePage /></ProtectedRoute>
        } />
        <Route path="/admin/workspace" element={
          <ProtectedRoute adminOnly><AdminWorkspacePage /></ProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <ProtectedRoute adminOnly><AdminAnnouncementsPage /></ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute adminOnly><AdminAppointmentsPage /></ProtectedRoute>
        } />
        <Route path="/admin/officers" element={
          <ProtectedRoute adminOnly><AdminOfficersPage /></ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute adminOnly><AccountPage /></ProtectedRoute>
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
        <AppRoutes />
      </AppProvider>
    </AuthProvider>
  );
}