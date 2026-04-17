import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthPage from './pages/AuthPage';
import AppPage from './pages/AppPage';
import CallPage from './pages/CallPage';
import { useEffect } from 'react';
import api from './api/axios';

function InviteRoute() {
  const { code } = useParams();
  const { user } = useAuth();
  useEffect(() => {
    if (!user || !code) return;
    api.get(`/users/invite/${code}`)
      .then(({ data }) => {
        sessionStorage.setItem('noothing_active_chat', JSON.stringify(data));
        window.location.replace('/');
      })
      .catch(() => window.location.replace('/'));
  }, [user, code]);
  if (!user) {
    sessionStorage.setItem('noothing_pending_invite', JSON.stringify({ code, type: 'dm' }));
    return <Navigate to="/" replace />;
  }
  return <Spinner label="Opening conversation..." />;
}

function RoomInviteRoute() {
  const { code } = useParams();
  const { user } = useAuth();
  useEffect(() => {
    if (!user || !code) return;
    api.get(`/rooms/join/${code}`)
      .then(({ data }) => {
        sessionStorage.setItem('noothing_active_chat', JSON.stringify({ ...data, isRoom: true }));
        window.location.replace('/');
      })
      .catch(() => window.location.replace('/'));
  }, [user, code]);
  if (!user) {
    sessionStorage.setItem('noothing_pending_invite', JSON.stringify({ code, type: 'room' }));
    return <Navigate to="/" replace />;
  }
  return <Spinner label="Joining room..." color="#f97316" />;
}

function Spinner({ label, color = '#6366f1' }) {
  return (
    <div style={{
      background: '#080808', color: '#f0f0f0', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 36, height: 36, border: `2px solid ${color}`,
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color, fontSize: 13, margin: 0 }}>{label}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AppShell() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user) return;
    const pending = sessionStorage.getItem('noothing_pending_invite');
    if (!pending) return;
    try {
      const { code, type } = JSON.parse(pending);
      sessionStorage.removeItem('noothing_pending_invite');
      const endpoint = type === 'room' ? `/rooms/join/${code}` : `/users/invite/${code}`;
      api.get(endpoint)
        .then(({ data }) => {
          const chat = type === 'room' ? { ...data, isRoom: true } : data;
          sessionStorage.setItem('noothing_active_chat', JSON.stringify(chat));
          window.location.replace('/');
        })
        .catch(console.error);
    } catch {
      sessionStorage.removeItem('noothing_pending_invite');
    }
  }, [user]);

  if (loading) return <Spinner label="Loading Noothing..." />;

  return (
    <Routes>
      <Route
        path="/"
        element={user
          ? <SocketProvider><AppPage /></SocketProvider>
          : <AuthPage />
        }
      />
      {/* ── Call route ── */}
      <Route
        path="/call/:roomId"
        element={user
          ? <SocketProvider><CallPage /></SocketProvider>
          : <Navigate to="/" replace />
        }
      />
      <Route
        path="/join/:code"
        element={user
          ? <SocketProvider><InviteRoute /></SocketProvider>
          : <InviteRoute />
        }
      />
      <Route
        path="/room/:code"
        element={user
          ? <SocketProvider><RoomInviteRoute /></SocketProvider>
          : <RoomInviteRoute />
        }
      />
      <Route path="*" element={
        <div style={{
          background: '#080808', color: '#f0f0f0', height: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 16,
        }}>
          <p style={{ fontSize: 48, margin: 0 }}>🌑</p>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Page not found</h1>
          <a href="/" style={{ color: '#6366f1', fontSize: 13 }}>← Back to Noothing</a>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}