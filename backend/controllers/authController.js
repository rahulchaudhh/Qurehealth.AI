const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/sendEmail');

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
    const { email, password } = req.body;

    // Check Admin first — no DB call needed
    if (email === 'admin@qurehealth.ai' && password === 'admin123') {
      const adminUser = {
        id: 'admin_id',
        _id: 'admin_id',
        name: 'Admin User',
        email: email,
        role: 'admin'
      };
      const token = signToken({ _id: 'admin_id', id: 'admin_id', name: 'Admin User', email, role: 'admin' });
      return res.json({ token, data: adminUser });
    }

    // Query Patient and Doctor in PARALLEL — halves DB latency
    const [patient, doctor] = await Promise.all([
      Patient.findOne({ email }).select('+password').lean(),
      Doctor.findOne({ email }).select('+password').lean()
    ]);

    // Check Patient
    if (patient) {
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(password, patient.password);
      if (isMatch) {
        const patientObj = { ...patient, role: 'patient' };
        const token = signToken({ _id: patientObj._id, id: patientObj._id, name: patientObj.name, email: patientObj.email, role: 'patient' });
        return res.json({ token, data: patientObj });
      }
    }

    // Check Doctor
    if (doctor) {
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(password, doctor.password);
      if (isMatch) {
        if (doctor.status !== 'approved' && !doctor.isApproved) {
          return res.status(403).json({
            error: doctor.status === 'rejected'
              ? 'Your account has been rejected. Please contact support.'
              : 'Your account is pending approval. Please wait for admin verification.'
          });
        }
        const doctorObj = { ...doctor, role: 'doctor' };
        const token = signToken({ _id: doctorObj._id, id: doctorObj._id, name: doctorObj.name, email: doctorObj.email, role: 'doctor' });
        return res.json({ token, data: doctorObj });
      }
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
      const patient = await Patient.findById(req.user._id).select('-password').lean();
      if (patient) {
        userData = { ...patient, role: 'patient' };
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findById(req.user._id).select('-password -profilePicture').lean();
      if (doctor) {
        doctor.hasProfilePicture = true;
        userData = { ...doctor, role: 'doctor' };
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

    // Strip out large profilePicture from response (use /profile-picture endpoint instead)
    if (updatedUser.profilePicture) {
      delete updatedUser.profilePicture;
      updatedUser.hasProfilePicture = true;
    }

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

// Google Sign-In — verify token, find or create patient
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential missing' });

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find existing patient by email or googleId
    let patient = await Patient.findOne({ $or: [{ email }, { googleId }] });

    if (!patient) {
      // Create new patient (no password needed for Google users)
      patient = await Patient.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        password: `google_${googleId}_${Date.now()}`, // placeholder, never used
      });
    } else {
      // Update googleId and latest profile picture on every login
      patient.googleId = googleId;
      patient.profilePicture = picture;
      await patient.save();
    }

    const patientObj = { ...patient.toObject(), role: 'patient' };
    const token = signToken({
      _id: patientObj._id,
      id: patientObj._id,
      name: patientObj.name,
      email: patientObj.email,
      role: 'patient'
    });

    return res.json({ token, data: patientObj });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Google sign-in failed. Please try again.' });
  }
};

// Google OAuth2 redirect callback — exchanges auth code for user info
exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing authorization code');

    const redirectUri = 'http://localhost:5001/api/auth/google/callback';
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Verify the ID token to get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create patient
    let patient = await Patient.findOne({ $or: [{ email }, { googleId }] });
    if (!patient) {
      patient = await Patient.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        password: `google_${googleId}_${Date.now()}`,
      });
    } else {
      patient.googleId = googleId;
      patient.profilePicture = picture;
      await patient.save();
    }

    const token = signToken({
      _id: patient._id,
      id: patient._id,
      name: patient.name,
      email: patient.email,
      role: 'patient'
    });

    // Redirect back to patient frontend with token
    res.redirect(`http://localhost:5173/auth/google/success?token=${token}&role=patient`);

  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect('http://localhost:5173/login?error=google_failed');
  }
};

// @desc    Forgot password — send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Please provide an email address.' });

    // Search both Patient and Doctor
    const [patient, doctor] = await Promise.all([
      Patient.findOne({ email }),
      Doctor.findOne({ email })
    ]);

    const user = patient || doctor;

    if (!user) {
      // Don't reveal whether email exists — always return success
      return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    }

    // Check if user signed up via Google (no password to reset)
    if (patient && patient.googleId && !patient.password) {
      return res.status(400).json({ error: 'This account uses Google Sign-In. Please login via Google.' });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing (security best practice)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    // Build reset URL (always point to patient frontend which handles all login)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1e293b; margin: 0 0 4px;">QureHealth.AI</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Password Reset Request</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Hi <strong>${user.name}</strong>,
        </p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to set a new one. This link expires in <strong>15 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #4F46E5; color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;">
            Reset Password
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
          If you didn't request this, you can safely ignore this email. Your password won't be changed.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">
          If the button doesn't work, copy and paste this link:<br/>
          <a href="${resetUrl}" style="color: #4F46E5; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'QureHealth.AI — Password Reset',
      html
    });

    res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset email. Please try again later.' });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Search both collections for matching token that hasn't expired
    const [patient, doctor] = await Promise.all([
      Patient.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
      }).select('+password'),
      Doctor.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
      }).select('+password')
    ]);

    const user = patient || doctor;

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token. Please request a new one.' });
    }

    // Set new password (the pre-save hook in the model will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
};