import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import PatientProfile from './components/PatientProfile';
import PaymentSuccess from './components/PaymentSuccess';
import MedicalRecordView from './components/MedicalRecordView';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
  );
}

export default App;