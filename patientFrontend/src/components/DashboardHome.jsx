import { Search, UserRound, Calendar, ClipboardList, ExternalLink, Droplets, Apple, Moon, Zap, Clock, ArrowRight } from 'lucide-react';

export default function DashboardHome({ user, myAppointments, setCurrentPage }) {
  return (
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
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-5 group-hover:shadow-lg transition-all duration-300 overflow-hidden">
            <img src="/check_symptoms.png" alt="Check Symptoms" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1.5">Check Symptoms</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">AI-powered intelligent disease prediction and analysis</p>
          <div className="mt-4 flex items-center text-xs font-bold text-blue-600 uppercase tracking-widest group-hover:gap-2 transition-all">
            START ANALYSIS <ArrowRight size={14} className="ml-1" />
          </div>
        </div>

        <div
          className="group relative bg-white p-6 rounded-2xl border border-gray-100 cursor-pointer hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
          onClick={() => setCurrentPage('doctors')}
        >
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-5 group-hover:shadow-lg transition-all duration-300 overflow-hidden">
            <img src="/find_doctors.png" alt="Find Doctors" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1.5">Find Doctors</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">Book consultations with verified top health specialists</p>
          <div className="mt-4 flex items-center text-xs font-bold text-blue-600 uppercase tracking-widest group-hover:gap-2 transition-all">
            FIND SPECIALIST <ArrowRight size={14} className="ml-1" />
          </div>
        </div>

        <div
          className="group relative bg-white p-6 rounded-2xl border border-gray-100 cursor-pointer hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300"
          onClick={() => setCurrentPage('appointments')}
        >
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-5 group-hover:shadow-lg transition-all duration-300 overflow-hidden">
            <img src="/my_appointments.png" alt="My Appointments" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1.5">My Appointments</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">Manage your upcoming and past medical consultations</p>
          <div className="mt-4 flex items-center text-xs font-bold text-blue-600 uppercase tracking-widest group-hover:gap-2 transition-all">
            MANAGE SCHEDULE <ArrowRight size={14} className="ml-1" />
          </div>
        </div>

        <div
          className="group relative bg-white p-6 rounded-2xl border border-gray-100 cursor-pointer hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300"
          onClick={() => setCurrentPage('history')}
        >
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-5 group-hover:shadow-lg transition-all duration-300 overflow-hidden">
            <img src="/medical_history.png" alt="Medical History" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1.5">Medical History</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">Access and download your complete health records</p>
          <div className="mt-4 flex items-center text-xs font-bold text-blue-600 uppercase tracking-widest group-hover:gap-2 transition-all">
            VIEW RECORDS <ArrowRight size={14} className="ml-1" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
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
                      ? 'text-blue-700 bg-blue-50'
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
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2 text-[#1a73e8] hover:text-[#1557b0] text-xs font-bold transition-all underline decoration-blue-100 hover:decoration-blue-200"
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
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="/stay_hydrated.png" alt="Stay Hydrated" className="w-full h-full object-cover" />
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
              className="group block p-4 bg-blue-50/30 rounded-xl border border-blue-50 hover:border-blue-100 hover:bg-blue-50/50 transition-all"
            >
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="/balanced_diet.png" alt="Balanced Diet" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 mb-0.5 flex items-center gap-1">
                    Balanced Diet
                    <ExternalLink size={10} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
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
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="/quality_sleep.png" alt="Quality Sleep" className="w-full h-full object-cover" />
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

      <div className="relative bg-white p-8 rounded-2xl border-2 border-red-50 shadow-xl shadow-red-500/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full opacity-40 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-50 rounded-full opacity-40 -ml-24 -mb-24"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-900">
            <h2 className="text-2xl font-bold mb-3">24/7 Emergency Services</h2>
            <p className="text-gray-500 text-sm mb-4 font-medium">Immediate medical assistance available anytime</p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Helpline:</span>
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-bold">102</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">Ambulance:</span>
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-bold font-mono">1-4200-1990</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.href = 'tel:102'}
            className="px-8 py-3.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-red-700 hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 active:scale-95"
          >
            Call Emergency Now
          </button>
        </div>
      </div>
    </main>
  );
}
