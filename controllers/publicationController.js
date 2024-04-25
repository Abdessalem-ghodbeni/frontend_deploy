const publicationModel = require("../models/publicationModel");
const internauteModel = require("../models/internauteModel");
const Joi = require('joi');

module.exports = {
    create: async (req, res) => {
        try {
            const { idInternaute } = req.params;

            const schemaVal = Joi.object({
                titre: Joi.string().min(3).required(),
                contenu: Joi.string().min(8).required()
            });

            const { error, value } = schemaVal.validate(req.body);

            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const internaute = await internauteModel.findById(idInternaute);

            const publication = new publicationModel({
                titre: value.titre,
                contenu: value.contenu,
                internaute: internaute._id,
            });

            const savedPublication = await publication.save();

            await internauteModel.findByIdAndUpdate(internaute._id, {
                $push: { publications: savedPublication._id }
            });

            res.status(201).json({ success: true, message: "Publication created successfully", data: savedPublication });

        } catch (error) {
            res.status(500).json({ success: false, message: "Server error: " + error, data: null });
        }
    },
    read: async (req, res) => {
        try {
            const publication = await publicationModel.find().populate(['internaute', 'commentaires']);

            res.status(200).json({ success: true, message: "Success", data: publication });
        } catch (error) {
            res.status(400).json({ success: false, message: "Error: " + error, data: null });
        }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;

            const schemaVal = Joi.object({
                titre: Joi.string().min(3).required(),
                contenu: Joi.string().min(8).required()
            });

            const { error, value } = schemaVal.validate(req.body);

            if(error){
                return res.status(400).json({error:error.details[0].message})
            };

            const publication = await publicationModel.findByIdAndUpdate(id, req.body, { new: true });

            res.status(200).json({ success: true, message: "Publication updated successfully", data: publication });
        } catch (error) {
            res.status(400).json({ success: false, message: "Error: " + error, data: null });
        }
    },
    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const publication = await publicationModel.findById(id).populate(['internaute', 'commentaires']);

            res.status(200).json({ success: true, message: "Success", data: publication });
        } catch (error) {
            res.status(400).json({ success: false, message: "Error: " + error, data: null });
        }
    },
    getByIdInternaute: async (req, res) => {
        try {
          const { idInternaute } = req.params;
    
          const publications = await publicationModel.find({ internaute: idInternaute }).populate(['internaute', 'commentaires']);
    
          res.status(200).json({ success: true, message: "Success", data: publications });
        } catch (error) {
          res.status(400).json({ success: false, message: "Error: " + error, data: null });
        }
    },
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const publication = await publicationModel.findByIdAndDelete(id);

            await internauteModel.findByIdAndUpdate(publication.internaute, {
                $pull: { publications: publication._id }
            });

            res.status(200).json({ success: true, message: "Publication deleted successfully", data: null });
        } catch (error) {
            res.status(400).json({ success: false, message: "Error: " + error, data: null });
        }
    },
    
};
