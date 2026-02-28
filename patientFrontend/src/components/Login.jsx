import { useState, useContext, useEffect } from 'react';
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

  // If already logged in as patient, go to dashboard
  useEffect(() => {
    if (!loading && user?.role === 'patient') {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, navigate]);

  // Google Sign-In via redirect (avoids GSI origin restriction on localhost)
  function handleGoogleLogin() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) { setError('Google Sign-In is not configured.'); return; }
    const redirectUri = 'http://localhost:5001/api/auth/google/callback';
    const scope = 'openid email profile';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = url;
  }

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
        <div className="flex items-center justify-center gap-1 mb-8">
          <img src="/logo.png" alt="Qurehealth.AI" className="w-8 h-8 object-contain" />
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
            <div style={{ textAlign: 'right', marginTop: '6px' }}>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: '13px' }}>
                Forgot Password?
              </Link>
            </div>
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
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '10px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            background: '#fff',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseOut={e => e.currentTarget.style.background = '#fff'}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.2 33.6 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 2.9l6.4-6.4C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.8 0 20-7.8 20-21 0-1.4-.1-2.7-.5-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3 0 5.8 1.1 7.9 2.9l6.4-6.4C34.5 5.1 29.5 3 24 3c-7.7 0-14.4 4.4-17.7 11.7z"/>
            <path fill="#FBBC05" d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.6 36.6 26.9 37.5 24 37.5c-5.5 0-10.2-3.7-11.8-8.7l-7 5.4C8.3 41 15.5 45 24 45z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.2-4.3 5.5l6.5 5.3C41.8 36.1 45 30.5 45 24c0-1.4-.1-2.7-.5-4z"/>
          </svg>
          Sign in with Google
        </button>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;