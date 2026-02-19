import { ArrowLeft, X, AlertCircle, Stethoscope, Star, Clock } from 'lucide-react';

export default function SymptomChecker({
  symptoms,
  searchSymptom,
  setSearchSymptom,
  symptomList,
  addSymptom,
  removeSymptom,
  analyzeSymptoms,
  setCurrentPage,
}) {
  return (
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
  );
}

export function PredictionResults({
  symptoms,
  prediction,
  recommendedDoctors,
  setCurrentPage,
  setSelectedDoctor,
}) {
  return (
    <main className="max-w-6xl mx-auto py-10 px-5 min-h-[calc(100vh-140px)]">
      <button className="px-4 py-2 bg-gray-100 rounded-lg mb-5 text-sm font-semibold text-gray-700 transition-all flex items-center gap-2 group" onClick={() => setCurrentPage('symptoms')}>
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Symptom Checker
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Prediction Results</h1>
      <p className="text-base text-gray-600 mb-8">Based on symptoms: <span className="font-medium text-gray-900">{symptoms.join(', ')}</span></p>

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

      <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r-lg mb-10 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-gray-500">
            <AlertCircle size={20} />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-700">
              <strong>Disclaimer:</strong> This is an AI-based prediction. Consult a professional for diagnosis.
            </p>
          </div>
        </div>
      </div>
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
                  <Star size={12} fill="currentColor" /> {doctor.rating > 0 ? doctor.rating.toFixed(1) : 'New'}
                  {doctor.ratingCount > 0 && (
                    <span className="text-gray-400 font-normal">({doctor.ratingCount})</span>
                  )}
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
  );
}
