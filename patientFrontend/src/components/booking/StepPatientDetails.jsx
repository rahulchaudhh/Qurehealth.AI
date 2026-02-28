import { useState } from 'react';
import { User, Mail, Phone, FileText, Users } from 'lucide-react';

export default function StepPatientDetails({ patientDetails, onChange, user }) {
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    onChange({ ...patientDetails, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none ${
      errors[field]
        ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-4 focus:ring-red-100'
        : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
    }`;

  return (
    <div className="p-6 pt-4">
      <h3 className="text-sm font-bold text-gray-900 mb-1">Patient Information</h3>
      <p className="text-xs text-gray-400 mb-5">Verify your details for the appointment</p>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <User size={11} className="text-gray-400" />
            Full Name
          </label>
          <input
            type="text"
            value={patientDetails.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your full name"
            className={inputCls('name')}
          />
          {errors.name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Email & Phone — 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail size={11} className="text-gray-400" />
              Email Address
            </label>
            <input
              type="email"
              value={patientDetails.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="your@email.com"
              className={inputCls('email')}
            />
            {errors.email && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.email}</p>}
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone size={11} className="text-gray-400" />
              Phone Number
            </label>
            <input
              type="tel"
              value={patientDetails.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+977 98XXXXXXXX"
              className={inputCls('phone')}
            />
            {errors.phone && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.phone}</p>}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText size={11} className="text-gray-400" />
            Reason for Visit
          </label>
          <textarea
            value={patientDetails.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            placeholder="Describe your symptoms or concern..."
            rows={3}
            className={`${inputCls('reason')} min-h-[80px] resize-none placeholder:text-gray-300`}
          />
          {errors.reason && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.reason}</p>}
        </div>

        {/* Booking for someone else */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
          <input
            type="checkbox"
            id="bookingForOther"
            checked={patientDetails.bookingForOther}
            onChange={(e) => handleChange('bookingForOther', e.target.checked)}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="bookingForOther" className="cursor-pointer">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Users size={13} className="text-gray-400" />
              Booking for someone else?
            </span>
            <span className="text-[11px] text-gray-400 mt-0.5 block">Check this if the patient is a different person</span>
          </label>
        </div>

        {/* Extra fields for booking for someone else */}
        {patientDetails.bookingForOther && (
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3 animate-fadeIn">
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Patient's Full Name
              </label>
              <input
                type="text"
                value={patientDetails.otherName || ''}
                onChange={(e) => handleChange('otherName', e.target.value)}
                placeholder="Patient's name"
                className={inputCls('otherName')}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Relationship
              </label>
              <input
                type="text"
                value={patientDetails.relationship || ''}
                onChange={(e) => handleChange('relationship', e.target.value)}
                placeholder="e.g. Son, Mother, Friend"
                className={inputCls('relationship')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
