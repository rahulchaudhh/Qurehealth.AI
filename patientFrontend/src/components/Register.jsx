import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';

function Register() {
  const navigate = useNavigate();
  const { register, doctorRegister, user, isAuthenticated, loading } = useContext(AuthContext);

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
  const successTimerRef = useRef(null);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/patientdashboard');
      else if (user.role === 'doctor') navigate('/doctor/patientdashboard');
      else navigate('/patientdashboard');
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
      /* OPTIONAL
      if (!formData.profilePicture) {
        setError('Please upload a profile picture');
        setIsSubmitting(false);
        return;
      }
      */
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

    const result = role === 'doctor'
      ? await doctorRegister(submissionData)
      : await register(submissionData);

    setIsSubmitting(false);

    if (result.success) {
      if (role === 'doctor') {
        setSuccessMsg('Registration successful! Your account is pending approval by an Admin. You will be able to login once approved.');
        // Reset form
        setFormData({
          name: '', email: '', password: '', phone: '', dateOfBirth: '', gender: 'male',
          specialization: '', experience: '', profilePicture: null
        });
        // Modal now requires manual click (no auto-dismiss)
      } else {
        setSuccessMsg('Registration successful! Please login to continue.');
        // Modal now requires manual click (no auto-dismiss)
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
        {!(successMsg && role === 'doctor') && (
          <>
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
          </>
        )}

        {error && (
          <div className="auth-error-box">
            {error}
          </div>
        )}

        {successMsg && role === 'doctor' && (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-6"
            style={{ animation: 'fadeInUp 0.35s ease both' }}
          >
            <style>{`
              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(18px); }
                to   { opacity: 1; transform: translateY(0); }
              }
              @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.55); }
                to   { opacity: 1; transform: scale(1); }
              }
            `}</style>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-xl px-10 py-12 w-full max-w-md flex flex-col items-center">

              {/* Brand */}
              <p className="text-black font-bold text-base tracking-wide mb-8">Qurehealth<span className="font-bold">.AI</span></p>

              {/* Success Icon */}
              <div
                className="flex items-center justify-center w-24 h-24 rounded-full bg-indigo-50 border-4 border-indigo-100 mb-6"
                style={{ animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}
              >
                <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Heading */}
              <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Registration Submitted Successfully
              </h3>

              {/* Status Badge */}
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-semibold mb-5">
                
                Pending Admin Approval
              </span>

              {/* Info text */}
              <p className="text-gray-500 text-sm text-center max-w-xs mb-1">
                Approval typically takes <span className="font-semibold text-gray-700">24–48 hours</span>.
              </p>
              <p className="text-gray-500 text-sm text-center max-w-xs mb-8">
                You will receive an <span className="font-semibold text-gray-700">email notification</span> once your account has been reviewed and approved.
              </p>

              {/* Divider */}
              <div className="w-full border-t border-gray-100 mb-6" />

              {/* Buttons */}
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => {
                    clearTimeout(successTimerRef.current);
                    navigate('/login');
                  }}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#4F46E5,#6366f1)' }}
                >
                  Go to Login
                </button>
                <button
                  onClick={() => {
                    clearTimeout(successTimerRef.current);
                    navigate('/');
                  }}
                  className="w-full py-3 rounded-xl text-gray-600 font-semibold text-sm transition-all duration-200 border border-gray-200 hover:bg-gray-50"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {successMsg && role === 'patient' && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-2xl shadow-xl px-10 py-12 w-full max-w-md flex flex-col items-center"
              style={{ animation: 'fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {/* Brand */}
              <p className="text-black font-bold text-base tracking-wide mb-8">QureHealth<span className="font-bold">.AI</span></p>

              {/* Success Icon */}
              <div
                className="flex items-center justify-center w-24 h-24 rounded-full bg-green-50 border-4 border-green-100 mb-6"
                style={{ animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}
              >
                <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Heading */}
              <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Registration Successful
              </h3>

              {/* Status Badge */}
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-semibold mb-5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Ready to Login
              </span>

              {/* Info text */}
              <p className="text-gray-500 text-sm text-center max-w-xs mb-8">
                Your account has been created successfully. You can now log in with your credentials.
              </p>

              {/* Divider */}
              <div className="w-full border-t border-gray-100 mb-6" />

              {/* Buttons */}
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}
                >
                  Go to Login
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 rounded-xl text-gray-600 font-semibold text-sm transition-all duration-200 border border-gray-200 hover:bg-gray-50"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit} className="auth-form" encType="multipart/form-data">
            {/* ... Name, Email, Password ... */}
            <div className="auth-form-group">
              <label className="auth-label">Full Name</label>
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
              <label className="auth-label">Email</label>
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
              <label className="auth-label">Password</label>
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
                  <label className="auth-label">Specialization</label>
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
                  <label className="auth-label">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="auth-input"
                    min="0"
                    onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                  />
                </div>
                <div className="auth-form-group">
                  <label className="auth-label">Profile Picture</label>
                  <input
                    type="file"
                    name="profilePicture"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="auth-input p-2 border border-gray-300 rounded-md"
                  // required - Removed
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload a professional photo for your profile icon (Optional).</p>
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

        {!(successMsg && role === 'doctor') && (
          <p className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Login here</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default Register;