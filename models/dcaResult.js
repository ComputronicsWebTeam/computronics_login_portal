const mongoose = require('mongoose')

const dca_result_schema = mongoose.Schema({
    // a specification id for student:
    studentID: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true,
    },
    results: [
        {
            subject: {type: String, unique: true, required: true},
            theory: {type: Number, required: true},
            practical: {type: Number, required: true},
        }
    ]
});

const dcaResult = mongoose.model('dcaResult', dca_result_schema);
module.exports = dcaResult;