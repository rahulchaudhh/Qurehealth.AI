import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { jsPDF } from "jspdf";
import { AuthContext } from '../context/AuthContext';

function MedicalRecordView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                // Assuming backend supports fetching single appointment by ID
                // If not, we might need to fetch all and filter, or add the endpoint.
                // Based on standard REST patterns usually present in this codebase:
                const res = await axios.get(`/appointments/${id}`);
                setRecord(res.data.data);
            } catch (err) {
                console.error("Error fetching record:", err);
                setError("Failed to load medical record.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRecord();
        }
    }, [id]);

    const generatePDF = (record) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;

        // --- Header (Letterhead Style) ---
        // Company Name
        doc.setFontSize(24);
        doc.setTextColor(37, 99, 235); // Brand Blue
        doc.setFont("helvetica", "bold");
        doc.text("Qurehealth Care", margin, 30);

        // Report Title & Date
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Gray
        doc.setFont("helvetica", "normal");
        doc.text("MEDICAL REPORT", pageWidth - margin, 25, { align: "right" });
        doc.text(`Date: ${new Date(record.date).toLocaleDateString()}`, pageWidth - margin, 30, { align: "right" });
        doc.text(`Ref: ${record._id.slice(-8).toUpperCase()}`, pageWidth - margin, 35, { align: "right" });

        // Divider Line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, 45, pageWidth - margin, 45);

        let yPos = 65;

        // --- Patient & Doctor Details (2 Columns, Clean Text) ---
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "bold");
        doc.text("PATIENT", margin, yPos);
        doc.text("DOCTOR", 110, yPos);

        yPos += 10;

        // Patient Name
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); // Black
        doc.setFont("helvetica", "normal");
        doc.text(user?.name || record.patient?.name || "N/A", margin, yPos);

        // Doctor Name
        doc.text(`Dr. ${record.doctor.name}`, 110, yPos);

        yPos += 8;

        // Secondary Details
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80); // Dark Gray
        doc.text(`ID: ${record._id}`, margin, yPos);
        doc.text(record.doctor.specialization, 110, yPos);
        yPos += 5;
        doc.text(record.doctor.hospital || 'Qurehealth Care', 110, yPos);

        yPos += 30;

        // --- Diagnosis Section ---
        doc.setFontSize(11);
        doc.setTextColor(37, 99, 235); // Blue Accent
        doc.setFont("helvetica", "bold");
        doc.text("DIAGNOSIS", margin, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        const splitDiagnosis = doc.splitTextToSize(record.diagnosis || record.reason || 'N/A', pageWidth - (margin * 2));
        doc.text(splitDiagnosis, margin, yPos);
        yPos += (splitDiagnosis.length * 7) + 20;

        // --- Prescription Section ---
        if (record.prescription) {
            doc.setFontSize(11);
            doc.setTextColor(37, 99, 235);
            doc.setFont("helvetica", "bold");
            doc.text("PRESCRIPTION (Rx)", margin, yPos);
            yPos += 10;

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");

            const splitPrescription = doc.splitTextToSize(record.prescription, pageWidth - (margin * 2));
            doc.text(splitPrescription, margin, yPos);
            yPos += (splitPrescription.length * 7) + 20;
        }

        // --- Notes Section ---
        if (record.doctorNotes) {
            doc.setFontSize(11);
            doc.setTextColor(37, 99, 235);
            doc.setFont("helvetica", "bold");
            doc.text("NOTES", margin, yPos);
            yPos += 10;

            doc.setFontSize(11);
            doc.setTextColor(60, 60, 60);
            doc.setFont("helvetica", "italic");

            const splitNotes = doc.splitTextToSize(record.doctorNotes, pageWidth - (margin * 2));
            doc.text(splitNotes, margin, yPos);
        }

        // --- Footer (Simple) ---
        const footerY = pageHeight - 20;
        doc.setDrawColor(226, 232, 240);
        doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.setFont("helvetica", "normal");
        doc.text("Page 1/1", pageWidth - 20, footerY + 5, { align: "right" });

        doc.save(`Medical_Report_${new Date(record.date).toLocaleDateString().replace(/\//g, '-')}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !record) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <p className="mb-4 text-lg">{error || "Record not found"}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-center justify-center font-sans">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Medical Record</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Official Report</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Diagnosis & Date Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-50">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">TREATMENT FOR</h3>
                            <p className="text-3xl font-bold text-gray-900 leading-tight">{record.diagnosis || record.reason}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">DATE OF VISIT</span>
                            <p className="text-lg text-gray-900 font-medium bg-gray-50 px-3 py-1 rounded-lg inline-block">
                                {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Doctor Card */}
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 flex gap-5 items-center">
                        <div className="w-16 h-16 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-2xl shadow-sm ring-4 ring-white">
                            {record.doctor.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900 mb-0.5">Dr. {record.doctor.name}</p>
                            <p className="text-sm text-blue-600 font-bold uppercase tracking-wide">{record.doctor.specialization}</p>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <span>🏥</span>
                                {record.doctor.hospital || 'Qurehealth Care'}
                            </p>
                        </div>
                    </div>

                    {/* Prescription Section */}
                    {record.prescription && (
                        <div className="animate-slideIn">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span>💊</span> PRESCRIPTION
                            </h3>
                            <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full opacity-20 -mr-10 -mt-10"></div>
                                <p className="text-gray-800 whitespace-pre-line font-medium leading-relaxed text-lg relative z-10">
                                    {record.prescription}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Doctor Notes Section */}
                    {record.doctorNotes && (
                        <div className="animate-slideIn">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span>📝</span> DOCTOR'S NOTES
                            </h3>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative">
                                <p className="text-gray-600 italic text-base leading-relaxed">
                                    "{record.doctorNotes}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-colors text-sm"
                    >
                        Go Back
                    </button>

                    <button
                        onClick={() => generatePDF(record)}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Download Report
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MedicalRecordView;
