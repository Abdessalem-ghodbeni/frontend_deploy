const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String ,required: true},
    description: { type: String },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    contact: {
      email: { type: String },
      phone: { type: String },
      address: { type: String },
    },
    website:  String ,
  },
);

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;
