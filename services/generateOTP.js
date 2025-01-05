const otpStore = new Map(); // in-memory store for OTPs


function generateAndStoreOtp(userId) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    const expiresAt = Date.now() + 5 * 60 * 1000; // Set expiry time (5 minutes)

    // Store OTP in memory
    otpStore.set(userId, { otp, expiresAt })

    // Set a timeout to remove OTP after 5 minutes
    setTimeout(() => {
        otpStore.delete(userId); // Remove OTP after expiry
        console.log(`OTP for user ${userId} expired and removed.`)
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return otp
}

module.exports = {generateAndStoreOtp}