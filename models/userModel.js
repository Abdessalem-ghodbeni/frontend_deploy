const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    prenom: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    telephone: {
      type: String,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    updateProfile: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    codeVerification: {
      type: String,
      trim: true,
    },
    resetToken: {
      type: String,
    },
    Participations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    twoFactorSecret: {
      type: String,
      default: "",
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorQrCode: {
      type: String,
      default: "",
    },
    ResponsesListe: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Response",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
