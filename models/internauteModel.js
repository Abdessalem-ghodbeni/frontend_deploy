const mongoose = require("mongoose");
const userModel = require("../models/userModel");

const internauteSchema = new mongoose.Schema(
  {
    specialite: {
      type: String,
      required: true,
      trim: true,
    },
    licenceProfessionnelle: {
      type: String,
      trim: true,
    },
    formulairesCreated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Forms",
      },
    ],
    ProjectCreated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    publications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "publications",
      },
    ],
    commentaires: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "commentaires",
      },
    ],
  },
  { timestamps: true }
);

module.exports = userModel.discriminator("internautes", internauteSchema);
