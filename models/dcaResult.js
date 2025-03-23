const mongoose = require('mongoose');

const dcaResultSchema = new mongoose.Schema(
    {
        studentID: { type: String, required: true, unique: true },
        dca1a: Number,
        dca1b: Number,
        dca2a: Number,
        dca2b: Number,
        dca2c: Number,
        dca3a: Number,
        dca3b: Number,
        dca3c: Number,
        dcal1a: Number,
        dcal1b: Number,
        dcal2a: Number,
        dcal2b: Number,
        dcal2c: Number,
        dcal3a: Number,
        projectp1: Number,
        dcal4a: Number,
        projectp2: Number,
    },
    { timestamps: true } // This ensures createdAt and updatedAt are automatically added
);

const dcaResult = mongoose.model('dcaResult', dcaResultSchema);

module.exports = dcaResult;
