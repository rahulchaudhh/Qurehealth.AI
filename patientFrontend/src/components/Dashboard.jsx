import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import { Bell, X, MapPin, Mail, Phone, AlertTriangle, Calendar, Clock, Stethoscope, Star, Download, Trash2, Video, CheckCircle2, Info, XCircle, ChevronRight, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import Toast from './Toast';
import BroadcastModal from './BroadcastModal';
import BookingWizard from './booking/BookingWizard';
import DashboardHome from './DashboardHome';
import SymptomChecker, { PredictionResults } from './SymptomChecker';
import FindDoctors from './FindDoctors';
import Appointments from './Appointments';
import MedicalHistory from './MedicalHistory';

// Only allow genuine external meeting URLs (not localhost or relative paths)
const isValidMeetingLink = (link) => {
  if (!link) return false;
  try {
    const url = new URL(link);
    return (url.protocol === 'https:' || url.protocol === 'http:') &&
      !['localhost', '127.0.0.1'].includes(url.hostname);
  } catch {
    return false;
  }
};



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
          rating: d.rating?.average || 0,
          ratingCount: d.rating?.totalReviews || 0,
          experience: d.experience || 0,
          hospital: 'Qurehealth Care',
          available: d.nextAvailableSlot || 'Not available',
          fee: d.fee ? `NPR ${d.fee}` : 'Free',
          availability: d.availability || null,
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
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);


  const [viewAppointment, setViewAppointment] = useState(null);
  const [viewHistory, setViewHistory] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, recordId: null });
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [aptSearch, setAptSearch] = useState('');

  // Fetch available slots when a date is picked in the booking modal
  useEffect(() => {
    if (!selectedDoctor || !bookingData.date) {
      setAvailableSlots([]);
      return;
    }
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setBookingData(prev => ({ ...prev, time: '' })); // reset selected time
      try {
        const res = await api.get(`/doctor/${selectedDoctor.id}/slots?date=${bookingData.date}`);
        setAvailableSlots(res.data.data || []);
      } catch {
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDoctor?.id, bookingData.date]);



  const generatePDF = (record) => {
    console.log("generatePDF called with record:", record);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const rightCol = 110;
      let y = 20;

      // ── Clinic Header ──
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Qurehealth.AI", margin, y);

      const issuedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(issuedDate, pageWidth - margin, y, { align: "right" });

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text("Healthcare Platform", margin, y);
      doc.text(`Ref: ${record._id.slice(-8).toUpperCase()}`, pageWidth - margin, y, { align: "right" });
      y += 5;
      doc.text("support@qurehealth.ai", margin, y);
      y += 5;
      doc.text("www.qurehealth.ai", margin, y);
      y += 12;

      // ── Title ──
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Patient Medical Record", margin, y);
      y += 10;

      // ── Patient Information Box ──
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.4);
      doc.rect(margin, y, pageWidth - margin * 2, 32);
      y += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Patient Information", margin + 4, y);
      y += 7;

      const patientName = user?.name || record.patient?.name || 'N/A';
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(patientName, margin + 4, y);

      if (user?.dateOfBirth) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Date of Birth", rightCol, y - 7);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), rightCol, y - 1);
      }
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Patient ID", rightCol, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(record._id.slice(-8).toUpperCase(), rightCol, y + 11);

      y += 5;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      if (user?.phone) { doc.text(user.phone, margin + 4, y); y += 5; }
      else y += 5;
      if (user?.gender) { doc.text(user.gender.charAt(0).toUpperCase() + user.gender.slice(1), margin + 4, y); }
      y += 14;

      // ── Section helpers ──
      const drawSection = (title) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(title, margin, y);
        y += 3;
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.4);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;
      };

      // ── Doctor Details ──
      drawSection("Doctor Details");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Dr. ${record.doctor.name}`, margin, y);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Facility", rightCol, y);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(record.doctor.hospital || 'Qurehealth Care', rightCol, y + 6);
      y += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(record.doctor.specialization, margin, y);
      y += 10;

      // ── Visit Details ──
      drawSection("Visit Details");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Date of Visit", margin, y);
      doc.text("Appointment Status", rightCol, y);
      y += 5;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const visitDate = new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(visitDate, margin, y);
      doc.text((record.status || 'Completed').charAt(0).toUpperCase() + (record.status || 'Completed').slice(1), rightCol, y);
      y += 8;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Diagnosis / Reason for Visit", margin, y);
      y += 5;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const diagText = (record.diagnosis || record.reason || 'N/A');
      const diagLines = doc.splitTextToSize(diagText.charAt(0).toUpperCase() + diagText.slice(1), pageWidth - margin * 2);
      doc.text(diagLines, margin, y);
      y += diagLines.length * 6 + 6;

      // ── Prescription ──
      drawSection("Prescription (Rx)");
      if (record.prescription) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        const lines = doc.splitTextToSize(record.prescription, pageWidth - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 6 + 6;
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text("No prescription issued for this visit.", margin, y);
        y += 10;
      }

      // ── Physician's Notes ──
      drawSection("Physician's Notes");
      if (record.doctorNotes) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(80, 80, 80);
        const lines = doc.splitTextToSize(`"${record.doctorNotes}"`, pageWidth - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 6 + 4;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(130, 130, 130);
        doc.text(`— Dr. ${record.doctor.name}`, margin, y);
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text("No clinical notes recorded.", margin, y);
      }

      // ── Footer ──
      const footerY = pageHeight - 14;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.4);
      doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(160, 160, 160);
      doc.text("This is an official medical record issued by Qurehealth.AI.", margin, footerY + 2);
      doc.text("Page 1 / 1", pageWidth - margin, footerY + 2, { align: "right" });

      doc.save(`Medical_Report_${record._id.slice(-8).toUpperCase()}.pdf`);
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

  const handleRateAppointment = async (appointmentId, score, feedback) => {
    try {
      const res = await api.put(`/appointments/${appointmentId}/rate`, { score, feedback });
      // Update the appointment in local state with the new rating
      setMyAppointments(prev =>
        prev.map(apt =>
          apt._id === appointmentId
            ? { ...apt, rating: res.data.data.rating }
            : apt
        )
      );
      toast.success('Rating submitted successfully!');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to submit rating';
      toast.error(msg);
      throw new Error(msg);
    }
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
        <div className="flex items-center gap-1 cursor-pointer group" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Qurehealth.AI" className="w-9 h-9 object-contain" />
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
        <DashboardHome
          user={user}
          myAppointments={myAppointments}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Symptom Checker Page */}
      {currentPage === 'symptoms' && (
        <SymptomChecker
          symptoms={symptoms}
          searchSymptom={searchSymptom}
          setSearchSymptom={setSearchSymptom}
          symptomList={symptomList}
          addSymptom={addSymptom}
          removeSymptom={removeSymptom}
          analyzeSymptoms={analyzeSymptoms}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'prediction' && (
        <PredictionResults
          symptoms={symptoms}
          prediction={prediction}
          recommendedDoctors={recommendedDoctors}
          setCurrentPage={setCurrentPage}
          setSelectedDoctor={setSelectedDoctor}
        />
      )}

      {/* Find Doctors Page */}
      {currentPage === 'doctors' && (
        <FindDoctors
          doctors={doctors}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedSpecialty={selectedSpecialty}
          setSelectedSpecialty={setSelectedSpecialty}
          setSelectedDoctor={setSelectedDoctor}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Appointments Page */}
      {currentPage === 'appointments' && (
        <Appointments
          myAppointments={myAppointments}
          appointmentFilter={appointmentFilter}
          setAppointmentFilter={setAppointmentFilter}
          aptSearch={aptSearch}
          setAptSearch={setAptSearch}
          setCurrentPage={setCurrentPage}
          setViewAppointment={setViewAppointment}
          handleCancelAppointment={handleCancelAppointment}
          handleDeleteRecord={handleDeleteRecord}
          onRateAppointment={handleRateAppointment}
        />
      )}

      {/* Medical History Page */}
      {currentPage === 'history' && (
        <MedicalHistory
          medicalHistory={medicalHistory}
          setCurrentPage={setCurrentPage}
          generatePDF={generatePDF}
          handleDeleteRecord={handleDeleteRecord}
        />
      )}

      {/* Booking Wizard */}
      {
        selectedDoctor && (
          <BookingWizard
            doctor={selectedDoctor}
            user={user}
            bookingData={bookingData}
            setBookingData={setBookingData}
            availableSlots={availableSlots}
            loadingSlots={loadingSlots}
            isBooking={isBooking}
            onSubmit={handleBookAppointment}
            onClose={() => {
              setSelectedDoctor(null);
              setBookingData({ date: '', time: '', reason: '' });
            }}
            onViewAppointments={() => {
              setSelectedDoctor(null);
              setBookingData({ date: '', time: '', reason: '' });
              setCurrentPage('appointments');
            }}
          />
        )
      }


      {/* Appointment Details Modal */}
      {
        viewAppointment && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setViewAppointment(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-8 py-5 text-center relative">
                <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Consultation with Dr. {viewAppointment.doctor.name}
                </p>
                <button
                  onClick={() => setViewAppointment(null)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-8 py-6">
                {/* 2-col grid of fields like the sample */}
                <div className="grid grid-cols-2 gap-x-10 gap-y-5">

                  {/* Left col */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-0.5">Doctor / Specialist:</p>
                    <p className="text-sm text-gray-900">Dr. {viewAppointment.doctor.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-0.5">Specialization:</p>
                    <p className="text-sm text-blue-600">{viewAppointment.doctor.specialization}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-0.5">Scheduled Date:</p>
                    <p className="text-sm text-gray-900">
                      {new Date(viewAppointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-0.5">Scheduled Time:</p>
                    <p className="text-sm text-gray-900">{viewAppointment.time}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-0.5">Appointment Status:</p>
                    <span className={`inline-block mt-0.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      (new Date(viewAppointment.date) < new Date().setHours(0,0,0,0) && viewAppointment.status === 'pending') ? 'bg-red-100 text-red-700' :
                      viewAppointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      viewAppointment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      viewAppointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {(new Date(viewAppointment.date) < new Date().setHours(0,0,0,0) && viewAppointment.status === 'pending') ? 'Missed' : viewAppointment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-0.5">Appointment Type:</p>
                    <p className="text-sm text-gray-900">{isValidMeetingLink(viewAppointment.meetingLink) ? 'Video Consultation' : 'In-Person'}</p>
                  </div>

                </div>

                {/* Reason - full width */}
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-1.5">Reason for Visit:</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 min-h-[52px]">
                    <p className="text-sm text-gray-700">
                      {viewAppointment.reason || <span className="italic text-gray-400">No reason provided.</span>}
                    </p>
                  </div>
                </div>

                {/* Doctor Notes - full width, only if exists */}
                {viewAppointment.doctorNotes && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-gray-500 mb-1.5">Doctor's Notes:</p>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                      <p className="text-sm text-gray-700">{viewAppointment.doctorNotes}</p>
                    </div>
                  </div>
                )}

                {/* Prescription - only if exists */}
                {viewAppointment.prescription && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-gray-500 mb-1.5">Prescription:</p>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                      <p className="text-sm text-gray-700">{viewAppointment.prescription}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-8 py-4 flex items-center justify-between gap-3 bg-gray-50">
                <div className="flex items-center gap-3">
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
                            details: `Appointment with ${viewAppointment.doctor.name} (${viewAppointment.doctor.specialization || 'Specialist'})\nReason: ${viewAppointment.reason || 'Consultation'}${viewAppointment.meetingLink ? '\nMeeting Link: ' + viewAppointment.meetingLink : ''}`,
                            ...(viewAppointment.meetingLink ? { location: viewAppointment.meetingLink } : {}),
                          });
                          window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
                        }}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                      >
                        <Calendar size={15} strokeWidth={2} />
                        Add to Calendar
                      </button>
                      {isValidMeetingLink(viewAppointment.meetingLink) && (
                        <a
                          href={viewAppointment.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                        >
                          <Video size={15} strokeWidth={2} />
                          Join Meeting
                        </a>
                      )}
                    </>
                  )}
                </div>
                <button
                  onClick={() => setViewAppointment(null)}
                  className="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors"
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
              <div className="flex items-center gap-1 mb-4">
                <img src="/logo.png" alt="Qurehealth.AI" className="w-10 h-10 object-contain" />
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