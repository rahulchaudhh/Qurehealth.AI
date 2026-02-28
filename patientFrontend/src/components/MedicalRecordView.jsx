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
        const rightCol = 110;
        let y = 20;

        // ── Clinic Header (left) + Date & Ref (right) ──
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Qurehealth.AI", margin, y);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        const issuedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(issuedDate, pageWidth - margin, y, { align: "right" });

        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.text("Healthcare Platform", margin, y);
        doc.text(`Ref: ${record._id.slice(-8).toUpperCase()}`, pageWidth - margin, y, { align: "right" });
        y += 5;
        doc.text("support@qurehealth.ai", margin, y);
        y += 5;
        doc.text("www.qurehealth.ai", margin, y);

        y += 12;

        // ── Title ──
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Patient Medical Record", margin, y);
        y += 10;

        // ── Patient Information Box ──
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.4);
        doc.rect(margin, y, pageWidth - margin * 2, 32);

        y += 7;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Patient Information", margin + 4, y);
        y += 7;

        const patientName = user?.name || record.patient?.name || 'N/A';
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(patientName, margin + 4, y);

        // Right col: Date of Birth + Patient ID
        if (user?.dateOfBirth) {
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("Date of Birth", rightCol, y - 7);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), rightCol, y - 1);
        }

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Patient ID", rightCol, y + 5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(record._id.slice(-8).toUpperCase(), rightCol, y + 11);

        y += 5;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        if (user?.phone) { doc.text(user.phone, margin + 4, y); y += 5; }
        else y += 5;
        if (user?.gender) { doc.text(user.gender.charAt(0).toUpperCase() + user.gender.slice(1), margin + 4, y); }

        y += 14;

        // ── Section helper ──
        const drawSection = (title) => {
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(title, margin, y);
            y += 3;
            doc.setDrawColor(150, 150, 150);
            doc.setLineWidth(0.4);
            doc.line(margin, y, pageWidth - margin, y);
            y += 6;
        };

        const drawLabel = (label) => {
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(label, margin, y);
            y += 5;
        };

        const drawValue = (value) => {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50, 50, 50);
            const lines = doc.splitTextToSize(value, pageWidth - margin * 2);
            doc.text(lines, margin, y);
            y += lines.length * 6 + 4;
        };

        // ── Doctor Details ──
        drawSection("Doctor Details");
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`Dr. ${record.doctor.name}`, margin, y);

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Facility", rightCol, y);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(record.doctor.hospital || 'Qurehealth Care', rightCol, y + 6);

        y += 6;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(record.doctor.specialization, margin, y);
        y += 10;

        // ── Visit Details ──
        drawSection("Visit Details");

        // 2-col: Date of Visit | Appointment Status
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Date of Visit", margin, y);
        doc.text("Appointment Status", rightCol, y);
        y += 5;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        const visitDate = new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(visitDate, margin, y);
        doc.text((record.status || 'Completed').charAt(0).toUpperCase() + (record.status || 'Completed').slice(1), rightCol, y);
        y += 8;

        drawLabel("Diagnosis / Reason for Visit");
        drawValue((record.diagnosis || record.reason || 'N/A').charAt(0).toUpperCase() + (record.diagnosis || record.reason || 'N/A').slice(1));

        // ── Prescription ──
        drawSection("Prescription (Rx)");
        if (record.prescription) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50, 50, 50);
            const lines = doc.splitTextToSize(record.prescription, pageWidth - margin * 2);
            doc.text(lines, margin, y);
            y += lines.length * 6 + 4;
        } else {
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(150, 150, 150);
            doc.text("No prescription issued for this visit.", margin, y);
            y += 10;
        }

        // ── Physician's Notes ──
        drawSection("Physician's Notes");
        if (record.doctorNotes) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(80, 80, 80);
            const lines = doc.splitTextToSize(`"${record.doctorNotes}"`, pageWidth - margin * 2);
            doc.text(lines, margin, y);
            y += lines.length * 6 + 4;
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(130, 130, 130);
            doc.text(`— Dr. ${record.doctor.name}`, margin, y);
            y += 8;
        } else {
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(150, 150, 150);
            doc.text("No clinical notes recorded.", margin, y);
            y += 10;
        }

        // ── Footer ──
        const footerY = pageHeight - 14;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.4);
        doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 160, 160);
        doc.text("This is an official medical record issued by Qurehealth.AI.", margin, footerY + 2);
        doc.text("Page 1 / 1", pageWidth - margin, footerY + 2, { align: "right" });

        doc.save(`Medical_Report_${record._id.slice(-8).toUpperCase()}.pdf`);
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-500">
                <p className="mb-4 text-lg">{error || "Record not found"}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const refNumber = record._id?.slice(-8).toUpperCase();
    const visitDate = new Date(record.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const issuedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const patientName = user?.name || record.patient?.name || 'N/A';

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 flex items-start justify-center">
            <div className="w-full max-w-2xl">

                {/* Toolbar */}
                <div className="flex justify-between items-center mb-5">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-gray-500 hover:text-black font-medium flex items-center gap-1 transition-colors"
                    >
                        ← Back to Records
                    </button>
                    <button
                        onClick={() => generatePDF(record)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download PDF
                    </button>
                </div>

                {/* Paper Document */}
                <div className="bg-white shadow-md border border-gray-300 font-sans text-gray-900" style={{ padding: '48px 52px' }}>

                    {/* ── Clinic Header ── */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xl font-bold text-black leading-tight">Qurehealth.AI</p>
                            <p className="text-sm text-gray-500 mt-0.5">Healthcare Platform</p>
                            <p className="text-sm text-gray-500">support@qurehealth.ai</p>
                            <p className="text-sm text-gray-500">www.qurehealth.ai</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                            <p className="font-semibold text-gray-700">{issuedDate}</p>
                            <p className="mt-1">Ref: <span className="font-mono text-black">{refNumber}</span></p>
                        </div>
                    </div>

                    {/* ── Title ── */}
                    <h1 className="text-2xl font-bold text-black mb-5">Patient Medical Record</h1>

                    {/* ── Patient Information ── */}
                    <div className="border border-gray-300 rounded p-4 mb-5">
                        <p className="text-sm font-bold text-black mb-3">Patient Information</p>
                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                            <div>
                                <p className="font-semibold text-black">{patientName}</p>
                                {user?.phone && <p className="text-gray-600 mt-0.5">{user.phone}</p>}
                                {user?.gender && <p className="text-gray-600 capitalize">{user.gender}</p>}
                            </div>
                            <div>
                                {user?.dateOfBirth && (
                                    <div className="mb-1">
                                        <p className="font-semibold text-black text-xs">Date of Birth</p>
                                        <p className="text-gray-800">{new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-black text-xs">Patient ID</p>
                                    <p className="font-mono text-gray-800">{record._id?.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Doctor Details ── */}
                    <p className="text-sm font-bold text-black mb-1">Doctor Details</p>
                    <hr className="border-gray-400 mb-3" />
                    <div className="grid grid-cols-2 gap-y-1 text-sm mb-5">
                        <div>
                            <p className="font-semibold text-black">Dr. {record.doctor.name}</p>
                            <p className="text-gray-600">{record.doctor.specialization}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-black text-xs">Facility</p>
                            <p className="text-gray-600">{record.doctor.hospital || 'Qurehealth Care'}</p>
                        </div>
                    </div>

                    {/* ── Visit Details ── */}
                    <p className="text-sm font-bold text-black mb-1">Visit Details</p>
                    <hr className="border-gray-400 mb-3" />
                    <div className="grid grid-cols-2 gap-y-2 text-sm mb-5">
                        <div>
                            <p className="font-semibold text-black text-xs">Date of Visit</p>
                            <p className="text-gray-800">{visitDate}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-black text-xs">Appointment Status</p>
                            <p className="text-gray-800 capitalize">{record.status || 'Completed'}</p>
                        </div>
                        <div className="col-span-2 mt-1">
                            <p className="font-semibold text-black text-xs">Diagnosis / Reason for Visit</p>
                            <p className="text-gray-900 capitalize font-medium mt-0.5">{record.diagnosis || record.reason || 'N/A'}</p>
                        </div>
                    </div>

                    {/* ── Prescription ── */}
                    <p className="text-sm font-bold text-black mb-1">Prescription (Rx)</p>
                    <hr className="border-gray-400 mb-3" />
                    <div className="text-sm mb-5 min-h-[48px]">
                        {record.prescription
                            ? <p className="text-gray-900 whitespace-pre-line leading-relaxed">{record.prescription}</p>
                            : <p className="text-gray-400 italic">No prescription issued for this visit.</p>
                        }
                    </div>

                    {/* ── Doctor's Notes ── */}
                    <p className="text-sm font-bold text-black mb-1">Physician's Notes</p>
                    <hr className="border-gray-400 mb-3" />
                    <div className="text-sm mb-8 min-h-[48px]">
                        {record.doctorNotes
                            ? <p className="text-gray-700 italic leading-relaxed">"{record.doctorNotes}"<br /><span className="not-italic text-gray-500 text-xs mt-1 block">— Dr. {record.doctor.name}</span></p>
                            : <p className="text-gray-400 italic">No clinical notes recorded.</p>
                        }
                    </div>

                    {/* ── Footer ── */}
                    <hr className="border-gray-300 mb-4" />
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400">This is an official medical record issued by Qurehealth.AI.</p>
                        <p className="text-xs text-gray-400 font-mono">Page 1</p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default MedicalRecordView;
