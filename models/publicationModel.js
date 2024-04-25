const mongoose = require('mongoose');
const historyModel = require("../models/historyModel");

const publicationSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true,
        trim: true,
    },
    contenu: {
        type: String,
        required: true,
        trim: true,
    },
    internaute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'internautes',
    },
    commentaires: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'commentaires',
        },
    ]
}, {timestamps: true});

// Middleware to Log After Creating a Document
publicationSchema.post("save", async function (doc, next) {
    try {
      const result = await historyModel.create({
        actionType: "Create",
        details: `Created new publication: ${doc.titre} - ${doc.contenu}`,
        user: doc.internaute,
      });
      console.log("Create history entry:", result);
      next();
    } catch (error) {
      console.error("Error logging create history:", error);
      next(error);
    }
  });
  
  // Middleware to Log After Updating a Document
  publicationSchema.pre("findOneAndUpdate", async function (next) {
      const update = this.getUpdate();
      const doc = await this.model.findOne(this.getQuery()).exec();
      
      const updatedTitre = update.$set && update.$set.titre ? update.$set.titre : update.titre;
      const updatedContenu = update.$set && update.$set.contenu ? update.$set.contenu : update.contenu;
  
      if (doc && (updatedTitre || updatedContenu)) {
          try {
              await historyModel.create({
                  actionType: "Update",
                  details: `Updated publication from: ${doc.titre} - ${doc.contenu} to: ${updatedTitre || doc.titre} - ${updatedContenu || doc.contenu}`,
                  user: doc.internaute,
              });
              next();
          } catch (error) {
              console.error("Error logging update history:", error);
              next(error);
          }
      } else {
          console.error(`Failed to find updated value or original document. Update operation: ${JSON.stringify(update)}`);
          next();
      }
  });
  
  // Middleware to log before deleting a document using findOneAndDelete
  publicationSchema.pre("findOneAndDelete", async function (next) {
    const doc = await this.model.findOne(this.getQuery()).exec();
    if (doc) {
      try {
        await historyModel.create({
          actionType: "Delete",
          details: `Deleted publication: ${doc.titre} - ${doc.contenu}`,
          user: doc.internaute,
        });
        next();
      } catch (error) {
        console.error("Failed to create history record:", error);
        next(error);
      }
    } else {
      next();
    }
  });

module.exports = mongoose.model('publications', publicationSchema);
