import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import DoctorDashboard from './components/DoctorDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/doctordashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Root redirect to dashboard (ProtectedRoute handles auth check) */}
          <Route path="/" element={<Navigate to="/doctordashboard" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/doctordashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
