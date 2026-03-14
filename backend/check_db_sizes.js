const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env from current directory
dotenv.config();

const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const doctorCount = await Doctor.countDocuments();
        const patientCount = await Patient.countDocuments();

        console.log(`Doctors: ${doctorCount}`);
        console.log(`Patients: ${patientCount}`);

        const docsWithPic = await Doctor.find({ profilePicture: { $ne: null } }).select('name profilePicture');
        console.log(`Doctors with profile pictures: ${docsWithPic.length}`);
        
        docsWithPic.forEach(d => {
            if (d.profilePicture) {
                console.log(`Doctor ${d.name} pic size: ${d.profilePicture.length} characters`);
                if (d.profilePicture.length > 100000) {
                    console.log(`--- !! LARGE PIC DETECTED for ${d.name} !! ---`);
                }
            }
        });

        const usersWithPic = await Patient.find({ profilePicture: { $ne: null } }).select('name profilePicture');
        console.log(`Patients with profile pictures: ${usersWithPic.length}`);
        
        usersWithPic.forEach(u => {
            if (u.profilePicture) {
                console.log(`Patient ${u.name} pic size: ${u.profilePicture.length} characters`);
                if (u.profilePicture.length > 100000) {
                    console.log(`--- !! LARGE PIC DETECTED for ${u.name} !! ---`);
                }
            }
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
