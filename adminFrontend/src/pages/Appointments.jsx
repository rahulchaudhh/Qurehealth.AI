import { Calendar as CalendarIcon, Clock, ShieldCheck } from 'lucide-react';

function Appointments() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-20">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarIcon size={32} />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 font-outfit">Appointments Management</h1>
            <p className="text-slate-500 mt-4 text-lg max-w-md mx-auto">
                This feature is currently in development. Soon you'll be able to manage all platform appointments from here.
            </p>
        </div>
    );
}

export default Appointments;
