const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('Testing MongoDB Connection...');
console.log('URI from env:', process.env.MONGO_URI ? 'Found (hidden)' : 'Not Found');

if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI is missing in .env file');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connection Successful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('MongoDB Connection Failed:', err.message);
        process.exit(1);
    });
