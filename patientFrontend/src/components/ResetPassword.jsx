import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/Auth.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Qurehealth<span className="text-slate-900">.AI</span>
          </span>
        </div>

        <h2 className="auth-title" style={{ fontSize: '22px', marginBottom: '6px' }}>Reset Password</h2>
        <p className="auth-subtitle" style={{ marginBottom: '24px' }}>
          Enter your new password below.
        </p>

        {error && <div className="auth-error-box">{error}</div>}

        {success ? (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
            <strong>Password Reset Successful!</strong>
            <p style={{ margin: '8px 0 0', color: '#15803d' }}>
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label">New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="auth-input"
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                autoFocus
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="auth-input"
                placeholder="Re-enter your password"
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="auth-button" disabled={submitting}>
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login" className="auth-link">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
