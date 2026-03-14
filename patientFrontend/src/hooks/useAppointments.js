// useAppointments.js - Custom hook for appointment management
import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useAppointments = (currentPage) => {
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/my-appointments');
      setMyAppointments(res.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAppointments = async () => {
    await fetchMyAppointments();
  };

  useEffect(() => {
    if (currentPage === 'appointments' || currentPage === 'dashboard' || currentPage === 'history') {
      fetchMyAppointments();
    }
  }, [currentPage]);

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${appointmentId}/cancel`);
      setMyAppointments(prev =>
        prev.map(apt => apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt)
      );
      return true;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  };

  const deleteRecord = async (recordId) => {
    try {
      await api.delete(`/appointments/${recordId}`);
      setMyAppointments(prev => prev.filter(apt => apt._id !== recordId));
      return true;
    } catch (error) {
      console.error('Failed to delete record:', error);
      throw error;
    }
  };

  const rateAppointment = async (appointmentId, score, feedback) => {
    try {
      const res = await api.put(`/appointments/${appointmentId}/rate`, { score, feedback });
      setMyAppointments(prev =>
        prev.map(apt =>
          apt._id === appointmentId ? { ...apt, rating: res.data.data.rating } : apt
        )
      );
      return true;
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  };

  const medicalHistory = myAppointments.filter(apt => apt.status === 'completed');

  return {
    myAppointments,
    loading,
    refreshAppointments,
    cancelAppointment,
    deleteRecord,
    rateAppointment,
    medicalHistory
  };
};
