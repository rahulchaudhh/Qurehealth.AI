import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import { AuthContext } from '../context/AuthContext';
import Toast from './Toast';
import PaymentButton from './PaymentButton';


export default function Dashboard() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toastData, setToastData] = useState({ message: '', type: '', isVisible: false });

  const showToast = (message, type) => {
    setToastData({ message, type, isVisible: true });
  };

  // Toast helper object to replace react-toastify calls
  const toast = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info'),
    warn: (msg) => showToast(msg, 'info'),
  };

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

  const specialtyMap = {
    "Fungal infection": ["Dermatologist", "General Physician"],
    "Allergy": ["Allergist", "General Physician"],
    "GERD": ["Gastroenterologist", "General Physician"],
    "Chronic cholestasis": ["Hepatologist", "Gastroenterologist"],
    "Drug Reaction": ["Dermatologist", "Allergist", "General Physician"],
    "Peptic ulcer diseae": ["Gastroenterologist", "General Physician"],
    "AIDS": ["Infectious Disease Specialist", "General Physician"],
    "Diabetes": ["Endocrinologist", "General Physician"],
    "Gastroenteritis": ["Gastroenterologist", "General Physician"],
    "Bronchial Asthma": ["Pulmonologist", "General Physician"],
    "Hypertension": ["Cardiologist", "General Physician"],
    "Migraine": ["Neurologist", "General Physician"],
    "Cervical spondylosis": ["Orthopedic Surgeon", "Neurologist", "Physiotherapist"],
    "Paralysis (brain hemorrhage)": ["Neurologist", "Physiotherapist"],
    "Jaundice": ["Hepatologist", "Gastroenterologist", "General Physician"],
    "Malaria": ["Infectious Disease Specialist", "General Physician"],
    "Chicken pox": ["Infectious Disease Specialist", "General Physician"],
    "Dengue": ["Infectious Disease Specialist", "General Physician"],
    "Typhoid": ["Infectious Disease Specialist", "General Physician"],
    "hepatitis A": ["Hepatologist", "Infectious Disease Specialist"],
    "Hepatitis B": ["Hepatologist", "Infectious Disease Specialist"],
    "Hepatitis C": ["Hepatologist", "Infectious Disease Specialist"],
    "Hepatitis D": ["Hepatologist", "Infectious Disease Specialist"],
    "Hepatitis E": ["Hepatologist", "Infectious Disease Specialist"],
    "Alcoholic hepatitis": ["Hepatologist", "Gastroenterologist"],
    "Tuberculosis": ["Pulmonologist", "Infectious Disease Specialist"],
    "Common Cold": ["General Physician", "ENT Specialist"],
    "Pneumonia": ["Pulmonologist", "General Physician"],
    "Dimorphic hemmorhoids(piles)": ["Proctologist", "General Surgeon"],
    "Heart attack": ["Cardiologist"],
    "Varicose veins": ["Vascular Surgeon", "Dermatologist"],
    "Hypothyroidism": ["Endocrinologist"],
    "Hyperthyroidism": ["Endocrinologist"],
    "Hypoglycemia": ["Endocrinologist", "General Physician"],
    "Osteoarthristis": ["Orthopedic Surgeon", "Physiotherapist"],
    "Arthritis": ["Rheumatologist", "Orthopedic Surgeon"],
    "(vertigo) Paroymsal Positional Vertigo": ["ENT Specialist", "Neurologist"],
    "Acne": ["Dermatologist"],
    "Urinary tract infection": ["Urologist", "General Physician"],
    "Psoriasis": ["Dermatologist"],
    "Impetigo": ["Dermatologist", "Infectious Disease Specialist"]
  };

  const [symptoms, setSymptoms] = useState([]);
  const [searchSymptom, setSearchSymptom] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);

  const [symptomList, setSymptomList] = useState([]);

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const axios = (await import('../api/axios')).default;
        const res = await axios.get('/predict/symptoms');
        if (res.data.symptoms) {
          setSymptomList(res.data.symptoms);
        }
      } catch (error) {
        console.error('Failed to fetch symptoms:', error);
        // Fallback or empty
      }
    };
    if (currentPage === 'symptoms' && symptomList.length === 0) {
      fetchSymptoms();
    }
  }, [currentPage]);

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
          hospital: 'Qurehealth Care', // Placeholder or add to model
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

  const [pendingAppointment, setPendingAppointment] = useState(null); // { id: '...', amount: 1500 }
  const [viewAppointment, setViewAppointment] = useState(null);
  const [viewHistory, setViewHistory] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, recordId: null });

  const generatePDF = (record) => {
    console.log("generatePDF called with record:", record);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;

      // --- Header (Letterhead Style) ---
      // Company Name
      doc.setFontSize(24);
      doc.setTextColor(37, 99, 235); // Brand Blue
      doc.setFont("helvetica", "bold");
      doc.text("Qurehealth Care", margin, 30);

      // Report Title & Date
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Gray
      doc.setFont("helvetica", "normal");
      doc.text("MEDICAL REPORT", pageWidth - margin, 25, { align: "right" });
      doc.text(`Date: ${new Date(record.date).toLocaleDateString()}`, pageWidth - margin, 30, { align: "right" });
      doc.text(`Ref: ${record._id.slice(-8).toUpperCase()}`, pageWidth - margin, 35, { align: "right" });

      // Divider Line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, 45, pageWidth - margin, 45);

      let yPos = 65;

      // --- Patient & Doctor Details (2 Columns, Clean Text) ---
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "bold");
      doc.text("PATIENT", margin, yPos);
      doc.text("DOCTOR", 110, yPos);

      yPos += 10;

      // Patient Name
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0); // Black
      doc.setFont("helvetica", "normal");
      doc.text(user?.name || record.patient?.name || "N/A", margin, yPos);

      // Doctor Name
      doc.text(`Dr. ${record.doctor.name}`, 110, yPos);

      yPos += 8;

      // Secondary Details
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80); // Dark Gray
      doc.text(`ID: ${record._id}`, margin, yPos);
      doc.text(record.doctor.specialization, 110, yPos);
      yPos += 5;
      doc.text(record.doctor.hospital || 'Qurehealth Care', 110, yPos);

      yPos += 30;

      // --- Diagnosis Section ---
      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235); // Blue Accent
      doc.setFont("helvetica", "bold");
      doc.text("DIAGNOSIS", margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      const splitDiagnosis = doc.splitTextToSize(record.diagnosis || record.reason || 'N/A', pageWidth - (margin * 2));
      doc.text(splitDiagnosis, margin, yPos);
      yPos += (splitDiagnosis.length * 7) + 20;

      // --- Prescription Section ---
      if (record.prescription) {
        doc.setFontSize(11);
        doc.setTextColor(37, 99, 235);
        doc.setFont("helvetica", "bold");
        doc.text("PRESCRIPTION (Rx)", margin, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        const splitPrescription = doc.splitTextToSize(record.prescription, pageWidth - (margin * 2));
        doc.text(splitPrescription, margin, yPos);
        yPos += (splitPrescription.length * 7) + 20;
      }

      // --- Notes Section ---
      if (record.doctorNotes) {
        doc.setFontSize(11);
        doc.setTextColor(37, 99, 235);
        doc.setFont("helvetica", "bold");
        doc.text("NOTES", margin, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "italic");

        const splitNotes = doc.splitTextToSize(record.doctorNotes, pageWidth - (margin * 2));
        doc.text(splitNotes, margin, yPos);
      }

      // --- Footer & Signature (Bottom) ---
      const footerY = pageHeight - 20;

      // Line only
      doc.setDrawColor(226, 232, 240);
      doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

      // Page Number
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.setFont("helvetica", "normal");
      doc.text("Page 1/1", pageWidth - 20, footerY + 5, { align: "right" });

      doc.save(`Medical_Report_${new Date(record.date).toLocaleDateString().replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF: " + error.message);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const axios = (await import('../api/axios')).default;
      await axios.put(`/appointments/${appointmentId}/cancel`);

      // Update local state
      setMyAppointments(prev => prev.map(apt =>
        apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
      ));
      toast.info('Appointment cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleReschedule = (apt) => {
    // For rescheduling, we can prompt the user to book a new appointment
    // and optionally cancel the old one, or just open the booking flow.
    // Here we will open the booking flow for the same doctor.
    if (apt.status === 'cancelled' || apt.status === 'completed') {
      toast.warn('Cannot reschedule a completed or cancelled appointment.');
      return;
    }
    const confirmReschedule = window.confirm('To reschedule, please book a new slot. Do you want to proceed to booking?');
    if (confirmReschedule) {
      setSelectedDoctor(apt.doctor);
    }
  };

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
      const res = await axios.post('/appointments', {
        doctorId: selectedDoctor.id,
        date: bookingData.date,
        time: bookingData.time,
        reason: bookingData.reason
      });

      // Instead of alerting success, we move to payment step
      // Parse fee from "NPR 1500" -> 1500
      /* PAYMENT BYPASSED
      const feeString = selectedDoctor.fee || "1500";
      const amount = parseInt(feeString.replace(/[^0-9]/g, '')) || 1500;
 
      setPendingAppointment({
        id: res.data.data._id, // Assuming response structure
        amount: amount
      });
      */

      toast.success('Appointment booked successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setSelectedDoctor(null);
      setBookingData({ date: '', time: '', reason: '' });

      // Refresh appointments list
      setMyAppointments(prev => [...prev, res.data.data]);
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(error.response?.data?.error || 'Failed to book appointment');
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

  const handleDeleteRecord = (recordId) => {
    setDeleteConfirmation({ isOpen: true, recordId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.recordId) return;

    try {
      const axios = (await import('../api/axios')).default;
      await axios.delete(`/appointments/${deleteConfirmation.recordId}`);

      setMyAppointments(prev => prev.filter(apt => apt._id !== deleteConfirmation.recordId));
      setViewHistory(null);
      setDeleteConfirmation({ isOpen: false, recordId: null });
      toast.success('Record deleted successfully');
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast.error('Failed to delete record');
      setDeleteConfirmation({ isOpen: false, recordId: null });
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

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      toast.warn('Please add at least one symptom');
      return;
    }

    try {
      const axios = (await import('../api/axios')).default;

      // Send selected symptoms as list of strings
      const payload = {
        symptoms: symptoms
      };

      const res = await axios.post('/predict', payload);

      // Backend returns { predicted_disease: "Disease Name" }
      const diseaseName = res.data.predicted_disease || res.data.prediction || "Unknown Condition";

      const result = [{
        name: diseaseName,
        probability: res.data.confidence ? Math.round(res.data.confidence * 100) : 95,
        description: 'Based on your symptoms and our AI analysis.'
      }];

      setPrediction(result);

      // Get the recommended specialties for the predicted disease
      const recommendedSpecialties = specialtyMap[diseaseName] || ["General Physician"];

      // Filter doctors based on prediction (case-insensitive)
      let filtered = doctors.filter(d =>
        recommendedSpecialties.some(spec => spec.toLowerCase() === d.specialty.toLowerCase())
      );

      // Fallback: If no specialist found, show all approved doctors
      if (filtered.length === 0) {
        console.warn(`No specialist found for ${diseaseName}, falling back to all doctors.`);
        filtered = doctors;
      }

      setRecommendedDoctors(filtered);
      setCurrentPage('prediction');

    } catch (error) {
      console.error('Prediction failed:', error);
      toast.error('Failed to get prediction from AI service.');
    }
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
            Qurehealth.AI
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
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${apt.status === 'confirmed' ? 'text-blue-700 bg-blue-100 border-blue-200' :
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm mb-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
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
                      {symptom.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
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
                      {symptom.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
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
                        src={doctor.profilePicture.startsWith('data:') || doctor.profilePicture.startsWith('http') ? doctor.profilePicture : `http://localhost:5001/${doctor.profilePicture}`}
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
            <input type="text" placeholder="Search doctors or specialties..." className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-900" />
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
                      src={doctor.profilePicture.startsWith('data:') || doctor.profilePicture.startsWith('http') ? doctor.profilePicture : `http://localhost:5001/${doctor.profilePicture}`}
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
        <main className="max-w-5xl mx-auto py-12 px-6 min-h-[calc(100vh-140px)]">
          {/* Header */}
          <div className="mb-10">
            <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 flex items-center gap-1.5" onClick={() => setCurrentPage('dashboard')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              Back
            </button>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
                <p className="text-base text-gray-600">Your scheduled consultations</p>
              </div>
              <button
                onClick={() => setCurrentPage('doctors')}
                className="px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                + New Booking
              </button>
            </div>
          </div>

          {/* Appointments List */}
          {myAppointments.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl">
              <div className="text-gray-300 text-5xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No appointments</h3>
              <p className="text-gray-400 text-sm mb-6">Book your first consultation</p>
              <button onClick={() => setCurrentPage('doctors')} className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                Find a Doctor
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myAppointments.map(apt => {
                const isMissed = new Date(apt.date) < new Date().setHours(0, 0, 0, 0) && apt.status === 'pending';
                const statusStyles = {
                  confirmed: 'bg-emerald-50 text-emerald-600',
                  completed: 'bg-blue-50 text-blue-600',
                  cancelled: 'bg-gray-100 text-gray-400',
                  pending: 'bg-amber-50 text-amber-600',
                  missed: 'bg-red-50 text-red-500'
                };
                const currentStatus = isMissed ? 'missed' : apt.status;
                const statusLabel = isMissed ? 'Missed' : apt.status.charAt(0).toUpperCase() + apt.status.slice(1);

                return (
                  <div
                    key={apt._id}
                    className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Doctor Info */}
                      <div className="flex items-center gap-4">
                        {apt.doctor.profilePicture && apt.doctor.profilePicture.trim() !== '' ? (
                          <img
                            src={apt.doctor.profilePicture.startsWith('data:') || apt.doctor.profilePicture.startsWith('http') ? apt.doctor.profilePicture : `http://localhost:5001/${apt.doctor.profilePicture}`}
                            alt={apt.doctor.name}
                            className="w-11 h-11 rounded-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div
                          className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm"
                          style={{ display: apt.doctor.profilePicture && apt.doctor.profilePicture.trim() !== '' ? 'none' : 'flex' }}
                        >
                          {apt.doctor.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{apt.doctor.name}</h3>
                          <p className="text-sm text-gray-500">{apt.doctor.specialization || 'Specialist'}</p>
                        </div>
                      </div>

                      {/* Center: Date & Time */}
                      <div className="hidden md:flex items-center gap-6 text-base text-gray-600">
                        <span>{new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-gray-300">|</span>
                        <span>{apt.time}</span>
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[currentStatus] || statusStyles.pending}`}>
                          {statusLabel}
                        </span>
                        <button
                          onClick={() => setViewAppointment(apt)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && !isMissed ? (
                          <button
                            onClick={() => handleCancelAppointment(apt._id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteRecord(apt._id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile: Date & Time */}
                    <div className="md:hidden mt-3 pt-3 border-t border-gray-50 flex items-center gap-4 text-xs text-gray-400">
                      <span>{new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <span>{apt.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
              <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-8">
                {medicalHistory.map((record) => (
                  <div key={record._id} className="relative pl-8 group">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm ring-1 ring-blue-100"></div>

                    {/* Date Header */}
                    <div className="text-sm font-semibold text-gray-400 mb-2 font-mono tracking-wide">
                      {new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>

                    {/* Content Card */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{record.diagnosis || record.reason}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                              Dr. {record.doctor.name}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span>{record.doctor.specialization}</span>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => navigate(`/medical-record/${record._id}`)}
                              className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => generatePDF(record)}
                              className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 flex items-center gap-1.5"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                              Download Report
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-100">
                            Completed
                          </span>
                          <button
                            onClick={() => handleDeleteRecord(record._id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all mt-1"
                            title="Delete Record"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn transform transition-all">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Doctor Summary */}
            <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-white">
                {selectedDoctor.profilePicture ? (
                  <img src={selectedDoctor.profilePicture.startsWith('data:') || selectedDoctor.profilePicture.startsWith('http') ? selectedDoctor.profilePicture : `http://localhost:5001/${selectedDoctor.profilePicture}`} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-100">🩺</div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedDoctor.name}</h3>
                <p className="text-sm text-blue-600 font-medium">{selectedDoctor.specialty}</p>
                <p className="text-xs text-gray-500 mt-0.5">{selectedDoctor.hospital} • {selectedDoctor.experience} yrs exp</p>
              </div>
              <div className="ml-auto text-right">
                <span className="block text-xs text-gray-500 uppercase tracking-wider font-bold">Fee</span>
                <span className="text-lg font-bold text-green-600">{selectedDoctor.fee}</span>
              </div>
            </div>

            {pendingAppointment ? (
              <div className="p-8 text-center bg-gray-50/50">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💳</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Payment</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Your appointment slot is reserved. Please complete the payment of <span className="font-bold text-gray-900">NPR {pendingAppointment.amount}</span> to confirm.
                </p>

                <PaymentButton
                  amount={pendingAppointment.amount}
                  appointmentId={pendingAppointment.id}
                  onPaymentInitiated={() => console.log("Payment initiated")}
                  onError={(msg) => toast.error(msg)}
                />

                <button
                  onClick={() => {
                    setSelectedDoctor(null);
                    setPendingAppointment(null);
                  }}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Cancel & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30 text-gray-700 font-medium text-sm"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Time</label>
                    <div className="relative">
                      <select
                        required
                        value={bookingData.time}
                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30 text-gray-700 font-medium text-sm appearance-none"
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
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Reason for Visit</label>
                  <textarea
                    required
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                    placeholder="Describe your symptoms (e.g., severe headache, fever)..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/30 text-gray-700 text-sm min-h-[100px] resize-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    className="flex-1 px-5 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors border border-gray-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all transform active:scale-95 text-sm flex items-center justify-center gap-2"
                  >
                    <span>Confirm Booking</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}


      {/* Appointment Details Modal */}
      {viewAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
              <button
                onClick={() => setViewAppointment(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Doctor</h3>
                <p className="text-lg font-bold text-gray-900">{viewAppointment.doctor.name}</p>
                <p className="text-sm text-blue-600">{viewAppointment.doctor.specialization}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Date</h3>
                  <p className="text-gray-900">{new Date(viewAppointment.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Time</h3>
                  <p className="text-gray-900">{viewAppointment.time}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Status</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${(new Date(viewAppointment.date) < new Date().setHours(0, 0, 0, 0) && viewAppointment.status === 'pending') ? 'bg-red-100 text-red-700' :
                  viewAppointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    viewAppointment.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      viewAppointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                  }`}>
                  {(new Date(viewAppointment.date) < new Date().setHours(0, 0, 0, 0) && viewAppointment.status === 'pending') ? 'Missed' : viewAppointment.status}
                </span>
              </div>

              {viewAppointment.reason && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Reason</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {viewAppointment.reason}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewAppointment(null)}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medical History Details Modal */}
      {viewHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-gray-900">Medical Record</h2>
              <button
                onClick={() => setViewHistory(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">TREATMENT FOR</h3>
                  <p className="text-2xl font-bold text-gray-900">{viewHistory.diagnosis || viewHistory.reason}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">DATE</span>
                  <p className="text-gray-900 font-medium">{new Date(viewHistory.date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Doctor Card - Blue */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-lg shadow-sm">
                  Dr
                </div>
                <div>
                  <p className="font-bold text-gray-900">{viewHistory.doctor.name}</p>
                  <p className="text-sm text-blue-600 font-medium">{viewHistory.doctor.specialization}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{viewHistory.doctor.hospital || 'Qurehealth Care'}</p>
                </div>
              </div>

              {/* Prescription Card - Yellow */}
              {viewHistory.prescription && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">PRESCRIPTION</h3>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <p className="text-gray-800 whitespace-pre-line font-medium leading-relaxed">
                      {viewHistory.prescription}
                    </p>
                  </div>
                </div>
              )}

              {/* Doctor Notes - Gray */}
              {viewHistory.doctorNotes && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">DOCTOR'S NOTES</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-600 italic text-sm leading-relaxed">
                      "{viewHistory.doctorNotes}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-white flex gap-3">
              <button
                onClick={() => setViewHistory(null)}
                className="flex-1 px-5 py-3 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors border border-gray-200 text-sm"
              >
                Close
              </button>
              <button
                onClick={() => { generatePDF(viewHistory); }}
                className="flex-[2] px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all transform active:scale-95 text-sm flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download Report
              </button>
              <button
                onClick={() => handleDeleteRecord(viewHistory._id)}
                className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-100"
                title="Delete Record"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn transform transition-all scale-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Record?</h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to delete this record? This action cannot be undone and will remove it from your history.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false, recordId: null })}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Qurehealth.AI
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                AI feature healthcare platform providing intelligent symptom analysis, doctor consultations, and seamless appointment management.
              </p>
              <div className="flex gap-3">
                <a href="https://x.com/RahulChaudh_" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="https://www.linkedin.com/in/rahul-chaudhary-5063a12b1/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0077b5] text-white hover:opacity-90 transition-opacity">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </a>
                <a href="https://www.facebook.com/rahul.chaudhary.230651" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.641c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" /></svg>
                </a>
                <a href="https://www.instagram.com/rahulchaudhh_" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-90 transition-opacity">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                <li><a onClick={() => handleNavigation('dashboard')} className="text-gray-500 hover:text-blue-600 transition-colors text-sm cursor-pointer">Dashboard</a></li>
                <li><a onClick={() => handleNavigation('symptoms')} className="text-gray-500 hover:text-blue-600 transition-colors text-sm cursor-pointer">Symptom Checker</a></li>
                <li><a onClick={() => handleNavigation('doctors')} className="text-gray-500 hover:text-blue-600 transition-colors text-sm cursor-pointer">Find Doctors</a></li>
                <li><a onClick={() => handleNavigation('appointments')} className="text-gray-500 hover:text-blue-600 transition-colors text-sm cursor-pointer">Appointments</a></li>
                <li><a onClick={() => handleNavigation('history')} className="text-gray-500 hover:text-blue-600 transition-colors text-sm cursor-pointer">Medical History</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600">📍</span>
                  <span>Jadibuti Kathmandu, Nepal</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600">📧</span>
                  <a href="mailto:rc005405@gmail.com" className="hover:text-blue-600 transition-colors">
                    support@qurehealth.ai
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600">📞</span>
                  <a href="tel:9817831552" className="hover:text-blue-600 transition-colors">
                    +977-9817831552
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500">🚨</span>
                  <span>Emergency: <a href="tel:102" className="text-red-500 hover:text-red-600 transition-colors font-bold">102</a></span>
                </li>
              </ul>
            </div>

            {/* Account Actions */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Account</h4>
              <ul className="space-y-2.5 mb-5">
                <li><a onClick={() => navigate('/patient/profile')} className="text-gray-500 hover:text-blue-600 transition-colors text-sm cursor-pointer">My Profile</a></li>
                <li><span className="text-gray-500 text-sm">Logged in as <span className="text-blue-600 font-medium">{user.name}</span></span></li>
              </ul>
              <button
                onClick={handleLogout}
                className="w-full px-5 py-2.5 bg-white text-red-600 border border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 group shadow-sm"
              >
                <span>Log out</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2025 QureHealth.AI. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Help Center</a>
            </div>
          </div>
        </div>
      </footer>

      {toastData.isVisible && (
        <Toast
          message={toastData.message}
          type={toastData.type}
          onClose={() => setToastData({ ...toastData, isVisible: false })}
        />
      )}
    </div>
  );
}