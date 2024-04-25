const commentaireModel = require("../models/commentaireModel");
const publicationModel = require("../models/publicationModel");
const internauteModel = require("../models/internauteModel");
const Joi = require('joi');

module.exports = {
    create: async (req, res) => {
        try {
            const { idPublication } = req.params;

            const { idInternaute } = req.params;

            const schemaVal = Joi.object({
                contenu: Joi.string().min(1).required()
            });

            const { error, value } = schemaVal.validate(req.body);

            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const publication = await publicationModel.findById(idPublication);

            const internaute = await internauteModel.findById(idInternaute);

            const commentaire = new commentaireModel({
                contenu: value.contenu,
                publication: publication._id,
                internaute: internaute._id,
            });

            const savedCommentaire = await commentaire.save();

            await publicationModel.findByIdAndUpdate(publication._id, {
                $push: { commentaires: savedCommentaire._id }
            });

            await internauteModel.findByIdAndUpdate(internaute._id, {
                $push: { commentaires: savedCommentaire._id }
            });

            res.status(201).json({ success: true, message: "Commentaire created successfully", data: savedCommentaire });

        } catch (error) {
            res.status(500).json({ success: false, message: "Server error: " + error, data: null });
        }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { contenu } = req.body;
    
            // Validation using Joi
            const schemaVal = Joi.object({
                contenu: Joi.string().min(1).required()
            });
    
            const { error } = schemaVal.validate({ contenu });
    
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
    
            const updatedCommentaire = await commentaireModel.findByIdAndUpdate(id, { contenu }, { new: true });
    
            res.status(200).json({ success: true, message: "Commentaire updated successfully", data: updatedCommentaire });
        } catch (error) {
            res.status(500).json({ success: false, message: "Server error: " + error, data: null });
        }
    },    
    getByIdPublication: async (req, res) => {
        try {
          const { idPublication } = req.params;
    
          const commentaires = await commentaireModel.find({ publication: idPublication }).populate(['internaute', 'publication']);
    
          res.status(200).json({ success: true, message: "Success", data: commentaires });
        } catch (error) {
          res.status(400).json({ success: false, message: "Error: " + error, data: null });
        }
    },
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const commentaire = await commentaireModel.findByIdAndDelete(id);

            await publicationModel.findByIdAndUpdate(commentaire.publication, {
                $pull: { commentaires: commentaire._id }
            });

            await internauteModel.findByIdAndUpdate(commentaire.internaute, {
                $pull: { commentaires: commentaire._id }
            });

            res.status(200).json({ success: true, message: "Commentaire deleted successfully", data: null });
        } catch (error) {
            res.status(400).json({ success: false, message: "Error: " + error, data: null });
        }
    },
};