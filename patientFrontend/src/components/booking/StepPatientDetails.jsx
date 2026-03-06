import { useState } from 'react';

export default function StepPatientDetails({ patientDetails, onChange, user }) {
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    onChange({ ...patientDetails, [field]: value });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const inputCls = (field) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none font-medium ${
      errors[field]
        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-4 focus:ring-red-100'
        : 'border-gray-200 bg-white text-gray-800 placeholder:text-gray-300 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
    }`;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Patient Information</h3>
        <p className="text-sm text-gray-500 mt-1">Verify your details before booking</p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
          <input
            type="text"
            value={patientDetails.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your full name"
            className={inputCls('name')}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
            <input
              type="email"
              value={patientDetails.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="your@email.com"
              className={inputCls('email')}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={patientDetails.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+977 98XXXXXXXX"
              className={inputCls('phone')}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason for Visit</label>
          <textarea
            value={patientDetails.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            placeholder="Describe your symptoms or reason for consultation…"
            rows={3}
            className={`${inputCls('reason')} resize-none`}
          />
          {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
        </div>

        {/* Booking for someone else */}
        <label className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={patientDetails.bookingForOther}
            onChange={(e) => handleChange('bookingForOther', e.target.checked)}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <div>
            <span className="text-sm font-semibold text-gray-800">Booking for someone else?</span>
            <span className="text-xs text-gray-400 mt-0.5 block">Check this if you are booking on behalf of another person</span>
          </div>
        </label>

        {/* Extra fields */}
        {patientDetails.bookingForOther && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Patient's Full Name</label>
              <input
                type="text"
                value={patientDetails.otherName || ''}
                onChange={(e) => handleChange('otherName', e.target.value)}
                placeholder="Enter patient's name"
                className={inputCls('otherName')}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Relationship</label>
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

