const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
    const Appointment = require('./models/Appointment');
    const Patient = require('./models/Patient');
    const p = await Patient.findOne().lean();
    if (!p) { console.log('No patients found'); process.exit(0); }
    console.log('Patient ID:', p._id, 'Name:', p.name);
    try {
        const apts = await Appointment.find({ patient: p._id })
            .populate('doctor', 'name specialization')
            .sort({ date: -1 })
            .lean()
            .maxTimeMS(30000);
        console.log('Appointments count:', apts.length);
        if (apts.length) console.log('Sample:', JSON.stringify(apts[0], null, 2));
    } catch(e) {
        console.error('Query error:', e.message);
    }
    process.exit(0);
}).catch(e => { console.error('DB Error:', e.message); process.exit(1); });
