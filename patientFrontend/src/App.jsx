import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Component, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import PatientProfile from './components/PatientProfile';
import PaymentSuccess from './components/PaymentSuccess';
import MedicalRecordView from './components/MedicalRecordView';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// Clears all localStorage and redirects to home
function ClearAndRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/', { replace: true });
  }, [navigate]);
  return null;
}

// Error Boundary to catch crashes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App Crash:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', background: '#f9fafb' }}>
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '480px' }}>
            <h2 style={{ color: '#dc2626', marginBottom: '8px' }}>Something went wrong</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>{this.state.error?.message}</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
              style={{ padding: '10px 24px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          {/* Emergency: visit /clear to wipe stuck localStorage token */}
          <Route path="/clear" element={<ClearAndRedirect />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment/success"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />

          <Route
            path="/medical-record/:id"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MedicalRecordView />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;