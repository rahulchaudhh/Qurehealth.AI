import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && isAuthenticated && user) {
            navigate('/dashboard');
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
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Admin Login</h2>
                <div className="flex items-center justify-center gap-2 mb-6 group">
                    <div className="w-8 h-8 flex items-center justify-center bg-purple-50 text-purple-600 rounded-lg">
                        <span className="font-bold text-lg">A</span>
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
            </div>
        </div >
    );
}

export default Login;
