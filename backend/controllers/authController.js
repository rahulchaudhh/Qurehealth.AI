const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
// JWT removed

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
      req.session.user = patientObj;

      res.status(201).json({
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
        req.session.user = patientObj;

        req.session.save(err => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ error: 'Session save failed' });
          }
          return res.json({
            data: patientObj
          });
        });
        return;
      }
    }

    // Check Doctor
    const doctor = await Doctor.findOne({ email }).select('+password');
    if (doctor) {
      const isMatch = await doctor.matchPassword(password);
      if (isMatch) {
        if (!doctor.isApproved) {
          return res.status(403).json({ error: 'Your account is pending approval by Admin.' });
        }

        const doctorObj = doctor.toObject();
        doctorObj.role = 'doctor';
        req.session.user = doctorObj;

        req.session.save(err => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ error: 'Session save failed' });
          }
          return res.json({
            data: doctorObj
          });
        });
        return;
      }
    }

    // Check Admin (Hardcoded for Demo)
    if (email === 'admin@qurehealth.ai' && password === 'admin123') {
      // Ideally store in DB, but this works for demo
      // Ideally store in DB, but this works for demo
      const adminUser = {
        id: 'admin_id',
        name: 'Admin User',
        email: email,
        role: 'admin'
      };
      req.session.user = adminUser;

      req.session.save(err => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: 'Session save failed' });
        }
        return res.json({
          data: adminUser
        });
      });
      return;
    }

    return res.status(401).json({ error: 'Invalid credentials' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
};

exports.getMe = async (req, res) => {
  try {
    // req.user is populated by auth middleware
    res.json({ data: req.user });
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

    // We only allow updating specific fields.
    // Determine if user is Patient or Doctor based on role in req.user
    // But req.user is populated by auth middleware.

    let user;
    if (req.user.role === 'patient') {
      user = await Patient.findById(req.user._id);
    } else if (req.user.role === 'doctor') {
      user = await Doctor.findById(req.user._id);
    } else if (req.user.role === 'admin') {
      // Admin is not in DB for this demo/hardcoded implementation
      // Just update session and return success to avoid error
      const adminUser = { ...req.user };
      if (name) adminUser.name = name;
      // Admin might not have phone/DOB/gender fields in this simple demo, but let's allow name update in session

      req.session.user = adminUser;

      return req.session.save(err => {
        if (err) return res.status(500).json({ error: 'Session save failed' });
        res.json({
          success: true,
          data: adminUser
        });
      });
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
    req.session.user = updatedUser;

    // Explicitly save session to ensure persistence
    req.session.save(err => {
      if (err) {
        console.error('Session save error in updateProfile:', err);
        // Don't fail the request if just session save fails, but log it
      }
      res.json({
        success: true,
        data: updatedUser
      });
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
};