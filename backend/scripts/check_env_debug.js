require('dotenv').config();

console.log('Checking Environment Variables...');
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
if (process.env.MONGO_URI) {
    console.log('MONGO_URI starts with:', process.env.MONGO_URI.substring(0, 15) + '...');
}
console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
console.log('PORT:', process.env.PORT);

console.log('Test Complete');
