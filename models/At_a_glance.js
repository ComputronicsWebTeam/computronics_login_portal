const mongoose = require('mongoose');

// Define the schema
const At_A_Glance_Schema = new mongoose.Schema({
  studentID: {
    type: String,
    required: true,
    unique: true
  },
  items: [
    {
      Course: { type: String, required: true },
      Marks: { type: Number, required: true }
    }
  ]
}, {
  collection: 'At_a_glance', // Specify the collection name
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create the model
const At_a_glance = mongoose.model('At_a_glance', At_A_Glance_Schema);

module.exports =  At_a_glance 
