const mongoose = require('mongoose');

const dcaResultSchema = new mongoose.Schema(
    {
        studentID: { type: String, required: true, unique: true },
        dca1a: {type: Number},
        dca1b: {type: Number},
        dca2a: {type: Number},
        dca2b: {type: Number},
        dca2c: {type: Number},
        dca3a: {type: Number},
        dca3b: {type: Number},
        dca3c: {type: Number},
        dcal1a: {type: Number},
        dcal1b: {type: Number},
        dcal2a: {type: Number},
        dcal2b: {type: Number},
        dcal2c: {type: Number},
        dcal3a: {type: Number},
        projectp1: {type: Number},
        dcal4a: {type: Number},
        projectp2: {type: Number},
    },
    { timestamps: true } // This ensures createdAt and updatedAt are automatically added
);

const DCAresult = mongoose.model('DCAresult', dcaResultSchema);

module.exports = DCAresult;
