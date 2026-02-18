const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');

// Helper: generate a JWT with user payload
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    console.log('--- Register Request Received ---');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { name, email, password, role, profilePicture: bodyProfilePic, ...otherData } = req.body; // role: 'patient' or 'doctor'

    if (role === 'doctor') {
      const doctorExists = await Doctor.findOne({ email });
      if (doctorExists) {
        return res.status(400).json({ error: 'Doctor already exists' });
      }

      // Handle file upload
      let profilePicture = null;
      if (req.file) {
        profilePicture = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      const doctor = await Doctor.create({
        name,
        email,
        password,
        profilePicture,
        isApproved: true, // Auto-approve for demo/testing purposes
        ...otherData // specialization, experience, etc.
      });

      // Do NOT return token for doctor immediately due to approval requirement
      res.status(201).json({
        message: 'Doctor registration successful. verification pending.'
      });

    } else {
      // Default to Patient
      const patientExists = await Patient.findOne({ email });
      if (patientExists) {
        return res.status(400).json({ error: 'Patient already exists' });
      }

      const patient = await Patient.create({
        name,
        email,
        password,
        ...otherData
      });

      const patientObj = patient.toObject();
      patientObj.role = 'patient';

      const token = signToken({
        _id: patientObj._id,
        id: patientObj._id,
        name: patientObj.name,
        email: patientObj.email,
        role: 'patient'
      });

      res.status(201).json({
        token,
        data: patientObj
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('--- Login Request Received ---');
    console.log('Body:', req.body);
    const { email, password } = req.body;

    // Check Patient First
    const patient = await Patient.findOne({ email }).select('+password');
    if (patient) {
      const isMatch = await patient.matchPassword(password);
      if (isMatch) {
        const patientObj = patient.toObject();
        patientObj.role = 'patient';

        const token = signToken({
          _id: patientObj._id,
          id: patientObj._id,
          name: patientObj.name,
          email: patientObj.email,
          role: 'patient'
        });

        return res.json({ token, data: patientObj });
      }
    }

    // Check Doctor
    const doctor = await Doctor.findOne({ email }).select('+password');
    if (doctor) {
      const isMatch = await doctor.matchPassword(password);
      if (isMatch) {
        if (doctor.status !== 'approved' && !doctor.isApproved) {
          return res.status(403).json({
            error: doctor.status === 'rejected'
              ? 'Your account has been rejected. Please contact support.'
              : 'Your account is pending approval. Please wait for admin verification.'
          });
        }

        const doctorObj = doctor.toObject();
        doctorObj.role = 'doctor';

        const token = signToken({
          _id: doctorObj._id,
          id: doctorObj._id,
          name: doctorObj.name,
          email: doctorObj.email,
          role: 'doctor'
        });

        return res.json({ token, data: doctorObj });
      }
    }

    // Check Admin (Hardcoded for Demo)
    if (email === 'admin@qurehealth.ai' && password === 'admin123') {
      const adminUser = {
        id: 'admin_id',
        _id: 'admin_id',
        name: 'Admin User',
        email: email,
        role: 'admin'
      };

      const token = signToken({
        _id: 'admin_id',
        id: 'admin_id',
        name: 'Admin User',
        email: email,
        role: 'admin'
      });

      return res.json({ token, data: adminUser });
    }

    return res.status(401).json({ error: 'Invalid credentials' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  // With JWT, logout is handled client-side by removing the token.
  // This endpoint exists for API compatibility.
  res.json({ message: 'Logout successful' });
};

exports.getMe = async (req, res) => {
  try {
    // req.user is populated by auth middleware from JWT payload
    let userData = req.user;

    if (req.user.role === 'patient') {
      const patient = await Patient.findById(req.user._id).select('-password');
      if (patient) {
        userData = { ...patient.toObject(), role: 'patient' };
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findById(req.user._id).select('-password');
      if (doctor) {
        userData = { ...doctor.toObject(), role: 'doctor' };
      }
    }
    // For admin, just return the JWT payload

    res.json({ data: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log('--- Update Profile Request ---');
    console.log('User from MiddleWare:', req.user);
    console.log('Body:', req.body);
    const { name, phone, dateOfBirth, gender } = req.body;

    let user;
    if (req.user.role === 'patient') {
      user = await Patient.findById(req.user._id);
    } else if (req.user.role === 'doctor') {
      user = await Doctor.findById(req.user._id);
    } else if (req.user.role === 'admin') {
      // Admin is hardcoded — just return updated info
      const adminUser = { ...req.user };
      if (name) adminUser.name = name;
      return res.json({ success: true, data: adminUser });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Patient specific fields
    if (dateOfBirth && req.user.role === 'patient') {
      user.dateOfBirth = dateOfBirth; // Mongoose handles string -> Date casting
    }

    // Doctor specific fields
    if (req.user.role === 'doctor') {
      if (req.body.specialization) user.specialization = req.body.specialization;
      if (req.body.experience) {
        // Ensure experience is a number
        const exp = Number(req.body.experience);
        if (!isNaN(exp)) {
          user.experience = exp;
        }
      }
    }

    if (gender) user.gender = gender;

    // Handle Profile Picture Upload
    if (req.file) {
      console.log('Detailed File Info:', req.file); // Debugging
      user.profilePicture = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    try {
      await user.save();
    } catch (saveError) {
      console.error('DB Save Error:', saveError);
      return res.status(400).json({ error: 'Database Validation Error: ' + saveError.message });
    }

    const updatedUser = {
      ...user.toObject(),
      role: req.user.role
    };

    // Issue a fresh token with potentially updated name/email
    const token = signToken({
      _id: updatedUser._id,
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });

    res.json({
      success: true,
      token,
      data: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
};