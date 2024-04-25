const mongoose = require("mongoose");
const ProjetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "internautes",
      required: true,
    },
    name: {
      type: String,
      required: [true, "le nom du projet est obligatoire"],
    },
    lieu: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "la description est obligatoire"],
    },
    sujet: {
      type: String,
      required: [true, "le sujet est obligatoire"],
    },
    objectif: {
      type: String,
      required: [true, "l'objectif' est obligatoire"],
    },
    domaine: {
      type: String,
      required: [true, "le domaine est obligatoire"],
    },
    startDate: {
      type: Date,
      required: [true, "la date de debut est obligatoire "],
    },
    endDate: {
      type: Date,
      required: [true, "la date de fin est obligatoire "],
    },

    organisation: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
      },
    ],
    membresCollaborateur: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],

    forms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Forms",
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Project", ProjetSchema);
