// useDoctors.js - Custom hook for doctor management
import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useDoctors = (currentPage) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPage === 'doctors' || currentPage === 'prediction') {
      fetchDoctors();
    }
  }, [currentPage]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctor/all');
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
          : null,
        _id: d._id // Keep original ID for API calls
      }));
      setDoctors(doctorData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    doctors,
    loading,
    refetch: fetchDoctors
  };
};
