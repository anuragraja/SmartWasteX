import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading SmartWasteX...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Enforce KYC
  if (['worker', 'society_head'].includes(user.role) && !user.kycVerified) {
    // Prevent redirect loop if already going to /kyc
    if (window.location.pathname !== '/kyc') {
      return <Navigate to="/kyc" replace />;
    }
  } else {
    // If verified, prevent accessing /kyc again
    if (window.location.pathname === '/kyc') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Support both usage patterns:
  // 1. <ProtectedRoute><Component /></ProtectedRoute>
  // 2. <Route element={<ProtectedRoute allowedRoles={[...]} />}> (uses Outlet)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
