const mongoose = require('mongoose');

// Defining the Schema:
const RegistrationandRoll_Schema = new mongoose.Schema({
    studentID: {
        type: String,
        required: true,
        unique: true
      },
      Reg_No: {
        type: String,
        required: true,
        unique: true
      },
      Roll_No: {
        type: String,
        unique: true
      }
}, {
    collection: 'registration_and_roll',
    timestamps: true 
})

// Creating the model:
const Reg_and_Roll = mongoose.model('registration_and_roll', RegistrationandRoll_Schema);
module.exports = Reg_and_Roll;

