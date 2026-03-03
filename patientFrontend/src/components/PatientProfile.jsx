import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

// Helper — derive username handle from name
const toHandle = (name = '') =>
    name.trim().replace(/\s+/g, '') || 'User';

// Format date of birth for display e.g. "Feb 01, 2000"
const formatDOB = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

function PatientProfile() {
    const { user, updateUserProfile, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        dateOfBirth: '',
        gender: 'male'
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
                gender: user.gender || 'male'
            });
        }
    }, [user]);

    const showToast = (type, text) => {
        setToast({ show: true, type, text });
        setTimeout(() => setToast({ show: false, type: '', text: '' }), 3500);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.put('/auth/profile', formData);
            updateUserProfile(data.data);
            showToast('success', 'Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const avatarSrc = user?.gender?.toLowerCase() === 'female'
        ? '/avatar_female.png'
        : '/avatar_male.png';

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Top bar ── */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
                <span className="text-base font-semibold text-gray-800">My Profile</span>
                <div className="w-28" /> {/* spacer */}
            </div>

            {/* ── Toast ── */}
            {toast.show && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
                    ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'success'
                        ? <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        : <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    }
                    {toast.text}
                </div>
            )}

            <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

                {/* ── LEFT: Profile card ── */}
                <div className="w-full lg:w-72 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* gradient header */}
                        <div className="h-20 bg-gradient-to-r from-teal-400 to-cyan-500" />

                        {/* avatar */}
                        <div className="flex flex-col items-center -mt-10 pb-6 px-5">
                            <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-teal-50">
                                <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="mt-3 text-lg font-bold text-gray-900 text-center leading-tight">
                                {user?.name || 'Patient'}
                            </h2>
                            <p className="text-sm text-gray-400 font-medium">@{toHandle(user?.name)}</p>
                        </div>

                        <hr className="border-gray-100" />

                        {/* info rows */}
                        <ul className="divide-y divide-gray-50 px-5 py-2">
                            <InfoRow
                                icon={
                                    <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                }
                                label={user?.email || '—'}
                            />
                            <InfoRow
                                icon={
                                    <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                }
                                label={user?.phone || 'No phone added'}
                            />
                            <InfoRow
                                icon={
                                    <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                }
                                label={formatDOB(user?.dateOfBirth)}
                            />
                            <InfoRow
                                icon={
                                    <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                }
                                label={user?.gender
                                    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                                    : 'Not specified'}
                            />
                        </ul>

                        <hr className="border-gray-100" />

                        {/* quick links */}
                        <div className="px-5 py-3 space-y-1">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/appointments')}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                My Appointments
                            </button>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Edit form ── */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                        <h3 className="text-base font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
                            Edit Profile Information
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                {/* Full Name */}
                                <FormField label="Full Name">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm
                                            focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                                    />
                                </FormField>

                                {/* Email (read only) */}
                                <FormField label="Email Address">
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                                    />
                                </FormField>

                                {/* Phone */}
                                <FormField label="Phone Number">
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. 9800000000"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm
                                            focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                                    />
                                </FormField>

                                {/* Date of Birth */}
                                <FormField label="Date of Birth">
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm
                                            focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                                    />
                                </FormField>

                                {/* Gender */}
                                <FormField label="Gender">
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm
                                            focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </FormField>
                            </div>

                            {/* Account type badge */}
                            <div className="pt-2">
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Account Type</p>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    Patient
                                </span>
                            </div>

                            {/* Submit */}
                            <div className="pt-3 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold text-white
                                        bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-100 transition-all
                                        ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    {loading
                                        ? <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Saving...
                                        </>
                                        : <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Save Changes
                                        </>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── Account danger zone ── */}
                    <div className="mt-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Account</h3>
                        <p className="text-xs text-gray-400 mb-4">Manage your session and account actions</p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate('/forgot-password')}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Change Password
                            </button>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-100 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Small reusable components ──

function FormField({ label, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {label}
            </label>
            {children}
        </div>
    );
}

function InfoRow({ icon, label }) {
    return (
        <li className="flex items-center gap-3 py-2.5">
            <span className="shrink-0">{icon}</span>
            <span className="text-sm text-gray-600 truncate">{label}</span>
        </li>
    );
}

export default PatientProfile;
