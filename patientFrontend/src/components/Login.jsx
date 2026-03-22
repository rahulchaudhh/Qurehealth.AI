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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user?.role === 'patient') {
      navigate('/patientdashboard', { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('message') === 'unauthorized') {
      setError('Please log in to access this page.');
    }
  }, []);

  function handleGoogleLogin() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) { setError('Google Sign-In is not configured.'); return; }
    const redirectUri = 'http://localhost:5001/api/auth/google/callback';
    const scope = 'openid email profile';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = url;
  }

  function redirectBasedOnRole(role) {
    if (role === 'admin') {
      window.location.href = 'http://localhost:5175/admindashboard';
    } else if (role === 'doctor') {
      window.location.href = 'http://localhost:5174/doctordashboard';
    } else {
      navigate('/patientdashboard', { replace: true });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error);
    } else {
      redirectBasedOnRole(result.role);
    }
  }

  if (loading) {
    return (
      <div className="login-loading">
        <div className="login-spinner" />
      </div>
    );
  }

  return (
    <div className="lp-root">

      {/* Background decoration */}
      <div className="lp-bg-blob lp-bg-blob-1" />
      <div className="lp-bg-blob lp-bg-blob-2" />

      {/* Card */}
      <div className="lp-card">

        {/* Left — branding */}
        <div className="lp-left">
          <div className="lp-left-inner">

            <div className="lp-hero">
              <p className="lp-tagline">Healthcare, simplified</p>
              <h2 className="lp-headline">The smarter way to<br /><span className="lp-headline-em">manage your health.</span></h2>
              <p className="lp-body">Book top specialists, track medical records, and get AI-powered health insights — all in one place.</p>
            </div>

            <ul className="lp-features">
              <li className="lp-feature">
                <span className="lp-feature-dot" />
                Instant appointment booking
              </li>
              <li className="lp-feature">
                <span className="lp-feature-dot" />
                AI symptom checker
              </li>
              <li className="lp-feature">
                <span className="lp-feature-dot" />
                Secure medical records
              </li>
            </ul>

            <div className="lp-stats">
              <div className="lp-stat">
                <span className="lp-stat-val">10K+</span>
                <span className="lp-stat-key">Patients</span>
              </div>
              <div className="lp-stat-sep" />
              <div className="lp-stat">
                <span className="lp-stat-val">500+</span>
                <span className="lp-stat-key">Doctors</span>
              </div>
              <div className="lp-stat-sep" />
              <div className="lp-stat">
                <span className="lp-stat-val">4.9★</span>
                <span className="lp-stat-key">Rating</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right — form */}
        <div className="lp-right">
          <div className="lp-form-wrap">

            {/* Brand */}
            <div className="lp-brand">
              <img src="/qurehealth-logo.png" alt="Qurehealth.AI" className="lp-brand-img" />
              <span className="lp-brand-name">Qurehealth<span className="lp-brand-accent">.AI</span></span>
            </div>

            <h1 className="lp-form-title">Welcome back</h1>
            <p className="lp-form-sub">Sign in to your account to continue</p>

            {error && <div className="lp-error">{error}</div>}

            <form onSubmit={handleSubmit} className="lp-form">

              <div className="lp-field">
                <label className="lp-label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="lp-input"
                  placeholder="rohan@gmail.com"
                  required
                />
              </div>

              <div className="lp-field">
                <div className="lp-label-row">
                  <label className="lp-label">Password</label>
                  <Link to="/forgot-password" className="lp-forgot">Forgot password?</Link>
                </div>
                <div className="lp-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="lp-input"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" className="lp-eye" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                    {showPassword ? (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    ) : (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="lp-btn" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>

            </form>

            <div className="lp-divider"><span /><span className="lp-divider-text">or</span><span /></div>

            <button type="button" onClick={handleGoogleLogin} className="lp-google-btn">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.2 33.6 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 2.9l6.4-6.4C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.8 0 20-7.8 20-21 0-1.4-.1-2.7-.5-4z" />
                <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3 0 5.8 1.1 7.9 2.9l6.4-6.4C34.5 5.1 29.5 3 24 3c-7.7 0-14.4 4.4-17.7 11.7z" />
                <path fill="#FBBC05" d="M24 45c5.4 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.6 36.6 26.9 37.5 24 37.5c-5.5 0-10.2-3.7-11.8-8.7l-7 5.4C8.3 41 15.5 45 24 45z" />
                <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.8 2.3-2.3 4.2-4.3 5.5l6.5 5.3C41.8 36.1 45 30.5 45 24c0-1.4-.1-2.7-.5-4z" />
              </svg>
              Continue with Google
            </button>

            <p className="lp-register">
              Don't have an account? <Link to="/register" className="lp-register-link">Create one</Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
