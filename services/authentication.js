const JWT = require('jsonwebtoken')
const secret = process.env.JWT_Secret_key


// token creation for Admin
function createTokenforAdmin(Admin) {
    const payload = {
        _id: Admin._id,
        email: Admin.email,
        name: Admin.name,
        role: 'Admin',
    }
    const options = {
        expiresIn: '30m' // Token will expire in 30m hour.
    };
    const token = JWT.sign(payload, secret, options)
    return token
}


// Token creation for Student:
function createTokenforStudent(Student) {
    const payload = {
        id: Student.studentID,
        email: Student.email,
        name: Student.name,
        role: 'Student',
    }
    const options = {
        expiresIn: '30m' // Token will expire in 30m hour.
    };
    const token = JWT.sign(payload, secret, options)
    return token
}

// token validation function:
function validateToken(token) {
    const payload = JWT.verify(token, secret)
    return payload
}

module.exports = {createTokenforAdmin,createTokenforStudent, validateToken}

