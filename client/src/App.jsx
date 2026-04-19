import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';
import CallPage from './pages/CallPage';

// Global Incoming Call Component
import IncomingCall from './components/shared/IncomingCall';

import AuthPage       from './pages/AuthPage';
import HomePage       from './pages/HomePage';
import ProfilePage    from './pages/ProfilePage';
import SettingsPage   from './pages/SettingsPage';
import ResetPassword  from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import AdminMatrix    from './pages/AdminMatrix';
import NotFoundPage   from './pages/NotFoundPage';
import LoadingSpinner from './components/ui/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { user, isCheckingAuth } = useAuthStore();
  if (isCheckingAuth) return <LoadingSpinner fullScreen />;
  return user ? children : <Navigate to="/auth" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isCheckingAuth } = useAuthStore();
  if (isCheckingAuth) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, isCheckingAuth } = useAuthStore();
  if (isCheckingAuth) return <LoadingSpinner fullScreen />;
  return !user ? children : <Navigate to="/" replace />;
};

export default function App() {
  const { user, checkAuth } = useAuthStore(); // Added user here
  
  useEffect(() => { 
    checkAuth(); 
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background:   '#111118',
            color:        '#f0f0f0',
            border:       '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            fontSize:     '13px',
            fontWeight:   '500',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      
      {/* FIXED: We only show IncomingCall if a user exists. 
          This prevents the "useSocket" error on the Login/Auth screens.
      */}
      {user && <IncomingCall />}

      <Routes>
        <Route path="/call" element={<CallPage />} />

        {/* Public Legal Pages */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Guest */}
        <Route path="/auth"              element={<GuestRoute><AuthPage /></GuestRoute>} />
        <Route path="/forgot-password"   element={<GuestRoute><ForgotPassword /></ForgotPassword>} />
        <Route path="/reset-password/:token" element={<GuestRoute><ResetPassword /></GuestRoute>} />

        {/* Home */}
        <Route path="/" element={
          <PrivateRoute><HomePage /></PrivateRoute>
        } />
        <Route path="/chat/:userId" element={
          <PrivateRoute><HomePage /></PrivateRoute>
        } />

        {/* Profile & Settings */}
        <Route path="/profile/:username" element={
          <PrivateRoute><ProfilePage /></PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute><SettingsPage /></PrivateRoute>
        } />

        {/* Admin */}
        <Route path="/admin-matrix" element={
          <AdminRoute><AdminMatrix /></AdminRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}