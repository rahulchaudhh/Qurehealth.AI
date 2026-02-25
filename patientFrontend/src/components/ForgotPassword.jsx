import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import '../styles/Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await axios.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Reset link sent! Check your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
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

        <h2 className="auth-title" style={{ fontSize: '22px', marginBottom: '6px' }}>Forgot Password</h2>
        <p className="auth-subtitle" style={{ marginBottom: '24px' }}>
          Enter your email and we'll send you a reset link.
        </p>

        {error && <div className="auth-error-box">{error}</div>}

        {message ? (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '16px',
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✉️</div>
            <strong>Check your email!</strong>
            <p style={{ margin: '8px 0 0', color: '#15803d' }}>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="auth-input"
                placeholder="Enter your registered email"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="auth-button" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Remember your password? <Link to="/login" className="auth-link">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
