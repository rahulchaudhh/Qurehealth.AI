import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const user = {
    name: authUser?.name || 'Guest',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
    dateOfBirth: authUser?.dateOfBirth || '',
    bloodType: 'O+', // Placeholder
    allergies: 'None' // Placeholder
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  const doctors = [
    { id: 1, name: 'Dr. Anil Kumar', specialty: 'Cardiologist', rating: 4.8, experience: 15, hospital: 'Grande International Hospital', available: 'Today, 2:00 PM', fee: 'NPR 1500' },
    { id: 2, name: 'Dr. Priya Thapa', specialty: 'General Physician', rating: 4.9, experience: 12, hospital: 'Nepal Mediciti Hospital', available: 'Tomorrow, 10:00 AM', fee: 'NPR 1000' },
    { id: 3, name: 'Dr. Rajesh Pokharel', specialty: 'Pulmonologist', rating: 4.7, experience: 18, hospital: 'Bir Hospital', available: 'Today, 4:30 PM', fee: 'NPR 1200' },
    { id: 4, name: 'Dr. Sunita Adhikari', specialty: 'ENT Specialist', rating: 4.6, experience: 10, hospital: 'Norvic International Hospital', available: 'Tomorrow, 11:00 AM', fee: 'NPR 1100' }
  ];

  const appointments = [
    { id: 1, doctor: 'Dr. Anil Kumar', specialty: 'Cardiology', date: 'Oct 26, 2023', time: '10:00 AM', status: 'Upcoming' },
    { id: 2, doctor: 'Dr. Priya Thapa', specialty: 'General Practice', date: 'Nov 15, 2023', time: '2:30 PM', status: 'Upcoming' }
  ];

  const medicalHistory = [
    { date: 'Sep 15, 2023', condition: 'Annual Checkup', doctor: 'Dr. Priya Thapa', notes: 'All vitals normal' },
    { date: 'Aug 10, 2023', condition: 'Fever', doctor: 'Dr. Sunita Adhikari', notes: 'Viral infection, prescribed medication' }
  ];

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
      {/* Header */}
      <header className="bg-white px-10 py-4 flex justify-between items-center border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="text-xl font-bold text-blue-600 cursor-pointer flex items-center gap-2">
          <span>🩺</span> Qurehealth
        </div>
        <nav className="flex gap-8 hidden md:flex">
          <a href="#" onClick={() => setCurrentPage('dashboard')} className={`text-sm font-medium py-2 cursor-pointer transition-colors ${currentPage === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Dashboard</a>
          <a href="#" onClick={() => setCurrentPage('symptoms')} className={`text-sm font-medium py-2 cursor-pointer transition-colors ${currentPage === 'symptoms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Symptom Checker</a>
          <a href="#" onClick={() => setCurrentPage('doctors')} className={`text-sm font-medium py-2 cursor-pointer transition-colors ${currentPage === 'doctors' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Find Doctors</a>
          <a href="#" onClick={() => setCurrentPage('appointments')} className={`text-sm font-medium py-2 cursor-pointer transition-colors ${currentPage === 'appointments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Appointments</a>
          <a href="#" onClick={() => setCurrentPage('history')} className={`text-sm font-medium py-2 cursor-pointer transition-colors ${currentPage === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>History</a>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user.name}</span>
          <button onClick={handleLogout} className="px-5 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-md text-sm font-medium transition-colors">
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard Page */}
      {currentPage === 'dashboard' && (
        <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
          <h1 className="text-3xl text-gray-900 mb-8 font-bold">
            Welcome back, <span className="text-blue-600">{user.name}</span> 👋
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <div className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-lg transition-all text-center group" onClick={() => setCurrentPage('symptoms')}>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Symptoms</h3>
              <p className="text-sm text-gray-600">AI-powered disease prediction</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-lg transition-all text-center group" onClick={() => setCurrentPage('doctors')}>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">👨‍⚕️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Doctors</h3>
              <p className="text-sm text-gray-600">Book appointment with specialists</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-lg transition-all text-center group" onClick={() => setCurrentPage('appointments')}>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My Appointments</h3>
              <p className="text-sm text-gray-600">View and manage bookings</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 cursor-pointer hover:shadow-lg transition-all text-center group" onClick={() => setCurrentPage('history')}>
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Medical History</h3>
              <p className="text-sm text-gray-600">Access your health records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b pb-2">Health Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600 mb-1">120/80</div>
                  <div className="text-xs text-gray-600 font-medium">Blood Pressure</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-xl font-bold text-red-600 mb-1">72 bpm</div>
                  <div className="text-xs text-gray-600 font-medium">Heart Rate</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600 mb-1">98.6°F</div>
                  <div className="text-xs text-gray-600 font-medium">Temperature</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600 mb-1">{user.bloodType}</div>
                  <div className="text-xs text-gray-600 font-medium">Blood Type</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b pb-2">Upcoming Appointments</h2>
              {appointments.slice(0, 2).map(apt => (
                <div key={apt.id} className="p-3 bg-gray-50 rounded-lg mb-3 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-sm text-gray-800">{apt.doctor}</strong>
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">{apt.status}</span>
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <span>{apt.specialty}</span>
                    <span>•</span>
                    <span>{apt.date} at {apt.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b pb-2">Daily Health Tips</h2>
              <div className="space-y-3">
                <div className="text-sm text-gray-700 p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex gap-2">
                  <span>💧</span> Stay hydrated - drink at least 8 glasses of water daily
                </div>
                <div className="text-sm text-gray-700 p-3 bg-yellow-50 rounded-lg border border-yellow-100 flex gap-2">
                  <span>🥗</span> Include more fruits and vegetables in your diet
                </div>
                <div className="text-sm text-gray-700 p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex gap-2">
                  <span>😴</span> Maintain 7-8 hours of sleep schedule
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-red-700 mb-1">🚨 Emergency Services</h2>
              <p className="text-sm text-red-800">24/7 Helpline: <strong>102</strong> | Ambulance: <strong>1-4200-1990</strong></p>
            </div>
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-red-700 transition-colors animate-pulse">
              Call Emergency
            </button>
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
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🩺</div>
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
                  <button className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 shadow-md">Book Appointment</button>
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
                <div className="text-5xl mb-3">🩺</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{doctor.name}</h3>
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
                <button className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700">Book Appointment</button>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Appointments Page */}
      {currentPage === 'appointments' && (
        <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
          <button className="px-4 py-2 bg-gray-100 rounded-md mb-5 text-sm text-gray-700" onClick={() => setCurrentPage('dashboard')}>← Back to Dashboard</button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-base text-gray-600 mb-8">Manage your scheduled consultations</p>

          <div className="space-y-4">
            {appointments.map(apt => (
              <div key={apt.id} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{apt.doctor}</h3>
                    <p className="text-sm text-gray-600">{apt.specialty}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">{apt.status}</span>
                </div>
                <div className="flex gap-6 mb-4 text-sm text-gray-700">
                  <div>📅 {apt.date}</div>
                  <div>🕐 {apt.time}</div>
                </div>
                <div className="flex gap-3">
                  <button className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold">View Details</button>
                  <button className="px-5 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md text-sm font-semibold">Reschedule</button>
                  <button className="px-5 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-semibold">Cancel</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Medical History Page */}
      {currentPage === 'history' && (
        <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
          <button className="px-4 py-2 bg-gray-100 rounded-md mb-5 text-sm text-gray-700" onClick={() => setCurrentPage('dashboard')}>← Back to Dashboard</button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medical History</h1>
          <p className="text-base text-gray-600 mb-8">Your complete health records and past consultations</p>

          <div className="space-y-4">
            {medicalHistory.map((record, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-600 mb-2">{record.date}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{record.condition}</h3>
                <p className="text-sm text-blue-600 mb-2">Consulted: {record.doctor}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{record.notes}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-600 border-t border-gray-200 bg-white">
        © 2025 CureHealth.AI - Your Complete Healthcare Management Solution
      </footer>
    </div>
  );
}