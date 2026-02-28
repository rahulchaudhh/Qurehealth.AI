import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';

function Register() {
    const navigate = useNavigate();
    const { register } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        specialization: '',
        experience: '',
        phone: '',
        gender: 'male'
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.name || !formData.email || !formData.password || !formData.specialization || !formData.experience) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        const result = await register(formData);

        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Doctor Register</h2>
                <div className="flex items-center justify-center gap-1 mb-6 group">
                    <img src="/logo.png" alt="Qurehealth.AI" className="w-8 h-8 object-contain" />
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
                        <label className="auth-label">Full Name*</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="auth-input"
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Email*</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="auth-input"
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Password*</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="auth-input"
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Specialization*</label>
                        <input
                            type="text"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            className="auth-input"
                            placeholder="e.g. Cardiologist"
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Years of Experience*</label>
                        <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            className="auth-input"
                            required
                            min="0"
                            onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="auth-input"
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="auth-input"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
