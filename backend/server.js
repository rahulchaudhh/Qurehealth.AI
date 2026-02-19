const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 15000,  // Fail fast if Atlas unreachable
      socketTimeoutMS: 45000,           // Kill socket if idle >45s (prevents 120s hangs)
      connectTimeoutMS: 20000,          // 20s to establish connection
      maxPoolSize: 10,                  // Keep persistent connection pool
      minPoolSize: 2,                   // Keep at least 2 connections warm
      heartbeatFrequencyMS: 10000,      // Check connection health every 10s
      retryWrites: true,                // Auto-retry failed writes
      retryReads: true,                 // Auto-retry failed reads
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
  }
};
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const path = require('path');

app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/predict', require('./routes/predictionRoutes'));

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const fs = require('fs');
  const errorMsg = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
  fs.appendFileSync('error.log', `${new Date().toISOString()} - ${errorMsg}\n`);
  res.status(500).json({ error: err.message || errorMsg });
});

// Base route
app.get("/", (req, res) => {
  res.send("QurehealthAI Backend is running");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
