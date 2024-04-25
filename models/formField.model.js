// import mongoose from "mongoose";
const mongoose = require("mongoose");
const formFieldSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Forms",
    },
    label: {
      type: String,
      required: [true, "Le libellé est obligatoire"],
    },
    fieldType: {
      type: String,
      required: [true, "Le type de champ est obligatoire"],
    },
    defaultValue: {
      type: String,
      default: "",
    },
    validations: {
      required: {
        type: Boolean,
        default: false,
      },
      minLength: {
        type: Number,
        default: null,
      },
      maxLength: {
        type: Number,
        default: null,
      },
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
      fontSize: {
        type: Number,
        default: 14,
      },
      textAlign: {
        type: String,
        default: "left",
      },
    },
    placeholder: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },

    ///pour les options genre type select ou bien radio box
    options: [
      {
        label: {
          type: String,
          required: true,
        },
        value: {
          type: mongoose.Schema.Types.Mixed, // car les options des radios ou bien checkbox ynjmou ykunou des images ....mixed bech ngolou e9bel kolch ya bro
          required: true,
        },
        image: {
          type: String, // Stocke l URL  d acces lil image
        },
      },
    ],
    icon: {
      type: String,
      default: "",
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    dependencies: [
      {
        fieldId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FormField",
        },
        condition: {
          type: String,
        },
        value: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);
// const FormField = mongoose.model("FormFildes", formFieldSchema);
// export default FormField;
module.exports = mongoose.model("FormFildes", formFieldSchema);
