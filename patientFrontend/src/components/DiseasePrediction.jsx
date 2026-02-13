
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Search, Activity, AlertCircle, Check, X } from 'lucide-react';

const DiseasePrediction = () => {
    const [symptoms, setSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingSymptoms, setLoadingSymptoms] = useState(true);

    // Fetch symptoms from backend on mount
    useEffect(() => {
        const fetchSymptoms = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/predict/symptoms');
                // The backend returns { symptoms: [...] }
                if (response.data.symptoms) {
                    setSymptoms(response.data.symptoms);
                } else {
                    toast.error('Invalid symptom data received');
                }
            } catch (error) {
                console.error('Error fetching symptoms:', error);
                toast.error('Failed to load symptoms list');
            } finally {
                setLoadingSymptoms(false);
            }
        };

        fetchSymptoms();
    }, []);

    // Toggle symptom selection
    const toggleSymptom = (symptom) => {
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
        } else {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
        }
        setPrediction(null); // Reset prediction on change
    };

    // Remove symptom tag
    const removeSymptom = (symptom) => {
        setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
        setPrediction(null);
    };

    // Handle Prediction
    const handlePredict = async () => {
        if (selectedSymptoms.length === 0) {
            toast.warning('Please select at least one symptom');
            return;
        }

        setLoading(true);
        setPrediction(null);

        try {
            const response = await axios.post('http://localhost:5001/api/predict', {
                symptoms: selectedSymptoms
            });

            if (response.data && response.data.predicted_disease) {
                setPrediction(response.data.predicted_disease);
                toast.success('Prediction generated!');
            } else {
                toast.error('No prediction returned');
            }
        } catch (error) {
            console.error('Prediction error:', error);
            toast.error(error.response?.data?.error || 'Failed to predict disease');
        } finally {
            setLoading(false);
        }
    };

    // Filter symptoms based on search
    const filteredSymptoms = symptoms.filter(s =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 px-8 py-6">
                    <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Activity className="h-8 w-8" />
                        AI Disease Predictor
                    </h2>
                    <p className="mt-2 text-indigo-100 opacity-90">
                        Select your symptoms to get an instant AI-powered health assessment.
                    </p>
                </div>

                <div className="p-8 space-y-8">

                    {/* Selected Symptoms Tags */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            Selected Symptoms ({selectedSymptoms.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {selectedSymptoms.length === 0 ? (
                                <span className="text-gray-400 italic text-sm">No symptoms selected yet...</span>
                            ) : (
                                selectedSymptoms.map(sym => (
                                    <span key={sym} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 transition-colors group">
                                        {sym.replace(/_/g, ' ')}
                                        <button
                                            onClick={() => removeSymptom(sym)}
                                            className="ml-2 hover:bg-indigo-200 rounded-full p-0.5 focus:outline-none"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Symptom Search & Selection */}
                    <div>
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search symptoms (e.g., headache, fever)..."
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {loadingSymptoms ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-500">Loading symptoms...</p>
                            </div>
                        ) : (
                            <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50 custom-scrollbar">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {filteredSymptoms.map(sym => (
                                        <button
                                            key={sym}
                                            onClick={() => toggleSymptom(sym)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-md text-left text-sm font-medium transition-all duration-200 ${selectedSymptoms.includes(sym)
                                                    ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                                                }`}
                                        >
                                            <span className="truncate">{sym.replace(/_/g, ' ')}</span>
                                            {selectedSymptoms.includes(sym) && <Check size={16} />}
                                        </button>
                                    ))}
                                    {filteredSymptoms.length === 0 && (
                                        <div className="col-span-full text-center py-8 text-gray-500">
                                            No symptoms found matching "{searchTerm}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-gray-100">
                        <button
                            onClick={handlePredict}
                            disabled={loading || selectedSymptoms.length === 0}
                            className={`w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white transition-all transform hover:-translate-y-0.5 ${loading || selectedSymptoms.length === 0
                                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Analyzing Symptoms...
                                </span>
                            ) : 'Analyze Symptoms & Predict'}
                        </button>
                    </div>

                    {/* Prediction Result */}
                    {prediction && (
                        <div className="animate-fade-in-up mt-8 p-6 bg-green-50 rounded-xl border border-green-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Activity className="w-32 h-32 text-green-600" />
                            </div>

                            <div className="relative z-10 text-center">
                                <span className="inline-block p-3 rounded-full bg-green-100 text-green-600 mb-4">
                                    <Check className="w-8 h-8" />
                                </span>
                                <h3 className="text-xl font-semibold text-green-900 mb-2">Based on your symptoms</h3>
                                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 my-4">
                                    {prediction}
                                </div>
                                <p className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-100/50 py-2 px-4 rounded-full inline-flex mx-auto">
                                    <AlertCircle size={16} />
                                    This is an AI-generated assessment. Please consult a doctor.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiseasePrediction;
