const mongoose = require("mongoose");
const userModel = require("../models/userModel");

const superAdminSchema = new mongoose.Schema({
    
}, {timestamps: true});

module.exports = userModel.discriminator("superAdmin", superAdminSchema);