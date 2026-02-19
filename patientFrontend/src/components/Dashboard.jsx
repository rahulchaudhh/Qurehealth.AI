import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import { Bell, Search, UserRound, Calendar, ClipboardList, ExternalLink, Droplets, Apple, Moon, Zap, Clock, ArrowRight, ArrowLeft, X, AlertCircle, Stethoscope, Star, MapPin, Mail, Phone, AlertTriangle, ChevronLeft, CalendarDays, Download, Info, Trash2, Plus, Video, XCircle, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import Toast from './Toast';
import BroadcastModal from './BroadcastModal';



export default function Dashboard() {
  const navigate = useNavigate();
  const { user: authUser, logout, loading: authLoading } = useContext(AuthContext);

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toastData, setToastData] = useState({ message: '', type: '', isVisible: false });
  const [broadcastModal, setBroadcastModal] = useState({ isOpen: false, message: '', type: 'broadcast' });

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
    profilePicture: authUser?.profilePicture,
    bloodType: 'O+',
    allergies: 'Penicillin'
  };




  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      navigate('/');
    }
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
        const res = await api.get('/predict/symptoms');
        if (res.data.symptoms) {
          setSymptomList(res.data.symptoms);
        }
      } catch (error) {
        console.error('Failed to fetch symptoms:', error);
      }
    };
    if (currentPage === 'symptoms' && symptomList.length === 0) {
      fetchSymptoms();
    }
  }, [currentPage]);

  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log('Fetching doctors for page:', currentPage);
        const res = await api.get('/doctor/all');
        console.log('Doctors API response:', res.data);
        const doctorData = res.data.data.map(d => ({
          id: String(d._id),
          name: d.name,
          specialty: d.specialization || 'General Physician',
          rating: 4.8,
          experience: d.experience || 0,
          hospital: 'Qurehealth Care',
          available: 'Today, 2:00 PM',
          fee: 'NPR 1500',
          profilePicture: d.hasProfilePicture
            ? `/api/doctor/${d._id}/profile-picture`
            : null
        }));
        console.log('Processed doctor data:', doctorData);
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
        const res = await api.get('/appointments/my-appointments');
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
  const [isBooking, setIsBooking] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);


  const [viewAppointment, setViewAppointment] = useState(null);
  const [viewHistory, setViewHistory] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, recordId: null });
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [aptSearch, setAptSearch] = useState('');



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
    const checkNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.data);

        // Find newest unread broadcast/alert
        const unreadBroadcasts = res.data.data.filter(n => !n.isRead && (n.type === 'broadcast' || n.type === 'alert'));
        if (unreadBroadcasts.length > 0) {
          const latest = unreadBroadcasts[0];
          setBroadcastModal({
            isOpen: true,
            message: latest.message,
            type: latest.type
          });
          // Mark as read to avoid repeated popups
          await api.put(`/notifications/${latest._id}/read`);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (authUser) {
      // Delay initial notification check so dashboard renders first
      const initialTimeout = setTimeout(checkNotifications, 2000);
      const interval = setInterval(checkNotifications, 30000); // Poll every 30s instead of 15s
      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
      };
    }
  }, [authUser]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    // Validate required fields before sending
    if (!bookingData.time) {
      toast.error('Please select a time slot.');
      return;
    }
    if (!bookingData.date) {
      toast.error('Please select a date.');
      return;
    }
    if (!bookingData.reason || !bookingData.reason.trim()) {
      toast.error('Please enter a reason for your visit.');
      return;
    }

    // Support both mapped doctors ({id}) and populated MongoDB objects ({_id})
    const doctorId = selectedDoctor?.id || selectedDoctor?._id?.toString();
    if (!doctorId) {
      toast.error('Doctor information is missing. Please try again.');
      return;
    }

    try {
      setIsBooking(true);
      const res = await api.post('/appointments', {
        doctorId,
        date: bookingData.date,
        time: bookingData.time,
        reason: bookingData.reason.trim()
      });

      toast.success('Appointment booked successfully!');

      setSelectedDoctor(null);
      setBookingData({ date: '', time: '', reason: '' });

      // Refresh appointments list
      setMyAppointments(prev => [...prev, res.data.data]);
    } catch (error) {
      console.error('Booking failed:', error);
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Request timed out. Please check your connection and try again.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to book appointment');
      }
    } finally {
      setIsBooking(false);
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
      const res = await api.post('/predict', { symptoms });

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Skeleton Header */}
        <header className="bg-white px-10 py-4 flex justify-between items-center border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg"></div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </header>
        {/* Skeleton Content */}
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse mb-3"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Notifications */}


      {/* Health Stats */}
      {/* Header */}
      {/* Header */}
      <header className="bg-white px-10 py-4 flex justify-between items-center border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
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
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative flex items-center justify-center"
            >
              <Bell size={20} strokeWidth={2.5} />
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


          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate('/patient/profile')}>
              <img
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=128`}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=128`; }}
              />
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Patient</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Page */}
      {currentPage === 'dashboard' && (
        <main className="max-w-7xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h2>
            <p className="text-gray-500 text-sm">Welcome back, {user.name} — Here's your health overview</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div
              className="group relative bg-white p-6 rounded-2xl border border-gray-100 cursor-pointer hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
              onClick={() => setCurrentPage('symptoms')}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">Check Symptoms</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">AI-powered intelligent disease prediction and analysis</p>
              <div className="mt-4 flex items-center text-[10px] font-bold text-blue-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Start Analysis <ArrowRight size={12} className="ml-1" />
              </div>
            </div>

            <div
              className="group relative bg-white p-6 rounded-2xl border border-gray-100 cursor-pointer hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
              onClick={() => setCurrentPage('doctors')}
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <UserRound size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">Find Doctors</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">Book consultations with verified top health specialists</p>
              <div className="mt-4 flex items-center text-[10px] font-bold text-emerald-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Find Specialist <ArrowRight size={12} className="ml-1" />
              </div>
            </div>

            <div
              className="group relative bg-white p-6 rounded-2xl border border-gray-100 cursor-pointer hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300"
              onClick={() => setCurrentPage('appointments')}
            >
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-5 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <Calendar size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">My Appointments</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">Manage your upcoming and past medical consultations</p>
              <div className="mt-4 flex items-center text-[10px] font-bold text-purple-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Manage Schedule <ArrowRight size={12} className="ml-1" />
              </div>
            </div>

            <div
              className="group relative bg-white p-6 rounded-2xl border border-gray-100 cursor-pointer hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300"
              onClick={() => setCurrentPage('history')}
            >
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-5 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                <ClipboardList size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">Medical History</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">Access and download your complete health records</p>
              <div className="mt-4 flex items-center text-[10px] font-bold text-amber-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                View Records <ArrowRight size={12} className="ml-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">


            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Calendar size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Upcoming Visits</h2>
                </div>
                <button
                  onClick={() => setCurrentPage('appointments')}
                  className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline"
                >
                  View All
                </button>
              </div>
              {myAppointments.length === 0 ? (
                <div className="py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-xs font-medium">No upcoming consultations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myAppointments.slice(0, 2).map(apt => (
                    <div
                      key={apt._id}
                      className="p-4 bg-white rounded-xl hover:bg-gray-50 transition-all cursor-pointer border border-gray-100 group shadow-sm"
                      onClick={() => setCurrentPage('appointments')}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-gray-900 text-sm mb-0.5 group-hover:text-blue-600 transition-colors">{apt.doctor.name}</div>
                          <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-tight">{apt.doctor.specialization || 'Specialist'}</div>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${apt.status === 'confirmed'
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-amber-700 bg-amber-50'
                          }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-gray-600 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-gray-400" />
                          {apt.time}
                        </span>
                      </div>
                      {apt.meetingLink && apt.status === 'confirmed' && (
                        <a
                          href={apt.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                        >
                          Join Consultation <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                    <Zap size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Health Insights</h2>
                </div>
              </div>
              <div className="space-y-3">
                <a
                  href="https://www.healthline.com/nutrition/7-health-benefits-of-water"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 bg-blue-50/30 rounded-xl border border-blue-50 hover:border-blue-100 hover:bg-blue-50/50 transition-all"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <Droplets size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 mb-0.5 flex items-center gap-1">
                        Stay Hydrated
                        <ExternalLink size={10} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium">Daily goal: 2.5 - 3 Liters of water</div>
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 bg-emerald-50/30 rounded-xl border border-emerald-50 hover:border-emerald-100 hover:bg-emerald-50/50 transition-all"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                      <Apple size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 mb-0.5 flex items-center gap-1">
                        Balanced Diet
                        <ExternalLink size={10} className="text-gray-300 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium">Nutrient-rich seasonal vegetables</div>
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.sleepfoundation.org/how-sleep-works/how-much-sleep-do-we-really-need"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-4 bg-purple-50/30 rounded-xl border border-purple-50 hover:border-purple-100 hover:bg-purple-50/50 transition-all"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                      <Moon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 mb-0.5 flex items-center gap-1">
                        Quality Rest
                        <ExternalLink size={10} className="text-gray-300 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium">Target 7-9 hours of deep sleep</div>
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
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg mb-5 text-sm font-semibold text-gray-700 transition-all flex items-center gap-2 group" onClick={() => setCurrentPage('dashboard')}>
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Disease Prediction</h1>
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
                      <button onClick={() => removeSymptom(symptom)} className="text-red-400 hover:text-red-600 transition-colors">
                        <X size={16} />
                      </button>
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
          <button className="px-4 py-2 bg-gray-100 rounded-lg mb-5 text-sm font-semibold text-gray-700 transition-all flex items-center gap-2 group" onClick={() => setCurrentPage('symptoms')}>
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Symptom Checker
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Prediction Results</h1>
          <p className="text-base text-gray-600 mb-8">Based on symptoms: <span className="font-medium text-gray-900">{symptoms.join(', ')}</span></p>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-8 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-amber-500">
                <AlertCircle size={20} />
              </div>
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
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Stethoscope size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recommended Doctors</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedDoctors.map(doctor => (
                <div key={doctor.id} className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-all group">
                  <div className="mb-3 flex justify-center">
                    {doctor.profilePicture ? (
                      <img
                        src={doctor.profilePicture}
                        alt={doctor.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 shadow-sm"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                      />
                    ) : (
                      <div className="p-5 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Stethoscope size={48} />
                      </div>
                    )}
                    {/* Fallback icon if image fails */}
                    <div className="p-5 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all hidden">
                      <Stethoscope size={48} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{doctor.name}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-3">{doctor.specialty}</p>
                  <div className="flex justify-center gap-4 mb-3 text-xs">
                    <div className="text-amber-500 font-bold flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> {doctor.rating}
                    </div>
                    <div className="text-gray-500 font-medium">{doctor.experience} years exp.</div>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">{doctor.hospital}</p>
                  <div className="flex justify-between items-center text-xs text-gray-700 mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock size={12} className="text-gray-400" /> {doctor.available}
                    </span>
                    <span className="font-bold text-emerald-700">{doctor.fee}</span>
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
      )
      }

      {/* Find Doctors Page */}
      {
        currentPage === 'doctors' && (
          <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg mb-5 text-sm font-semibold text-gray-700 transition-all flex items-center gap-2 group" onClick={() => setCurrentPage('dashboard')}>
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find & Book Doctors</h1>
            <p className="text-base text-gray-600 mb-8">Connect with qualified healthcare professionals</p>

            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search doctors or specialties..."
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm min-w-[200px] outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <option>All Specialties</option>
                <option>Cardiologist</option>
                <option>General Physician</option>
                <option>Pulmonologist</option>
                <option>ENT Specialist</option>
                <option>Neurologist</option>
                <option>Dentist</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(() => {
                const filteredDoctors = doctors.filter(doctor => {
                  const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesSpecialty = selectedSpecialty === 'All Specialties' ||
                    doctor.specialty === selectedSpecialty;
                  return matchesSearch && matchesSpecialty;
                });

                if (filteredDoctors.length > 0) {
                  return filteredDoctors.map(doctor => (
                    <div key={doctor.id} className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-all group">
                      <div className="mb-3 flex justify-center">
                        {doctor.profilePicture ? (
                          <img
                            src={doctor.profilePicture}
                            alt={doctor.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 shadow-sm"
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                          />
                        ) : (
                          <div className="p-4 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Stethoscope size={40} />
                          </div>
                        )}
                        {/* Fallback icon if image fails */}
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-full hidden">
                          <Stethoscope size={40} />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {(() => {
                          const cleanName = doctor.name.replace(/^(dr\.?)\s*/i, '');
                          return `Dr. ${cleanName.charAt(0).toUpperCase() + cleanName.slice(1)}`;
                        })()}
                      </h3>
                      <p className="text-sm text-blue-600 mb-3">{doctor.specialty}</p>
                      <div className="flex justify-center gap-4 mb-3 text-xs">
                        <div className="text-yellow-600 flex items-center gap-1 font-bold">
                          <Star size={12} fill="currentColor" /> {doctor.rating}
                        </div>
                        <div className="text-gray-600 font-medium">{doctor.experience} years exp.</div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{doctor.hospital}</p>
                      <div className="flex justify-between text-xs text-gray-700 mb-4 p-2 bg-gray-50 rounded-md border border-gray-100">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock size={12} className="text-gray-400" /> {doctor.available}
                        </span>
                        <span className="font-bold text-green-700">{doctor.fee}</span>
                      </div>
                      <button
                        onClick={() => setSelectedDoctor(doctor)}
                        className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 shadow-md transition-shadow"
                      >
                        Book Appointment
                      </button>
                    </div>
                  ));
                } else {
                  return (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <UserRound size={32} className="text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">No doctors found</h3>
                      <p className="text-gray-500">
                        {searchTerm ? `We couldn't find any doctors matching "${searchTerm}"` : "We couldn't find any available doctors at the moment."}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => { setSearchTerm(''); setSelectedSpecialty('All Specialties'); }}
                          className="mt-4 text-blue-600 font-semibold hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  );
                }
              })()}
            </div>
          </main>
        )
      }

      {/* Appointments Page */}
      {
        currentPage === 'appointments' && (() => {
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

          const enriched = myAppointments.map(apt => {
            const isMissed = new Date(apt.date) < todayStart && apt.status === 'pending';
            const effectiveStatus = isMissed ? 'missed' : apt.status;
            const isUpcoming = (effectiveStatus === 'confirmed' || effectiveStatus === 'pending') && new Date(apt.date) >= todayStart;
            return { ...apt, effectiveStatus, isUpcoming };
          });

          const counts = {
            all: enriched.length,
            upcoming: enriched.filter(a => a.isUpcoming).length,
            completed: enriched.filter(a => a.effectiveStatus === 'completed').length,
            cancelled: enriched.filter(a => a.effectiveStatus === 'cancelled' || a.effectiveStatus === 'missed').length,
          };


          const filtered = enriched.filter(a => {
            const matchesFilter = appointmentFilter === 'all' ? true
              : appointmentFilter === 'upcoming' ? a.isUpcoming
                : appointmentFilter === 'completed' ? a.effectiveStatus === 'completed'
                  : (a.effectiveStatus === 'cancelled' || a.effectiveStatus === 'missed');

            const matchesSearch = a.doctor.name.toLowerCase().includes(aptSearch.toLowerCase()) ||
              (a.reason && a.reason.toLowerCase().includes(aptSearch.toLowerCase()));

            return matchesFilter && matchesSearch;
          });

          const badgeStyle = {
            confirmed: 'text-emerald-600',
            completed: 'text-blue-600',
            cancelled: 'text-gray-400',
            pending: 'text-amber-600',
            missed: 'text-red-500'
          };

          const filterTabs = [
            { key: 'all', label: 'All', count: counts.all },
            { key: 'upcoming', label: 'Upcoming', count: counts.upcoming },
            { key: 'completed', label: 'Completed', count: counts.completed },
            { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
          ];

          return (
            <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">

              {/* Header */}
              <div className="mb-10">
                <button className="text-xs font-semibold text-neutral-400 hover:text-black transition-colors mb-6 flex items-center gap-1.5 group" onClick={() => setCurrentPage('dashboard')}>
                  <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  Back to Dashboard
                </button>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-black mb-2">My Appointments</h1>
                    <p className="text-sm font-medium text-neutral-400">Manage and track your consultations</p>
                  </div>
                  <button
                    onClick={() => setCurrentPage('doctors')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-200/50 hover:bg-blue-700 transition-all active:scale-[0.98]"
                  >
                    <Plus size={18} strokeWidth={3} />
                    Book Appointment
                  </button>
                </div>
              </div>

              {/* Filter + Search */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
                <div className="flex gap-1 bg-neutral-100 rounded-full p-1 w-fit">
                  {filterTabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setAppointmentFilter(tab.key)}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${appointmentFilter === tab.key
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-500 hover:text-black'
                        }`}
                    >
                      {tab.label}
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${appointmentFilter === tab.key
                        ? 'bg-neutral-100 text-black'
                        : 'bg-neutral-200/50 text-neutral-400'
                        }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-64">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    value={aptSearch}
                    onChange={e => setAptSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-100 focus:border-neutral-300 transition-all placeholder:text-neutral-400 font-medium"
                  />
                </div>
              </div>

              {/* Appointments List */}
              {filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CalendarDays size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {appointmentFilter === 'all' ? 'No appointments yet' : `No ${appointmentFilter} appointments`}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                    {appointmentFilter === 'all' ? 'Book your first consultation with a specialist' : 'Check back later or try a different filter'}
                  </p>
                  {appointmentFilter === 'all' && (
                    <button onClick={() => setCurrentPage('doctors')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200/50 transition-all">
                      Find a Doctor
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-neutral-100">
                  {filtered.map(apt => {
                    const statusLabel = apt.isMissed ? 'MISSED' : apt.status.toUpperCase();
                    const aptDate = new Date(apt.date);
                    const isToday = aptDate.toDateString() === now.toDateString();
                    const isTomorrow = aptDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
                    const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : aptDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                    return (
                      <div key={apt._id} className="group py-6 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            {/* Doctor initials/avatar */}
                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold text-sm flex-shrink-0">
                              {apt.doctor.name?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-bold text-black">{apt.doctor.name}</h3>
                                {isToday && apt.effectiveStatus === 'confirmed' && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-black">
                                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                                    Today
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium lowercase">
                                <span className="flex items-center gap-1.5">
                                  <Calendar size={12} strokeWidth={2.5} />
                                  {dateLabel}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock size={12} strokeWidth={2.5} />
                                  {apt.time}
                                </span>
                              </div>
                              {apt.reason && (
                                <p className="text-xs text-neutral-500 mt-2 line-clamp-1">{apt.reason}</p>
                              )}
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold tracking-widest ${badgeStyle[apt.effectiveStatus] || 'text-neutral-400'}`}>
                            {statusLabel}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pl-14">
                          <div className="flex items-center gap-1.5">
                            {apt.effectiveStatus === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => {/* Existing Start logic */ }}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all"
                                >
                                  <Stethoscope size={12} strokeWidth={3} />
                                  Start Consultation
                                </button>
                                {apt.meetingLink && (
                                  <a
                                    href={apt.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-full text-[10px] font-bold shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all"
                                  >
                                    <Video size={12} strokeWidth={3} />
                                    Join Meeting
                                  </a>
                                )}
                              </>
                            )}
                            <button
                              onClick={() => setViewAppointment(apt)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-400 hover:text-black transition-colors text-[10px] font-bold"
                            >
                              <Info size={12} strokeWidth={2.5} />
                              VIEW DETAILS
                            </button>
                          </div>

                          {apt.effectiveStatus !== 'cancelled' && apt.effectiveStatus !== 'completed' && !apt.isMissed && (
                            <button
                              onClick={() => handleCancelAppointment(apt._id)}
                              className="text-[10px] font-bold text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-tight flex items-center gap-1.5"
                            >
                              <XCircle size={12} strokeWidth={2.5} />
                              Cancel appointment
                            </button>
                          )}
                          {(apt.effectiveStatus === 'cancelled' || apt.effectiveStatus === 'completed' || apt.isMissed) && (
                            <button
                              onClick={() => handleDeleteRecord(apt._id)}
                              className="text-[10px] font-bold text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-tight flex items-center gap-1.5"
                            >
                              <Trash2 size={12} strokeWidth={2.5} />
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          );
        })()
      }

      {/* Medical History Page */}
      {
        currentPage === 'history' && (
          <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg mb-5 text-sm font-semibold text-gray-700 transition-all flex items-center gap-2 group" onClick={() => setCurrentPage('dashboard')}>
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
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
                                <Download size={12} strokeWidth={2} />
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
                              <Trash2 size={16} strokeWidth={2} />
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
        )
      }

      {/* Booking Modal */}
      {
        selectedDoctor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setSelectedDoctor(null)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden" style={{ animation: 'fadeInScale 0.3s ease-out' }}>

              {/* Gradient Header with Doctor Info */}
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-6 text-white overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>

                <div className="relative flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0 bg-white/10">
                    {selectedDoctor.profilePicture ? (
                      <img
                        src={selectedDoctor.profilePicture}
                        alt={selectedDoctor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">
                        <Stethoscope size={32} />
                      </div>
                    )}
                    {/* Fallback icon if image fails */}
                    <div className="w-full h-full flex-items-center justify-center text-white/50 hidden">
                      <Stethoscope size={32} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{selectedDoctor.name}</h3>
                    <p className="text-blue-200 text-sm font-medium">{selectedDoctor.specialty}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs bg-white/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock size={10} /> {selectedDoctor.experience} yrs exp
                      </span>
                      <span className="text-xs bg-white/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> {selectedDoctor.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right bg-white/10 px-4 py-2.5 rounded-xl">
                    <span className="block text-[10px] text-blue-200 uppercase tracking-widest font-bold">Fee</span>
                    <span className="text-xl font-bold">{selectedDoctor.fee}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleBookAppointment} className="p-6">

                {/* Step 1: Select Date */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <label className="text-sm font-bold text-gray-900">Select Date</label>
                  </div>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none transition-all bg-gray-50/50 text-gray-800 font-medium text-sm hover:border-gray-200 cursor-pointer"
                  />
                </div>

                {/* Step 2: Select Time Slot */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <label className="text-sm font-bold text-gray-900">Select Time Slot</label>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setBookingData({ ...bookingData, time })}
                        className={`py-2.5 px-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${bookingData.time === time
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105'
                          : 'bg-white text-gray-700 border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  {/* Hidden input for form validation */}
                  <input type="hidden" required value={bookingData.time} />
                </div>

                {/* Step 3: Reason */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                    <label className="text-sm font-bold text-gray-900">Reason for Visit</label>
                  </div>
                  <textarea
                    required
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                    placeholder="Briefly describe your symptoms or concern..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none transition-all bg-gray-50/50 text-gray-800 text-sm min-h-[80px] resize-none hover:border-gray-200 placeholder:text-gray-400"
                  ></textarea>
                </div>

                {/* Summary Bar */}
                {bookingData.date && bookingData.time && (
                  <div className="mb-5 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar size={14} className="text-blue-600" />
                      <span className="text-gray-700 font-medium">
                        {new Date(bookingData.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <Clock size={14} className="text-blue-600" /> {bookingData.time}
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold">Available</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    disabled={isBooking}
                    className="flex-1 px-5 py-3.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-all border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!bookingData.time || isBooking}
                    className={`flex-[2] px-5 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${bookingData.time && !isBooking
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-200/50 active:scale-[0.98]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {isBooking ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Confirm Booking
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )
      }


      {/* Appointment Details Modal */}
      {
        viewAppointment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn transform transition-all">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
                <button
                  onClick={() => setViewAppointment(null)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} strokeWidth={2} />
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

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                {viewAppointment.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => {
                        const startDt = (() => {
                          const [timePart, meridiem] = viewAppointment.time.split(' ');
                          let [h, m] = timePart.split(':').map(Number);
                          if (meridiem?.toUpperCase() === 'PM' && h !== 12) h += 12;
                          if (meridiem?.toUpperCase() === 'AM' && h === 12) h = 0;
                          const d = new Date(`${viewAppointment.date}T00:00:00`);
                          d.setHours(h, m, 0, 0);
                          return d;
                        })();
                        const endDt = new Date(startDt.getTime() + 30 * 60 * 1000);
                        const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
                        const params = new URLSearchParams({
                          action: 'TEMPLATE',
                          text: `Consultation with ${viewAppointment.doctor.name}`,
                          dates: `${fmt(startDt)}/${fmt(endDt)}`,
                          details: `Appointment with ${viewAppointment.doctor.name} (${viewAppointment.doctor.specialization || 'Specialist'})\nReason: ${viewAppointment.reason || 'Consultation'}`,
                        });
                        window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
                      }}
                      className="px-5 py-2.5 bg-white text-emerald-600 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2"
                    >
                      <Calendar size={16} strokeWidth={2} />
                      Add to Calendar
                    </button>
                    {viewAppointment.meetingLink && (
                      <a
                        href={viewAppointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                      >
                        <Video size={16} strokeWidth={2} />
                        Join Meeting
                      </a>
                    )}
                  </>
                )}
                <button
                  onClick={() => setViewAppointment(null)}
                  className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Medical History Details Modal */}
      {
        viewHistory && (
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
        )
      }




      {/* Delete Confirmation Modal */}
      {
        deleteConfirmation.isOpen && (
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
        )
      }

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
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
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
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1"><MapPin size={16} /></span>
                  <span>Jadibuti Kathmandu, Nepal</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1"><Mail size={16} /></span>
                  <a href="mailto:rc005405@gmail.com" className="hover:text-blue-600 transition-colors">
                    support@qurehealth.ai
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1"><Phone size={16} /></span>
                  <a href="tel:9817831552" className="hover:text-blue-600 transition-colors">
                    +977-9817831552
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 mt-1"><AlertTriangle size={16} /></span>
                  <span>Emergency: <a href="tel:102" className="text-rose-500 hover:text-rose-600 transition-colors font-bold">102</a></span>
                </li>
              </ul>
            </div>

            {/* Account Actions */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Account</h4>
              <ul className="space-y-2.5 mb-5">
                <li><a onClick={() => navigate('/patient/profile')} className="text-gray-500 hover:text-blue-600 transition-colors text-sm cursor-pointer">My Profile</a></li>

                <li>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors text-sm cursor-pointer flex items-center gap-2">
                    Log out
                  </button>
                </li>
              </ul>

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

      {
        toastData.isVisible && (
          <Toast
            message={toastData.message}
            type={toastData.type}
            onClose={() => setToastData({ ...toastData, isVisible: false })}
          />
        )
      }
      <BroadcastModal
        isOpen={broadcastModal.isOpen}
        onClose={() => setBroadcastModal({ ...broadcastModal, isOpen: false })}
        message={broadcastModal.message}
        type={broadcastModal.type}
      />
    </div >
  );
}