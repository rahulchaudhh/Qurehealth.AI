require('dotenv').config();
const mongoose = require('mongoose');

console.log('URI:', process.env.MONGO_URI);
const start = Date.now();

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
}).then(async () => {
  console.log('Connected in', Date.now() - start, 'ms');
  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  console.log('Collections:', cols.map(c => c.name));
  const count = await db.collection('doctors').countDocuments();
  console.log('Doctor count:', count);
  process.exit(0);
}).catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
