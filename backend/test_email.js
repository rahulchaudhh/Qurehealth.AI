require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Error:', error.message);
  } else {
    console.log('✅ SMTP connection verified! Sending test email...');
    transporter.sendMail({
      from: `"QureHealth.AI" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ QureHealth Email Test',
      html: '<h2>Email is working!</h2><p>Gmail SMTP is configured correctly.</p>'
    }, (err, info) => {
      if (err) console.error('❌ Send failed:', err.message);
      else console.log('✅ Test email sent! Message ID:', info.messageId);
    });
  }
});
