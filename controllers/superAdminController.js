const { uploadFile } = require("../middleware/uploadCloudinary");
const superAdminModel = require("../models/superAdminModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Joi = require("joi");
const fs = require("fs");

module.exports = {
  update: async (req, res) => {
    try {
      const { id } = req.params;

      const schemaVal = Joi.object({
        nom: Joi.string().required(),
        prenom: Joi.string().required(),
        telephone: Joi.string(),
        email: Joi.string().email().required(),
      });

      const { error, value } = schemaVal.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { ...updateData } = req.body;

      if (req.file) {
        // Utilisez le chemin du fichier temporaire pour l'upload
        const result = await uploadFile(req.file.path); // path contient le chemin du fichier temporaire
        updateData.image = result.secure_url;

        // Supprimez le fichier temporaire
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(
              "Erreur lors de la suppression du fichier temporaire:",
              err
            );
          } else {
            console.log("Fichier temporaire supprimé avec succès.");
          }
        });
      }

      const superAdmin = await superAdminModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!superAdmin) {
        return res.status(404).json({
          success: false,
          message: "SuperAdmin not found",
          data: null,
        });
      }

      res.status(200).json({
        success: true,
        message: "SuperAdmin updated successfully",
        data: { data: superAdmin },
      });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
  updatePassword: async (req, res) => {
    try {
      const { id } = req.params;

      const schemaVal = Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string()
          .min(6)
          .max(30)
          .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
          .required(),
      });
      const { error, value } = schemaVal.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { oldPassword, newPassword } = value;

      // Récupérer le mot de passe actuel de l'utilisateur
      const superAdmin = await superAdminModel.findById(id);
      if (!superAdmin) {
        return res.status(404).json({ message: "SuperAdmin not found" });
      }

      // Comparer l'ancien mot de passe avec celui dans la base de données
      const isMatch = await bcrypt.compare(oldPassword, superAdmin.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      // Hacher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Mettre à jour le document du superAdmin avec le nouveau mot de passe haché
      const updatedSuperAdmin = await superAdminModel.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );

      // Répondre avec succès
      res
        .status(200)
        .json({ message: "SuperAdmin password updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating password", error: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const superAdmin = await superAdminModel.findById(id);

      if (!superAdmin) {
        return res.status(404).json({
          success: false,
          message: "SuperAdmin not found",
          data: null,
        });
      }

      res
        .status(200)
        .json({ success: true, message: "Success", data: superAdmin });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
};
