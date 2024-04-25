// import mongoose from "mongoose";
const mongoose = require("mongoose");
const formsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "internautes",
      required: true,
    },
    title: {
      type: String,
      required: [true, "le titre est obligatoire"],
    },
    description: {
      type: String,
      required: [true, "description est obligatoire"],
    },
    link: {
      type: String,
      unique: true,
    },

    style: {
      backgroundColor: {
        type: String,
        default: "#FFFFFF",
      },
      textColor: {
        type: String,
        default: "#000000",
      },
      fontFamily: {
        type: String,
        default: "Arial",
      },
      fontSize: {
        type: Number,
        default: 14,
      },
    },

    formFields: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FormFildes",
      },
    ],
    responses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Response",
      },
    ],
    Project: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },

  {
    timestamps: true,
  }
);
formsSchema.methods.addResponse = function (responseId) {
  if (!this.responses.includes(responseId)) {
    this.responses.push(responseId);
  }
};

module.exports = mongoose.model("Forms", formsSchema);
