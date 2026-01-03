import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';

function Register() {
  const navigate = useNavigate();
  const { register, user, isAuthenticated, loading } = useContext(AuthContext);

  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    // Doctor specific
    specialization: '',
    experience: ''
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in required fields');
      setIsSubmitting(false);
      return;
    }

    if (role === 'doctor') {
      if (!formData.specialization || !formData.experience) {
        setError('Please fill in specialization and experience');
        setIsSubmitting(false);
        return;
      }
      if (!formData.profilePicture) {
        setError('Please upload a profile picture');
        setIsSubmitting(false);
        return;
      }
    }

    // Create FormData
    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('email', formData.email);
    submissionData.append('password', formData.password);
    submissionData.append('phone', formData.phone);
    submissionData.append('role', role);
    submissionData.append('gender', formData.gender);

    if (role === 'patient') {
      submissionData.append('dateOfBirth', formData.dateOfBirth);
    } else {
      submissionData.append('specialization', formData.specialization);
      submissionData.append('experience', formData.experience);
      submissionData.append('profilePicture', formData.profilePicture);
    }

    const result = await register(submissionData);

    setIsSubmitting(false);

    if (result.success) {
      if (role === 'doctor') {
        setSuccessMsg('Registration successful! Your account is pending approval by an Admin. You will be able to login once approved.');
        // Reset form
        setFormData({
          name: '', email: '', password: '', phone: '', dateOfBirth: '', gender: 'male',
          specialization: '', experience: '', profilePicture: null
        });
      } else {
        setSuccessMsg('Registration successful! Please login to continue.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } else {
      setError(result.error);
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profilePicture: e.target.files[0]
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card max-w-lg">
        {/* ... Header ... */}
        <h2 className="auth-title">Create Account</h2>
        {/* Role Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setRole('patient')}
          >
            Patient
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'doctor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setRole('doctor')}
          >
            Doctor
          </button>
        </div>

        {/* ... Success/Error ... */}

        {!successMsg && (
          <form onSubmit={handleSubmit} className="auth-form" encType="multipart/form-data">
            {/* ... Name, Email, Password ... */}
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

            {role === 'doctor' && (
              <>
                <div className="auth-form-group">
                  <label className="auth-label">Specialization*</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="auth-input"
                    placeholder="e.g. Cardiologist"
                  />
                </div>
                <div className="auth-form-group">
                  <label className="auth-label">Experience (Years)*</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="auth-input"
                  />
                </div>
                <div className="auth-form-group">
                  <label className="auth-label">Profile Picture*</label>
                  <input
                    type="file"
                    name="profilePicture"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="auth-input p-2 border border-gray-300 rounded-md"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a professional photo for your profile icon.</p>
                </div>
              </>
            )}

            {/* ... Rest of fields ... */}
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

            <div className="grid grid-cols-2 gap-4">
              {role === 'patient' && (
                <div className="auth-form-group">
                  <label className="auth-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="auth-input"
                  />
                </div>
              )}
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
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;