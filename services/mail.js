const nodemailer = require('nodemailer');

// Function to send an email
async function sendMail(email, subject, message) {
    try {
        // Configure the transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Use environment variables
                pass: process.env.EMAIL_PASS // Gmail app password in env
            }
        });

        // Define mail options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: message
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true; // Indicate success
    } catch (error) {
        console.error('Error sending email:', error);
        return false; // Indicate failure
    }
}

module.exports = { sendMail };
