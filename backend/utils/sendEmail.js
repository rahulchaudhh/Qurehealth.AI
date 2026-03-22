const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  console.log(`[Email] Attempting to send to: ${to}`);
  console.log(`[Email] Using User: ${process.env.EMAIL_USER}`);
  
  // Log masked password to verify it's loaded without leaking it
  const pass = process.env.EMAIL_PASS || '';
  const maskedPass = pass.length > 8 
    ? `${pass.substring(0, 4)}...${pass.substring(pass.length - 4)}` 
    : '****';
  console.log(`[Email] Using Pass: ${maskedPass} (Length: ${pass.length})`);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Qurehealth.AI" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Success! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`[Email] SMTP Error:`, error);
    throw error;
  }
};

module.exports = sendEmail;
