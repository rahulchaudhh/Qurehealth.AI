const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

module.exports = async (req, res, next) => {
  console.log('--- Auth Middleware ---');
  console.log('Session ID:', req.sessionID);
  console.log('Session User:', req.session ? req.session.user : 'No Session');
  console.log('Cookies:', req.headers.cookie);

  if (req.session && req.session.user) {
    req.user = req.session.user;
    next();
  } else {
    return res.status(401).json({ error: 'Not authorized, no session' });
  }
};