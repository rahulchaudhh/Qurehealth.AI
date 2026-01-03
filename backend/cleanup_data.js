const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/qurehealth');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const deleteTestDoctors = async () => {
    await connectDB();

    try {
        const result = await mongoose.connection.collection('doctors').deleteMany({ name: 'Test Doctor' });
        console.log(`Deleted ${result.deletedCount} doctors with name 'Test Doctor'`);
    } catch (err) {
        console.error('Error deleting doctors:', err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

deleteTestDoctors();
