const mongoose = require('mongoose');

// Define the schema
const Student_info_Schema = new mongoose.Schema({
  studentID: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] // Email format validation
  },
  fatherName: {
    type: String,
    required: true,
    trim: true
  },
  dob: {
    type: Date,
    required: true,
  },
  doa: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Contact number must be 10 digits'] // Validate 10-digit phone number
  },
  schoolOrCollege: {  
    type: String,
    required: true,
  }
}, {
  collection: 'student_info', // Specify the collection name
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create the model
const student_info = mongoose.model('student_info', Student_info_Schema);

module.exports =  student_info 
