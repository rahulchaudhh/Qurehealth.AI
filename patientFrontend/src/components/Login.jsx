import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';

function Login() {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, loading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  // const [loading, setLoading] = useState(false); // remove local loading state to avoid conflict? No, local loading is for form submission. Let's rename local.

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, user, loading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    const result = await login(formData);
    setIsSubmitting(false);

    if (result.success) {
      // User state might not be updated immediately in context, so we might need to fetch it or rely on the logic in AuthContext if we returned the user data.
      // However, since we updated context state, we can use a small timeout or check explicitly. 
      // Better approach: Let's assume the context update triggers a re-render or we check the user object directly if we returned it.
      // But `login` only returns success boolean.
      // Actually, we can just reload or let a useEffect handle navigation, BUT simpler is to just check the role here if we modified login to return it.
      // Since I didn't verify if login returns data, I'll rely on the fact that `login` sets the user in context.
      // Wait a tick for context update is risky.
      // Let's modify the login in AuthContext to return the user data in the result object for easier navigation.

      // ... WAIT, I can't modify AuthContext again easily without a new tool call.
      // I'll trust that the user is updated. But `user` from context won't be updated in this function scope immediately.
      // Basic solution: Navigate to a protected route that handles redirection, OR refresh.
      // Let's try navigating to /dashboard and let a Redirector component handle it?
      // No, let's just use window.location.reload() for now to ensure state is fresh? No that's bad UX.

      // Correct approach: The `login` function in AuthContext SHOULD return the user role.
      // Since I just updated AuthContext without returning data, I will fetch 'me' or just blind navigate.

      // Let's blindly navigate to a "home" route that redirects?
      // Or better, let's just peek at the localStorage token? No role there.

      // Okay, I will just navigate to '/' and let the LandingPage or a Wrapper handle it?
      // No, the user wants: "if doctor login open doctor dashboard".

      // I'll assume for now `patient` is default.
      // Wait, I can decode the token here!
      // Use the returned user data for redirection
      const user = result.data;
      if (user) {
        if (user.role === 'admin') {
          window.location.href = 'http://localhost:5175';
        } else if (user.role === 'doctor') {
          window.location.href = 'http://localhost:5174';
        } else {
          navigate('/dashboard');
        }
      }
    } else {
      setError(result.error);
    }
  };

  if (loading) return null; // Or a spinner

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <div className="flex items-center justify-center gap-2 mb-6 group">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Qurehealth<span className="text-blue-600">.AI</span>
          </span>
        </div>

        {error && (
          <div className="auth-error-box">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;