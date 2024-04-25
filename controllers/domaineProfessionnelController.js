const domaineProfessionnelModel = require("../models/domaineProfessionnelModel");
const Joi = require("joi");

module.exports = {
    create: async (req, res) => {
        try {
            const schemaVal = Joi.object({
                domaine: Joi.string().min(6).required()
            });

            const { error, value } = schemaVal.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const domaineProfessionnel = new domaineProfessionnelModel(req.body);
            const savedDomaineProfessionnel = await domaineProfessionnel.save();

            res.status(201).json({
                success: true, message: "success", data: savedDomaineProfessionnel });
        } catch (error) {
            res.status(400).json({ success: false, message: "error" + error, data: null });

        }
    },
    read: async (req, res) => {
        try {
            const domaineProfessionnels = await domaineProfessionnelModel.find();
            res.status(200).send({success: true, message: "Tous les domaines professionnels", data: domaineProfessionnels});
        } catch (error) {
            res.status(400).json({success: false, message: "Erreur: "+error, data: null});
        }
    },
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const domaineProfessionnel = await domaineProfessionnelModel.findByIdAndDelete(id);

            if(!domaineProfessionnel){
                return res.status(404).send("Domaine professionnel non trouvé");
            }

            res.status(200).send({success: true, message: "Domaine professionnel supprimé avec succès", data: domaineProfessionnel});
        } catch (error) {
            res.status(400).json({success: false, message: "Erreur: "+error, data: null});
        }
    }
};