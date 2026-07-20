import React, { useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Login from './views/Login';
import Layout from './components/Layout';
import ResidentDashboard from './views/ResidentDashboard';
import AdminDashboard from './views/AdminDashboard';

function AppContent() {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  
  // Tab state corresponding to active layout selection
  const [currentTab, setCurrentTab] = useState('');

  // Auto-align default tabs on login/role change
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setCurrentTab('overview');
      } else {
        setCurrentTab('dashboard');
      }
    }
  }, [user]);

  // Central navigation dispatcher to handle routing + subview tabs
  const handleNavigate = (viewName) => {
    const adminTabs    = ['overview', 'tenements', 'notices', 'monthly-grid'];
    const residentTabs = ['dashboard', 'ledger', 'notices', 'profile'];

    if (adminTabs.includes(viewName)) {
      setCurrentTab(viewName);
      navigate('/admin');
    } else if (residentTabs.includes(viewName)) {
      setCurrentTab(viewName);
      navigate('/resident');
    } else if (viewName === 'login') {
      navigate('/login');
    }
  };


  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login navigate={handleNavigate} />} />
      
      {/* Resident Dashboard Route */}
      <Route
        path="/resident"
        element={
          user && user.role === 'resident' ? (
            <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
              <ResidentDashboard currentTab={currentTab} />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      {/* Admin Dashboard Route */}
      <Route
        path="/admin"
        element={
          user && user.role === 'admin' ? (
            <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
              <AdminDashboard currentTab={currentTab} />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback to Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
