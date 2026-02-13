const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const DoctorSchema = new mongoose.Schema({
    status: String,
    specialization: String,
    name: String
});
const Doctor = mongoose.model('Doctor', DoctorSchema);

async function checkDoctors() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const doctors = await Doctor.find({ status: 'approved' });
        console.log('Approved Doctors Specializations:');
        doctors.forEach(d => console.log(`- ${d.name}: ${d.specialization}`));

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkDoctors();
