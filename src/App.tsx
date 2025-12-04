import React, { useState, useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Layout } from '../components/Layout.tsx';
import { Dashboard } from '../pages/Dashboard.tsx';
import { Projects } from '../pages/Projects.tsx';
import { ProjectDetails } from '../pages/ProjectDetails.tsx';
import { Clients } from '../pages/Clients.tsx';
import { Reports } from '../pages/Reports.tsx';
import { MarketingDashboard } from '../pages/SocialTracker.tsx';
import { Settings } from '../pages/Settings.tsx';
import { Templates } from '../pages/Templates.tsx';
import { TemplateDetails } from '../pages/TemplateDetails.tsx';
import { AdminDashboard } from '../pages/AdminDashboard.tsx';
import { Products } from '../pages/Products.tsx';
import { Plans } from '../pages/Plans.tsx';
import { Login } from '../pages/Login.tsx';
import { Register } from '../pages/Register.tsx';
import { LoadingScreen } from '../components/LoadingScreen.tsx';
import { User } from '../types.ts';
import { supabaseService } from '../services/supabaseService.ts';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  user: User | null;
}

const ProtectedRoute = ({ children, user }: ProtectedRouteProps) => {
  if (!user) {
    return <Navigate to='/login' replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabaseService.auth.getSession();
    if (session) {
      setUser(session);
    }
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const handleLogin = () => {
    const session = supabaseService.auth.getSession();
    setUser(session);
  };

  const handleLogout = () => {
    supabaseService.auth.signOut();
    setUser(null);
  };

  const handleUpdateUser = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path='/login'
          element={
            !user ? <Login onLogin={handleLogin} /> : <Navigate to='/' />
          }
        />
        <Route
          path='/register'
          element={
            !user ? <Register onLogin={handleLogin} /> : <Navigate to='/' />
          }
        />

        {/* Protected Routes */}
        <Route
          path='/'
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path='/templates'
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <Templates />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/templates/:id'
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <TemplateDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path='/projects'
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <Projects />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/projects/:id'
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <ProjectDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path='/clients'
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <Clients />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/products'
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/reports'
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/social-tracker'
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <MarketingDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/plans'
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <Plans />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path='/settings'
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout}>
                <Settings user={user} onUserUpdate={handleUpdateUser} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path='/admin'
          element={
            <ProtectedRoute user={user}>
              {user?.role === 'admin' ? (
                <Layout user={user} onLogout={handleLogout}>
                  <AdminDashboard />
                </Layout>
              ) : (
                <Navigate to='/' />
              )}
            </ProtectedRoute>
          }
        />

        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </Router>
  );
};

export default App;
