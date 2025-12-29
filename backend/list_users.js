const mongoose = require('mongoose');
const Patient = require('./models/Patient');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

async function listPatients() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const patients = await Patient.find({});

        console.log('\n--- Registered Patients ---');
        if (patients.length === 0) {
            console.log('No patients found.');
        } else {
            patients.forEach(p => {
                console.log(`\nName: ${p.name}`);
                console.log(`Email: ${p.email}`);
                console.log(`ID: ${p._id}`);
                console.log(`Created At: ${p.createdAt}`);
            });
        }
        console.log('\n---------------------------');

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

listPatients();
