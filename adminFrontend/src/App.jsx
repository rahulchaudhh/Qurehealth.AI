import { BrowserRouter as Router, Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Overview from './pages/Overview';
import PendingApprovals from './pages/PendingApprovals';
import DoctorsDirectory from './pages/DoctorsDirectory';
import PatientRecords from './pages/PatientRecords';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';
import Communications from './pages/Communications';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes - Redirect to Main Login */}
          <Route path="/login" element={<RedirectToMainLogin />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<PageWrapper Component={Overview} />} />
            <Route path="pending" element={<PageWrapper Component={PendingApprovals} />} />
            <Route path="doctors" element={<PageWrapper Component={DoctorsDirectory} />} />
            <Route path="patients" element={<PageWrapper Component={PatientRecords} />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="settings" element={<Settings />} />
            <Route path="communications" element={<PageWrapper Component={Communications} />} />
          </Route>

          {/* Root redirect to login by default */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// eslint-disable-next-line no-unused-vars
function PageWrapper({ Component: Page }) {
  const context = useOutletContext();
  return <Page {...context} />;
}

export default App;
