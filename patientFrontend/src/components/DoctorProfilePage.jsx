import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Star, ArrowLeft, MapPin, Clock, Award, Users, Video,
    CalendarCheck, Shield, ChevronRight, MessageSquare, CheckCircle2
} from 'lucide-react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function DoctorProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [doctor, setDoctor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const [docRes, revRes] = await Promise.all([
                    axios.get(`/doctor/${id}`),
                    axios.get(`/doctor/${id}/reviews`),
                ]);
                if (docRes.data.success) setDoctor(docRes.data.data || docRes.data.doctor || docRes.data);
                if (revRes.data.success) setReviews(revRes.data.reviews || revRes.data.data || []);
            } catch (err) {
                setError('Doctor profile not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctor();
    }, [id]);

    useEffect(() => {
        if (!selectedDate) return;
        axios.get(`/doctor/${id}/slots?date=${selectedDate}`)
            .then(res => { if (res.data.success) setSlots(res.data.slots || []); })
            .catch(() => setSlots([]));
    }, [id, selectedDate]);

    const handleBooking = () => {
        if (!user) {
            navigate('/login');
        } else {
            navigate('/patientdashboard');
        }
    };

    // Generate next 7 days for date picker
    const next7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            iso: d.toISOString().split('T')[0],
            label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        };
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-500 text-sm">Loading profile…</p>
                </div>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Profile Not Found</h2>
                    <p className="text-slate-500 text-sm mb-6">{error || 'This doctor profile is unavailable.'}</p>
                    <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors">
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    const rating = doctor.averageRating?.toFixed(1) || '5.0';
    const reviewCount = doctor.totalReviews || reviews.length || 0;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Top bar */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <span className="text-slate-300">|</span>
                    <span className="text-sm text-slate-500">Doctor Profile</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Left column ── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Profile header card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                                {doctor.hasProfilePicture ? (
                                    <img
                                        src={`/api/doctor/${doctor._id}/profile-picture`}
                                        alt={doctor.name}
                                        className="w-full h-full object-cover"
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-indigo-600">
                                        {doctor.name?.charAt(0) || 'D'}
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h1 className="text-2xl font-bold text-slate-900">{doctor.name}</h1>
                                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Verified
                                    </span>
                                </div>
                                <p className="text-indigo-600 font-semibold mb-1">{doctor.specialization || 'General Medicine'}</p>
                                {doctor.qualification && <p className="text-slate-500 text-sm mb-3">{doctor.qualification}</p>}

                                <div className="flex flex-wrap gap-4 text-sm">
                                    {doctor.experience && (
                                        <span className="flex items-center gap-1.5 text-slate-600">
                                            <Award className="w-4 h-4 text-amber-500" />
                                            {doctor.experience}+ yrs experience
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5 text-slate-600">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        {rating} ({reviewCount} reviews)
                                    </span>
                                    {doctor.totalPatients > 0 && (
                                        <span className="flex items-center gap-1.5 text-slate-600">
                                            <Users className="w-4 h-4 text-indigo-500" />
                                            {doctor.totalPatients}+ patients
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About */}
                    {doctor.bio && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                            <h2 className="text-lg font-bold text-slate-900 mb-3">About</h2>
                            <p className="text-slate-600 leading-relaxed text-sm">{doctor.bio}</p>
                        </div>
                    )}

                    {/* Services */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Consultation Types</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { icon: Video, label: 'Video Consultation', sub: 'Online, from home', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { icon: CalendarCheck, label: 'In-Clinic Visit', sub: 'Scheduled appointment', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                    <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                                        <s.icon className={`w-5 h-5 ${s.color}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">{s.label}</p>
                                        <p className="text-xs text-slate-400">{s.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reviews */}
                    {reviews.length > 0 && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900">Patient Reviews</h2>
                                <div className="flex items-center gap-1.5">
                                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    <span className="font-bold text-slate-900">{rating}</span>
                                    <span className="text-slate-400 text-sm">({reviewCount})</span>
                                </div>
                            </div>
                            <div className="space-y-5">
                                {reviews.slice(0, 5).map((r, i) => (
                                    <div key={i} className="border-b border-slate-50 pb-5 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                {r.patientName?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{r.patientName || 'Patient'}</p>
                                                {r.createdAt && (
                                                    <p className="text-xs text-slate-400">
                                                        {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ml-auto flex gap-0.5">
                                                {[...Array(r.rating || 5)].map((_, j) => (
                                                    <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                ))}
                                            </div>
                                        </div>
                                        {r.comment && <p className="text-slate-600 text-sm leading-relaxed pl-10">{r.comment}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right column: Booking card ── */}
                <div className="space-y-4">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sticky top-24">
                        {/* Fee */}
                        <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100">
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Consultation Fee</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {doctor.consultationFee
                                        ? `NPR ${doctor.consultationFee.toLocaleString()}`
                                        : 'See profile'}
                                </p>
                            </div>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Available
                            </div>
                        </div>

                        {/* Date selector */}
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Select Date</p>
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {next7Days.map(d => (
                                    <button
                                        key={d.iso}
                                        onClick={() => setSelectedDate(d.iso)}
                                        className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                            selectedDate === d.iso
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-indigo-200'
                                        }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Slots */}
                        {slots.length > 0 ? (
                            <div className="mb-5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Available Slots</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {slots.slice(0, 6).map((slot, i) => (
                                        <div key={i} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            {typeof slot === 'string' ? slot : slot.time || slot.start || 'Open'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mb-5 p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                                <Clock className="w-4 h-4 mx-auto mb-1" />
                                No slots found for this date
                            </div>
                        )}

                        {/* Book button */}
                        <button
                            onClick={handleBooking}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <CalendarCheck className="w-4 h-4" />
                            {user ? 'Book Appointment' : 'Login to Book'}
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        {!user && (
                            <p className="text-center text-xs text-slate-400 mt-3">
                                <button onClick={() => navigate('/register')} className="text-indigo-500 hover:underline font-medium">
                                    Create a free account
                                </button>{' '}to book instantly
                            </p>
                        )}
                    </div>

                    {/* Trust badges */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Why trust us</p>
                        {[
                            { icon: Shield, label: 'Board-certified doctor', color: 'text-indigo-500' },
                            { icon: MessageSquare, label: 'Patients supported 24/7', color: 'text-emerald-500' },
                            { icon: CheckCircle2, label: 'Verified credentials', color: 'text-purple-500' },
                        ].map((b, i) => (
                            <div key={i} className="flex items-center gap-2.5 py-2 text-sm text-slate-600">
                                <b.icon className={`w-4 h-4 ${b.color}`} />
                                {b.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
