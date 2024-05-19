// Import required modules
const nodemailer = require("nodemailer");
require("dotenv").config();
require("dotenv").config({path:'../.env'});

// Create a transporter object using the SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com", // SMTP outlook server
  port: 587, // SMTP port (e.g., 587 for TLS or 465 for SSL)
  secure: false, // True for 465, false for STARTTLS
  auth: {
    user: process.env.EMAIL, // Email address or username
    pass: process.env.EMAIL_PASSWORD, // Your email account password or app-specific password
  },
});

// Function to send an email
// Returns a promise
const sendMail = (to, subject, text, html) => {
  // Email message options
  const mailOptions = {
    from: process.env.EMAIL, // Sender address
    to: to, // List of recipients
    subject: subject, // Subject line
    text: text || "", // Plain text body
    html: html || "", // HTML body
  };
  // Send the email using the transporter and return the result
  return transporter.sendMail(mailOptions);
};

// Async Function to send OTP email
const sendOTPMail = async (to, otp) => {
  await sendMail(
    to,
    `Your One-Time Password (OTP) for Account Verification`,
    ``,
    `<p>Hello,<br>Your OTP for verification is: <strong>${otp}</strong>.</p>`
  );
};




const sendPasswordChangeConfirmationEmail = async(email, username)=> { 
  const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Password Change Confirmation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 5px;
      }
      .header {
        text-align: center;
        padding: 10px 0;
        border-bottom: 1px solid #e0e0e0;
      }
      .header img {
        width: 50px;
      }
      .content {
        padding: 20px;
      }
      .content h1 {
        color: #333333;
        font-size: 24px;
        margin-bottom: 20px;
      }
      .content p {
        color: #666666;
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 20px;
      }
      .footer {
        text-align: center;
        padding: 10px 0;
        border-top: 1px solid #e0e0e0;
        color: #999999;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">    
      <div class="content">
        <h1>Password Change Confirmation</h1>
        <p>Dear ${username},</p>
        <p>We wanted to let you know that your password has been changed successfully. If you did not make this change or if you believe an unauthorized person has accessed your account, please reset your password immediately and contact our support team.</p>
        <p>If you have any questions or need further assistance, please do not hesitate to contact us.</p>
        <p>Thank you for using our service!</p>
        <p>Best regards,<br>Bikya</p>
      </div>
      <div class="footer">
        &copy; 2024 Bikya. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `
  await sendMail(email,'Password Change Confirmation', '', html)
}

// Export the function to be used in other modules
module.exports = {
  sendOTPMail,
  sendPasswordChangeConfirmationEmail
};


