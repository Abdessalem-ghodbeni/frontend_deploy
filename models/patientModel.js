const mongoose = require("mongoose");
const userModel = require("../models/userModel");

const patientSchema = new mongoose.Schema({
    sexe: {
        type: String,
        trim: true
    },
    dateNaissance: {
        type: Date
    }
}, {timestamps: true});

module.exports = userModel.discriminator("patients", patientSchema);