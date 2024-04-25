const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  // Basic Information
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    // required: true,
  },
  form_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    // required: true,
  },
  feedback_type: {
    type: String,
    enum: ["bug_report", "feature_request", "general_feedback"],
    required: true,
  },
  date_submitted: {
    type: Date,
    default: Date.now,
  },

  // Content and Rating
  title: {
    type: String,
    // required: true,
  },
  description: {
    type: String,
    // required: true,
  },
  questions: [
    {
      name: {
        type: String,
        // required: true,
      },
      type: {
        type: String,
        enum: ["start", "cercle"],
        // required: true,
      },
      rating: {
        type: Number,
        // required: true,
      },
    },
  ],

  // Additional Information
  attachments: [
    {
      type: String, // URL or path to attachment
    },
  ],
});

module.exports = mongoose.model("Feedback", feedbackSchema);
