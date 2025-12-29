const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, address } = req.body;

    const patientExists = await Patient.findOne({ email });
    if (patientExists) {
      return res.status(400).json({ error: 'Patient already exists' });
    }

    const patient = await Patient.create({
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      address
    });

    if (patient) {
      res.status(201).json({
        token: generateToken(patient._id),
        data: {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          address: patient.address
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email }).select('+password');
    if (!patient) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await patient.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      token: generateToken(patient._id),
      data: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: patient.address
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const patient = await Patient.findById(req.patient.id).select('-password');
    res.json({ data: patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};