const { createHmac, randomBytes } = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const { createTokenforStudent } = require('../services/authentication');

const StudentSchema = new mongoose.Schema({
    studentID: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: [3, 'Name must be at least 3 characters long'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email address',
        },
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
}, { timestamps: true, collection: 'Students' });

// A pre function to Hash the password before storing in the Database:
StudentSchema.pre("save", function (next) {
    const Student = this;
    if (!Student.isModified('password')) return next(); // Skip if password is not modified

    const salt = randomBytes(16).toString('hex'); // Generate a salt
    const hashedPassword = createHmac('sha256', salt).update(Student.password).digest('hex');

    this.salt = salt;
    this.password = hashedPassword;
    next();
});

// A static method to check password and create token
StudentSchema.static('checkPasswordandCreateToken', async function (studentID, password) {
    const Student = await this.findOne({ studentID });
    
    if (!Student) {
        throw new Error('Student not found');
    }

    const salt = Student.salt;
    const hashedPassword = Student.password;
    const userPasswordHash = createHmac('sha256', salt).update(password).digest('hex'); // Convert user-given password to hash

    if (hashedPassword !== userPasswordHash) {
        throw new Error('Incorrect password');
    }

    const token = createTokenforStudent(Student);
    return { token, name: Student.name };
});

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;
