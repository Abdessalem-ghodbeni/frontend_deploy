const mongoose = require('mongoose');
const historyModel = require("../models/historyModel");

const domaineProfessionnelSchema = new mongoose.Schema({
  domaine: {
    type: String,
    required: true,
    unique: true,
  }
}, { timestamps: true });

// Middleware to log before deleting a document using findOneAndDelete
domaineProfessionnelSchema.pre('findOneAndDelete', async function(next) {
  const doc = await this.model.findOne(this.getQuery()).exec();
  if (doc) {
    try {
      await historyModel.create({
        actionType: 'Delete',
        details: `Deleted domaine professionnel: ${doc.domaine}`,
        user: process.env.SUPERADMIN_ID
      });
      next();
    } catch (error) {
      console.error('Failed to create history record:', error);
      next(error);
    }
  } else {
    next();
  }
});

// Middleware to log after saving a document
domaineProfessionnelSchema.post('save', async function(doc, next) {
  try {
    const result = await historyModel.create({
      actionType: 'Create',
      details: `Created new domaine professionnel: ${doc.domaine}`,
      user: process.env.SUPERADMIN_ID
    });
    console.log('History entry created:', result);
    next();
  } catch (error) {
    console.error('Error in creating history:', error);
    next(error);
  }
});

module.exports = mongoose.model('DomaineProfessionnel', domaineProfessionnelSchema);