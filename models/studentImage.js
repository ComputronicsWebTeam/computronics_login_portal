const mongoose = require('mongoose');

const studentImage = new mongoose.Schema({
    studentId: String,
    image: {
        data: Buffer,
        contentType: String
    }
});

const StudentImage = mongoose.model('StudentImage', studentImage);

module.exports = StudentImage;
