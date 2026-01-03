import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';


export default function Dashboard() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState('dashboard');

  const user = {
    name: authUser?.name || 'Rahul Sharma',
    email: authUser?.email || 'rahul@example.com',
    phone: authUser?.phone || '+977 9841234567',
    dateOfBirth: authUser?.dateOfBirth || '1990-05-15',
    gender: authUser?.gender,
    bloodType: 'O+',
    allergies: 'Penicillin'
  };

  const handleLogout = async () => {
    try {
      const axios = (await import('../api/axios')).default;
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    window.location.href = 'http://localhost:5173';
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [symptoms, setSymptoms] = useState([]);
  const [searchSymptom, setSearchSymptom] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);

  const symptomList = [
    'Fever', 'Cough', 'Headache', 'Fatigue', 'Nausea', 'Dizziness',
    'Chest Pain', 'Shortness of Breath', 'Sore Throat', 'Body Aches',
    'Runny Nose', 'Vomiting', 'Diarrhea', 'Skin Rash', 'Joint Pain'
  ];

  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Use axios instance which handles auth header
        const axios = (await import('../api/axios')).default;
        const res = await axios.get('/doctor/all');
        const doctorData = res.data.data.map(d => ({
          id: d._id,
          name: d.name,
          specialty: d.specialization,
          rating: 4.8, // Placeholder as rating not in model yet
          experience: d.experience,
          hospital: 'Qurehealth Hospital', // Placeholder or add to model
          available: 'Today, 2:00 PM', // Placeholder
          fee: 'NPR 1500', // Placeholder
          profilePicture: d.profilePicture
        }));
        setDoctors(doctorData);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    if (currentPage === 'doctors' || currentPage === 'prediction') {
      fetchDoctors();
    }
  }, [currentPage]);

  // ... inside Dashboard component
  const [myAppointments, setMyAppointments] = useState([]);

  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        const axios = (await import('../api/axios')).default;
        const res = await axios.get('/appointments/my-appointments');
        setMyAppointments(res.data.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    if (currentPage === 'appointments' || currentPage === 'dashboard' || currentPage === 'history') {
      fetchMyAppointments();
    }
  }, [currentPage]);

  // Derived state for medical history (completed appointments)
  const medicalHistory = myAppointments.filter(apt => apt.status === 'completed');

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingData, setBookingData] = useState({ date: '', time: '', reason: '' });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const axios = (await import('../api/axios')).default;
        const res = await axios.get('/notifications');
        setNotifications(res.data.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const axios = (await import('../api/axios')).default;
      await axios.post('/appointments', {
        doctorId: selectedDoctor.id,
        date: bookingData.date,
        time: bookingData.time,
        reason: bookingData.reason
      });
      alert('Appointment booked successfully!');
      setSelectedDoctor(null);
      setBookingData({ date: '', time: '', reason: '' }); // Reset form
      // Could also refresh appointments list here
    } catch (error) {
      console.error('Booking failed:', error);
      alert(error.response?.data?.error || 'Failed to book appointment');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const axios = (await import('../api/axios')).default;
      await axios.put('/notifications/mark-all-read');
      // Optimistically update UI
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const addSymptom = (symptom) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
    }
    setSearchSymptom('');
  };

  const removeSymptom = (symptom) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const analyzeSymptoms = () => {
    if (symptoms.length === 0) {
      alert('Please add at least one symptom');
      return;
    }

    const diseases = [
      { name: 'Common Cold', probability: 75, description: 'Viral infection of the upper respiratory tract' },
      { name: 'Influenza (Flu)', probability: 60, description: 'Respiratory illness caused by influenza viruses' },
      { name: 'Viral Fever', probability: 55, description: 'Fever caused by viral infections' }
    ];

    setPrediction(diseases);

    const filtered = doctors.filter(d =>
      d.specialty === 'General Physician' ||
      d.specialty === 'Pulmonologist' ||
      d.specialty === 'ENT Specialist'
    );
    setRecommendedDoctors(filtered);
    setCurrentPage('prediction');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Notifications */}


      {/* Health Stats */}
      {/* Header */}
      {/* Header */}
      <header className="bg-white px-10 py-4 flex justify-between items-center border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Qurehealth<span className="text-blue-600">.AI</span>
          </span>
        </div>
        <nav className="flex gap-8 hidden md:flex">
          <a href="#" onClick={() => setCurrentPage('dashboard')} className={`text-sm font-medium py-2 cursor-pointer transition-colors ${currentPage === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Dashboard</a>
          <a href="#" onClick={() => setCurrentPage('symptoms')} className={`text-sm font-medium py-2 cursor-pointer transition-colors ${currentPage === 'symptoms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Symptom Checker</a>
          <a href="#" onClick={() => setCurrentPage('doctors')} className={`text-sm font-medium py-2 cursor-pointer transition-colors ${currentPage === 'doctors' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Find Doctors</a>
          <a href="#" onClick={() => setCurrentPage('appointments')} className={`text-sm font-medium py-2 cursor-pointer transition-colors ${currentPage === 'appointments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Appointments</a>
          <a href="#" onClick={() => setCurrentPage('history')} className={`text-sm font-medium py-2 cursor-pointer transition-colors ${currentPage === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>History</a>
        </nav>
        <div className="flex items-center gap-4">

          {/* Notification Icon */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <span className="text-xl">🔔</span>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeIn"
                onMouseEnter={() => {
                  if (window.notificationTimeout) {
                    clearTimeout(window.notificationTimeout);
                    window.notificationTimeout = null;
                  }
                }}
                onMouseLeave={() => {
                  window.notificationTimeout = setTimeout(() => {
                    setShowNotifications(false);
                  }, 3000);
                }}
              >
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Notifications</h3>
                  <button onClick={handleMarkAllRead} className="text-xs text-blue-600 cursor-pointer hover:underline bg-transparent border-none p-0">Mark all read</button>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No new notifications</div>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map(notif => (
                      <div key={notif._id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`}>
                        <p className="text-sm text-gray-800 mb-1">{notif.message}</p>
                        <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
            onClick={() => navigate('/patient/profile')}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-100">
              <img
                src={user?.gender?.toLowerCase() === 'female' ? '/avatar_female.png' : '/avatar_male.png'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user.name}</span>
          </div>
        </div>
      </header>

      {/* Dashboard Page */}
      {currentPage === 'dashboard' && (
        <main className="max-w-7xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, <span className="text-blue-600">{user.name}</span> 👋
            </h1>
            <p className="text-gray-600">Here's your health overview for today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div
              className="group relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
              onClick={() => setCurrentPage('symptoms')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full opacity-20 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Check Symptoms</h3>
                <p className="text-sm text-gray-700">AI-powered disease prediction</p>
              </div>
            </div>

            <div
              className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200 cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
              onClick={() => setCurrentPage('doctors')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full opacity-20 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">👨‍⚕️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Find Doctors</h3>
                <p className="text-sm text-gray-700">Book with top specialists</p>
              </div>
            </div>

            <div
              className="group relative bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
              onClick={() => setCurrentPage('appointments')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full opacity-20 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">My Appointments</h3>
                <p className="text-sm text-gray-700">Manage your schedule</p>
              </div>
            </div>

            <div
              className="group relative bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border border-amber-200 cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
              onClick={() => setCurrentPage('history')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full opacity-20 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📋</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Medical History</h3>
                <p className="text-sm text-gray-700">Access health records</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">


            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Visits</h2>
                <span className="text-2xl">📅</span>
              </div>
              {myAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming visits.</p>
              ) : (
                myAppointments.slice(0, 2).map(apt => (
                  <div key={apt._id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl mb-3 hover:shadow-md transition-all cursor-pointer border border-gray-200" onClick={() => setCurrentPage('appointments')}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-gray-900 mb-1">{apt.doctor.name}</div>
                        <div className="text-xs text-blue-600 font-medium">{apt.doctor.specialization || 'Specialist'}</div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${apt.status === 'confirmed' ? 'text-emerald-700 bg-emerald-100 border-emerald-200' :
                        'text-yellow-700 bg-yellow-100 border-yellow-200'
                        }`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <span>📅</span> {new Date(apt.date).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span>🕐</span> {apt.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Health Tips</h2>
                <span className="text-2xl">💡</span>
              </div>
              <div className="space-y-3">
                <a
                  href="https://www.healthline.com/nutrition/7-health-benefits-of-water"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200 overflow-hidden group hover:shadow-md transition-all"
                >
                  <div className="absolute inset-0 bg-cyan-200 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative flex gap-3 items-start">
                    <span className="text-xl">💧</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1">
                        Stay Hydrated
                        <span className="text-[11px] text-cyan-600 opacity-40 group-hover:opacity-100 transition-opacity">↗</span>
                      </div>
                      <div className="text-xs text-gray-600">Drink 8 glasses of water daily</div>
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 overflow-hidden group hover:shadow-md transition-all"
                >
                  <div className="absolute inset-0 bg-green-200 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative flex gap-3 items-start">
                    <span className="text-xl">🥗</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1">
                        Healthy Diet
                        <span className="text-[11px] text-green-700 opacity-40 group-hover:opacity-100 transition-opacity">↗</span>
                      </div>
                      <div className="text-xs text-gray-600">More fruits and vegetables</div>
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.sleepfoundation.org/sleep-hygiene"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 overflow-hidden group hover:shadow-md transition-all"
                >
                  <div className="absolute inset-0 bg-indigo-200 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative flex gap-3 items-start">
                    <span className="text-xl">😴</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-1">
                        Quality Sleep
                        <span className="text-[11px] text-indigo-600 opacity-40 group-hover:opacity-100 transition-opacity">↗</span>
                      </div>
                      <div className="text-xs text-gray-600">7-8 hours every night</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-r from-red-500 to-red-600 p-8 rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 -ml-24 -mb-24"></div>

            <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">🚨</span>
                  <h2 className="text-2xl font-bold">24/7 Emergency Services</h2>
                </div>
                <p className="text-red-100 text-sm mb-2">Immediate medical assistance available anytime</p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Helpline:</span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full font-bold">102</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Ambulance:</span>
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full font-bold">1-4200-1990</span>
                  </div>
                </div>
              </div>
              <button className="px-8 py-4 bg-white text-red-600 rounded-xl text-base font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                <span className="text-xl">📞</span>
                Call Emergency Now
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Symptom Checker Page */}
      {currentPage === 'symptoms' && (
        <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md mb-5 text-sm text-gray-700 transition-colors" onClick={() => setCurrentPage('dashboard')}>← Back to Dashboard</button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Symptom Checker</h1>
          <p className="text-base text-gray-600 mb-8">Select your symptoms and get instant disease predictions.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Search Symptoms</h2>
              <input
                type="text"
                placeholder="Type to search symptoms..."
                value={searchSymptom}
                onChange={(e) => setSearchSymptom(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm mb-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <div className="flex flex-wrap gap-2">
                {symptomList
                  .filter(s => s.toLowerCase().includes(searchSymptom.toLowerCase()))
                  .map(symptom => (
                    <button
                      key={symptom}
                      onClick={() => addSymptom(symptom)}
                      disabled={symptoms.includes(symptom)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${symptoms.includes(symptom)
                        ? 'bg-blue-100 text-blue-600 border border-blue-200 opacity-50 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                        }`}
                    >
                      {symptom}
                    </button>
                  ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Selected Symptoms ({symptoms.length})</h2>
              {symptoms.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">No symptoms selected.</p>
              ) : (
                <div className="space-y-2 mb-5">
                  {symptoms.map(symptom => (
                    <div key={symptom} className="flex justify-between items-center px-3 py-2 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-900 animate-fadeIn">
                      {symptom}
                      <button onClick={() => removeSymptom(symptom)} className="text-red-400 hover:text-red-600 text-lg font-bold px-1 transition-colors">×</button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={analyzeSymptoms}
                disabled={symptoms.length === 0}
                className={`w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all shadow-md ${symptoms.length > 0
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white cursor-pointer hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
              >
                Analyze Symptoms
              </button>
            </div>
          </div>
        </main>
      )}

      {currentPage === 'prediction' && (
        <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
          <button className="px-4 py-2 bg-gray-100 rounded-md mb-5 text-sm text-gray-700" onClick={() => setCurrentPage('symptoms')}>← Back to Symptom Checker</button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prediction Results</h1>
          <p className="text-base text-gray-600 mb-8">Based on symptoms: <span className="font-medium text-gray-900">{symptoms.join(', ')}</span></p>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-8 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">⚠️</div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  <strong>Disclaimer:</strong> This is an AI-based prediction. Consult a professional for diagnosis.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-5">Possible Conditions</h2>
            {prediction && prediction.map((disease, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 mb-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{disease.name}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">{disease.probability}% Match</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${disease.probability}%` }}></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{disease.description}</p>
              </div>
            ))}
          </div>
          {/* Doctors Section in Prediction */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-5">👨‍⚕️ Recommended Doctors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedDoctors.map(doctor => (
                <div key={doctor.id} className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-all group">
                  <div className="mb-3 flex justify-center">
                    {doctor.profilePicture ? (
                      <img
                        src={`http://localhost:5001/${doctor.profilePicture}`}
                        alt={doctor.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 shadow-sm"
                      />
                    ) : (
                      <div className="text-5xl group-hover:scale-110 transition-transform">🩺</div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{doctor.name}</h3>
                  <p className="text-sm text-blue-600 mb-3">{doctor.specialty}</p>
                  <div className="flex justify-center gap-4 mb-3 text-xs">
                    <div className="text-amber-500 font-bold">⭐ {doctor.rating}</div>
                    <div className="text-gray-600">{doctor.experience} years exp.</div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{doctor.hospital}</p>
                  <div className="flex justify-between text-xs text-gray-700 mb-4 p-2 bg-gray-50 rounded-md">
                    <span>🕐 {doctor.available}</span>
                    <span className="font-semibold text-green-700">{doctor.fee}</span>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 shadow-md"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Find Doctors Page */}
      {currentPage === 'doctors' && (
        <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
          <button className="px-4 py-2 bg-gray-100 rounded-md mb-5 text-sm text-gray-700" onClick={() => setCurrentPage('dashboard')}>← Back to Dashboard</button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find & Book Doctors</h1>
          <p className="text-base text-gray-600 mb-8">Connect with qualified healthcare professionals</p>

          <div className="flex gap-4 mb-6">
            <input type="text" placeholder="Search doctors or specialties..." className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm" />
            <select className="px-4 py-3 border border-gray-300 rounded-lg text-sm min-w-[200px]">
              <option>All Specialties</option>
              <option>Cardiologist</option>
              <option>General Physician</option>
              <option>Pulmonologist</option>
              <option>ENT Specialist</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map(doctor => (
              <div key={doctor.id} className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-all">
                <div className="mb-3 flex justify-center">
                  {doctor.profilePicture ? (
                    <img
                      src={`http://localhost:5001/${doctor.profilePicture}`}
                      alt={doctor.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 shadow-sm"
                    />
                  ) : (
                    <div className="text-5xl">🩺</div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {(() => {
                    const cleanName = doctor.name.replace(/^(dr\.?)\s*/i, '');
                    return `Dr. ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`;
                  })()}
                </h3>
                <p className="text-sm text-blue-600 mb-3">{doctor.specialty}</p>
                <div className="flex justify-center gap-4 mb-3 text-xs">
                  <div className="text-yellow-600">⭐ {doctor.rating}</div>
                  <div className="text-gray-600">{doctor.experience} years exp.</div>
                </div>
                <p className="text-xs text-gray-600 mb-3">{doctor.hospital}</p>
                <div className="flex justify-between text-xs text-gray-700 mb-4 p-2 bg-gray-50 rounded-md">
                  <span>🕐 {doctor.available}</span>
                  <span className="font-semibold text-green-700">{doctor.fee}</span>
                </div>
                <button
                  onClick={() => setSelectedDoctor(doctor)}
                  className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 shadow-md"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Appointments Page */}
      {currentPage === 'appointments' && (
        <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
          <button className="px-4 py-2 bg-gray-100 rounded-md mb-5 text-sm text-gray-700 hover:bg-gray-200 transition-colors" onClick={() => setCurrentPage('dashboard')}>← Back to Dashboard</button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-base text-gray-600 mb-8">Manage your scheduled consultations</p>

          <div className="space-y-4">
            {myAppointments.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-500">No upcoming appointments found.</p>
                <button onClick={() => setCurrentPage('doctors')} className="mt-4 text-blue-600 font-semibold hover:underline">Find a Doctor</button>
              </div>
            ) : (
              myAppointments.map(apt => (
                <div key={apt._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{apt.doctor.name}</h3>
                      <p className="text-sm text-gray-600">{apt.doctor.specialization || 'Specialist'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-md text-xs font-semibold ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-6 mb-6 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      {new Date(apt.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🕐</span>
                      {apt.time}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                      View Details
                    </button>
                    <button className="px-6 py-2.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                      Reschedule
                    </button>
                    <button className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {/* Medical History Page */}
      {currentPage === 'history' && (
        <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md mb-5 text-sm text-gray-700 transition-colors" onClick={() => setCurrentPage('dashboard')}>← Back to Dashboard</button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical History</h1>
          <p className="text-base text-gray-600 mb-8">Your complete health records and past consultations</p>

          <div className="space-y-4">
            {medicalHistory.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-xl border border-gray-200 text-gray-500">
                No medical history records found.
              </div>
            ) : (
              medicalHistory.map((record) => (
                <div key={record._id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{new Date(record.date).toLocaleDateString()}</div>
                      <h3 className="text-lg font-bold text-gray-900">{record.diagnosis || record.reason}</h3>
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase rounded-full tracking-wider border border-green-100">
                      Completed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Doctor</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                            Dr
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{record.doctor.name}</p>
                            <p className="text-xs text-gray-500">{record.doctor.specialization}</p>
                          </div>
                        </div>
                      </div>

                      {record.doctorNotes && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Doctor's Notes</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                            "{record.doctorNotes}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {record.prescription && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Prescription</h4>
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed font-medium">
                              {record.prescription}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Book Appointment</h2>
                <p className="text-blue-100 text-sm mt-1">with {selectedDoctor.name}</p>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="text-white/80 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <select
                    required
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">Select Time</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                  <textarea
                    required
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                    placeholder="Briefly describe your symptoms or reason for visit..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Qurehealth<span className="text-blue-400">.AI</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                AI feature healthcare platform providing intelligent symptom analysis, doctor consultations, and seamless appointment management.
              </p>
              <div className="flex gap-3">
                <a href="https://x.com/RahulChaudh_" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                </a>
                <a href="https://www.linkedin.com/in/rahul-chaudhary-5063a12b1/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </a>
                <a href="https://www.facebook.com/rahul.chaudhary.230651" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.641c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" /></svg>
                </a>
                <a href="https://www.instagram.com/rahulchaudhh_" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                <li><a onClick={() => handleNavigation('dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Dashboard</a></li>
                <li><a onClick={() => handleNavigation('symptoms')} className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Symptom Checker</a></li>
                <li><a onClick={() => handleNavigation('doctors')} className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Find Doctors</a></li>
                <li><a onClick={() => handleNavigation('appointments')} className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Appointments</a></li>
                <li><a onClick={() => handleNavigation('history')} className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Medical History</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400">📍</span>
                  <span>Jadibuti Kathmandu, Nepal</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400">📧</span>
                  <a href="mailto:rc005405@gmail.com" className="hover:text-white transition-colors text-gray-400">
                    support@qurehealth.ai
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400">📞</span>
                  <a href="tel:9817831552" className="hover:text-white transition-colors text-gray-400">
                    +977-9817831552
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400">🚨</span>
                  <span className="text-gray-400">Emergency: <a href="tel:102" className="text-white hover:text-red-400 transition-colors font-bold">102</a></span>
                </li>
              </ul>
            </div>

            {/* Account Actions */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">Account</h4>
              <ul className="space-y-2.5 mb-5">
                <li><a onClick={() => navigate('/patient/profile')} className="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">My Profile</a></li>
                <li><span className="text-gray-400 text-sm">Logged in as <span className="text-blue-400 font-medium">{user.name}</span></span></li>
              </ul>
              <button
                onClick={handleLogout}
                className="w-full px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 group"
              >
                <span>Log out</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2025 QureHealth.AI. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Help Center</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}