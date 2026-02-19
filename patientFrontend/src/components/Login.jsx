import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';

function Login() {
  const navigate = useNavigate();
  const { login, googleLogin, user, loading } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const googleBtnRef = useRef(null);

  // If already logged in as patient, go to dashboard
  useEffect(() => {
    if (!loading && user?.role === 'patient') {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, navigate]);

  // Google Sign-In button init
  useEffect(() => {
    if (loading) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleBtnRef.current) return;

    const tryInit = () => {
      if (!window.google?.accounts?.id) return false;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setError('');
          setSubmitting(true);
          const result = await googleLogin(response.credential);
          setSubmitting(false);
          if (!result.success) {
            setError(result.error);
          } else {
            redirectByRole(result.role);
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline', size: 'large', width: 400, text: 'signin_with_google', locale: 'en',
      });
      return true;
    };

    if (!tryInit()) {
      const t = setInterval(() => { if (tryInit()) clearInterval(t); }, 300);
      return () => clearInterval(t);
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect based on role after login
  function redirectByRole(role) {
    const token = localStorage.getItem('token');
    if (role === 'admin') {
      window.location.href = `http://localhost:5175/dashboard?token=${token}`;
    } else if (role === 'doctor') {
      window.location.href = `http://localhost:5174/dashboard?token=${token}`;
    } else {
      navigate('/dashboard', { replace: true });
    }
  }

  // Form submit
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
    } else {
      redirectByRole(result.role);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Qurehealth<span className="text-slate-900">.AI</span>
          </span>
        </div>

        {error && <div className="auth-error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="auth-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="auth-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          <span style={{ color: '#9ca3af', fontSize: '13px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
        </div>

        {/* Google Sign-In */}
        <div ref={googleBtnRef} style={{ width: '100%', marginBottom: '20px' }}></div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;