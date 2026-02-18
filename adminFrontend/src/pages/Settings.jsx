import { Settings as SettingsIcon, ShieldCheck, Database, Bell, Layout } from 'lucide-react';

function Settings() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-slate-900 font-outfit">Admin Settings</h1>
                <p className="text-slate-500 mt-2 text-lg font-medium">Configure platform-wide parameters and security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2">Security Rules</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">Manage doctor verification criteria and multi-factor authentication requirements.</p>
                    <button className="w-full py-3 bg-slate-50 text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">Configure</button>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                        <Database size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2">System Logs</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">View comprehensive logs of all administrative actions and system events.</p>
                    <button className="w-full py-3 bg-slate-50 text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">View Logs</button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
