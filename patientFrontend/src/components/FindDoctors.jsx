import { useState } from 'react';
import { Search, UserRound, ChevronLeft, Clock, Star, Stethoscope } from 'lucide-react';
import DoctorProfileModal from './DoctorProfileModal';

export default function FindDoctors({
  doctors,
  searchTerm,
  setSearchTerm,
  selectedSpecialty,
  setSelectedSpecialty,
  setSelectedDoctor,
  setCurrentPage,
}) {
  const [profileDoctor, setProfileDoctor] = useState(null);
  return (
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
              <div
                key={doctor.id}
                className="bg-white p-6 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => setProfileDoctor(doctor)}
              >
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
                    <Star size={12} fill="currentColor" /> {doctor.rating > 0 ? doctor.rating.toFixed(1) : 'New'}
                    {doctor.ratingCount > 0 && (
                      <span className="text-gray-400 font-normal">({doctor.ratingCount})</span>
                    )}
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
                  onClick={(e) => { e.stopPropagation(); setSelectedDoctor(doctor); }}
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

      {/* Doctor Profile Modal */}
      {profileDoctor && (
        <DoctorProfileModal
          doctor={profileDoctor}
          onClose={() => setProfileDoctor(null)}
          onBook={(doc) => setSelectedDoctor(doc)}
        />
      )}
    </main>
  );
}
