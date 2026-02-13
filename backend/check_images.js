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

        const patients = await Patient.find({}, 'name profilePicture email').lean();
        console.log('--- Patients ---');
        console.log(`Found ${patients.length} patients`);
        patients.forEach(p => console.log(`${p.name}: ${p.profilePicture} (${typeof p.profilePicture})`));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkImages();
