import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Layout from './layouts/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadImage from './pages/UploadImage';
import Heatmap from './pages/Heatmap';
import WorkerTracking from './pages/WorkerTracking';
import Rankings from './pages/Rankings';
import PickupManagement from './pages/PickupManagement';
import AccountRequests from './pages/AccountRequests';
import PublicComplaint from './pages/PublicComplaint';
import KYCForm from './pages/KYCForm';
import Notifications from './pages/Notifications';
import ProfileSettings from './pages/ProfileSettings';
import ProtectedRoute from './components/ProtectedRoute';
import RecycleMarketplace from './pages/RecycleMarketplace';
import RecyclerDashboard from './pages/RecyclerDashboard';

// Redirect logged-in users away from login/register
const GuestRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return null;
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#1f2937',
            color: '#fff',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Protected Layout Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* All authenticated users */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<ProfileSettings />} />
              <Route path="/kyc" element={<KYCForm />} />
              <Route path="/rankings" element={<Rankings />} />

              {/* Admin Only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/requests" element={<AccountRequests />} />
                <Route path="/workers" element={<WorkerTracking />} />
              </Route>

              {/* Admin & Society Head */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'society_head']} />}>
                <Route path="/heatmap" element={<Heatmap />} />
                <Route path="/pickups" element={<PickupManagement />} />
              </Route>

              {/* Admin, Society Head & Worker */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'society_head', 'worker']} />}>
                <Route path="/upload" element={<UploadImage />} />
              </Route>

              {/* Public User */}
              <Route element={<ProtectedRoute allowedRoles={['public']} />}>
                <Route path="/complaint" element={<PublicComplaint />} />
              </Route>
              
              {/* Recycle Features */}
              <Route element={<ProtectedRoute allowedRoles={['public', 'society_head', 'admin']} />}>
                <Route path="/recycle" element={<RecycleMarketplace />} />
              </Route>

              {/* Recycler Only */}
              <Route element={<ProtectedRoute allowedRoles={['recycler']} />}>
                <Route path="/recycler-dashboard" element={<RecyclerDashboard />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
