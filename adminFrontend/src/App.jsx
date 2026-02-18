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

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all - redirect to main login */}
          <Route path="*" element={<RedirectToMainLogin />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

function RedirectToMainLogin() {
  const { loading, user } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = 'http://localhost:5173/login';
    }
  }, [loading, user]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium font-outfit">Redirecting to login...</p>
    </div>
  );
}

// eslint-disable-next-line no-unused-vars
function PageWrapper({ Component: Page }) {
  const context = useOutletContext();
  return <Page {...context} />;
}

export default App;
