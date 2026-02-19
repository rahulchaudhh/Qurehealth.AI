import { ChevronLeft, Download, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MedicalHistory({
  medicalHistory,
  setCurrentPage,
  generatePDF,
  handleDeleteRecord,
}) {
  const navigate = useNavigate();

  return (
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
  );
}
