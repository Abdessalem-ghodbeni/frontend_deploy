const mongoose = require("mongoose");
const historyModel = require("../models/historyModel");

const commentaireSchema = new mongoose.Schema(
  {
    contenu: {
      type: String,
      required: true,
      trim: true,
    },
    internaute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "internautes",
    },
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "publications",
    },
  },
  { timestamps: true }
);

// Middleware to Log After Creating a Document
commentaireSchema.post("save", async function (doc, next) {
  try {
    const result = await historyModel.create({
      actionType: "Create",
      details: `Created new commentaire: ${doc.contenu}`,
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
commentaireSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    const doc = await this.model.findOne(this.getQuery()).exec();

    // Determine the updated value for `contenu`
    const updatedContenu = update.$set && update.$set.contenu ? update.$set.contenu : update.contenu;

    if (doc && updatedContenu) {
        try {
            await historyModel.create({
                actionType: "Update",
                details: `Updated commentaire from: ${doc.contenu} to: ${updatedContenu}`,
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
commentaireSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getQuery()).exec();
  if (doc) {
    try {
      await historyModel.create({
        actionType: "Delete",
        details: `Deleted commentaire: ${doc.contenu}`,
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

module.exports = mongoose.model("commentaires", commentaireSchema);
