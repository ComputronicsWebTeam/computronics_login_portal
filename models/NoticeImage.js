const mongoose = require('mongoose');

const noticeImageSchema = new mongoose.Schema({
    noticeHeading: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        data: Buffer,
        contentType: String
    }
}, {
    timestamps: true
});

const NoticeImage = mongoose.model('NoticeImage', noticeImageSchema);

module.exports = NoticeImage;
