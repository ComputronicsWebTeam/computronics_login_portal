const mongoose = require('mongoose');

// Define the schema
const Activities_schema = new mongoose.Schema({
  studentID: {
    type: String,
    required: true,
    unique: true
  },
// for scholership
  scholership: [
    {
      desc: { type: String,}
    }
  ],
//  for award recived
  award_recived: [
    {
      desc: { type: String,}
    }
  ],
//  position secured
  position_secured: [
    {
      desc: { type: String,}
    }
  ],
//  PSDP
  psdp: [
    {
      desc: { type: String,}
    }
  ],
//  Seminar and Workshop
  seminar_workshop: [
    {
      desc: { type: String,}
    }
  ],
//  Training
  training: [
    {
      desc: { type: String,}
    }
  ],
//  Others
  others: [
    {
      desc: { type: String,}
    }
  ],

}, {
  collection: 'Activities', // Specify the collection name
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create the model
const Activities = mongoose.model('Activities', Activities_schema);

module.exports =  Activities 
