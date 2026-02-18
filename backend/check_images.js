const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const userSchema = new mongoose.Schema({}, { strict: false });
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');

const checkImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const doctors = await Doctor.find({}, 'name profilePicture email status isApproved').lean();
        console.log('\n--- Doctors ---');
        console.log(`Found ${doctors.length} doctors`);
        doctors.forEach(d => console.log(`${d.name}: IMAGE=${d.profilePicture ? 'YES' : 'NO'}, STATUS=${d.status}, APPROVED=${d.isApproved}`));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkImages();
