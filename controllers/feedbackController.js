// feedbackController.js

const Feedback = require("../models/feedback");

// Service for feedback-related operations

const feedbackService = {
  getAllFeedback: async () => {
    try {
      return await Feedback.find();
    } catch (err) {
      throw new Error(err.message);
    }
  },

  getFeedbackById: async (id) => {
    try {
      return await Feedback.findById(id);
    } catch (err) {
      throw new Error(err.message);
    }
  },

  createFeedback: async (feedbackData) => {
    try {
      const feedback = new Feedback(feedbackData);
      return await feedback.save();
    } catch (err) {
      throw new Error(err.message);
    }
  },

  updateFeedback: async (id, feedbackData) => {
    try {
      return await Feedback.findByIdAndUpdate(id, feedbackData, { new: true });
    } catch (err) {
      throw new Error(err.message);
    }
  },

  deleteFeedback: async (id) => {
    try {
      return await Feedback.findByIdAndDelete(id);
    } catch (err) {
      throw new Error(err.message);
    }
  },
};

// Controller for handling feedback-related operations

const feedbackController = {
  getAllFeedback: async (req, res) => {
    try {
      const feedback = await feedbackService.getAllFeedback();
      res.json(feedback);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getFeedbackById: async (req, res) => {
    try {
      const feedback = await feedbackService.getFeedbackById(req.params.id);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      res.json(feedback);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createFeedback: async (req, res) => {
    try {
      const feedback = await feedbackService.createFeedback(req.body);
      res.status(201).json(feedback);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  updateFeedback: async (req, res) => {
    try {
      const feedback = await feedbackService.updateFeedback(
        req.params.id,
        req.body
      );
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      res.json(feedback);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  deleteFeedback: async (req, res) => {
    try {
      const feedback = await feedbackService.deleteFeedback(req.params.id);
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      res.json({ message: "Feedback deleted successfully" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};

module.exports = feedbackController;
