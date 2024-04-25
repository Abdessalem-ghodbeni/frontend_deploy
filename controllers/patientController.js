const { uploadFile } = require("../middleware/uploadCloudinary");
const patientModel = require("../models/patientModel");
const historyModel = require("../models/historyModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Joi = require("joi");
const fs = require("fs");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

var transport = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

module.exports = {
  create: async (req, res) => {
    try {
      const schemaVal = Joi.object({
        nom: Joi.string().required(),
        prenom: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string()
          .min(6)
          .max(30)
          .regex(/[a-zA-Z0-9]{6,30}/)
          .required(),
      });

      const { error, value } = schemaVal.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Vérification de l'unicité de l'email
      const emailExists = await patientModel.findOne({ email: req.body.email });
      if (emailExists) {
        return res
          .status(409)
          .json({ message: "This email is already in use." });
      }

      // Génération du secret 2FA
      const secret = speakeasy.generateSecret({ length: 20 });

      const plainPassword = req.body.password;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      QRCode.toDataURL(secret.otpauth_url, async (err, data_url) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Erreur lors de la génération du QR Code" });
        }

        const patient = new patientModel({
          ...req.body,
          image:
            "https://res.cloudinary.com/dvofvctg3/image/upload/v1709681139/nqqimfl2bsrryj2taid6.png",
          password: hashedPassword,
          codeVerification: crypto.randomBytes(20).toString("hex"),
          confirmed: true,
          twoFactorSecret: secret.base32,
          twoFactorQrCode: data_url,
        });

        const item = await patient.save();

        transport.sendMail({
          from: '"MediColGes" <<superadmin@medicolges.com>>',
          to: item.email,
          subject: "Welcome to MediColGes: Verification of registration",
          html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            <style>
                html, body {
                    height: 100%;
                }
                body {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                }
            </style>
        </head>
        <body>

            <div class="card text-center shadow-lg p-3 mb-5 bg-body rounded" style="width: 30rem;">
                <img class="card-img-top mx-auto d-block" src="https://res.cloudinary.com/dvofvctg3/image/upload/v1711821509/nj5tztlezkwzrfpgwlgr.png" style="width: 6rem; height: 5rem;" alt="Card image cap">
                <div class="card-body">
                    <h5 class="card-title">Welcome <strong>${item.nom} ${item.prenom}</strong> to MediColGes!</h5>
                    <br>
                    <p class="card-text">Thank you for registering on MediColGes. Please click the link below to verify your email address :</p>
                    <br>
                    <a href='http://localhost:3000/authentification/verify/${item.codeVerification}' class="btn btn-primary">Check my email address</a>
                </div>
                <div class="card-footer">
                    <p class="card-text">If you have not requested this registration, please ignore this email.</p>
                </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>

        </body>
        </html>
        `,
        });

        // Log the creation in the history model
        await historyModel.create({
          actionType: "Create",
          details: `New patient created: ${item.email}`,
          user: item._id,
        });

        res.status(201).json({ success: true, message: "success", data: item });
      });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "error" + error, data: null });
    }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params;

      const schemaVal = Joi.object({
        nom: Joi.string().required(),
        prenom: Joi.string().required(),
        telephone: Joi.string(),
        email: Joi.string().email().required(),
        sexe: Joi.string(),
        dateNaissance: Joi.string(),
      });

      const { error, value } = schemaVal.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const updateData = { ...req.body, updateProfile: true };

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

      const patient = await patientModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!patient) {
        return res
          .status(404)
          .json({ success: false, message: "Patient not found", data: null });
      }

      res.status(200).json({
        success: true,
        message: "Patient updated successfully",
        data: { data: patient },
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
      const patient = await patientModel.findById(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Comparer l'ancien mot de passe avec celui dans la base de données
      const isMatch = await bcrypt.compare(oldPassword, patient.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      // Hacher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Mettre à jour le document du patient avec le nouveau mot de passe haché
      const updatedPatient = await patientModel.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );

      // Répondre avec succès
      res
        .status(200)
        .json({ message: "Patient password updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating password", error: error.message });
    }
  },
  read: async (req, res) => {
    try {
      const patients = await patientModel.find();
      res
        .status(200)
        .json({ success: true, message: "Success", data: patients });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const patient = await patientModel.findByIdAndDelete(id);

      if (!patient) {
        return res
          .status(404)
          .json({ success: false, message: "Patient not found", data: null });
      }

      res.status(200).json({
        success: true,
        message: "Patient deleted successfully",
        data: null,
      });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const patient = await patientModel.findById(id);

      if (!patient) {
        return res
          .status(404)
          .json({ success: false, message: "Patient not found", data: null });
      }

      res
        .status(200)
        .json({ success: true, message: "Success", data: patient });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
  unblockedUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedPatient = await patientModel.findByIdAndUpdate(
        id,
        { $set: { blocked: false } },
        { new: true }
      );

      if (!updatedPatient) {
        return res
          .status(404)
          .json({ success: false, message: "Patient not found", data: null });
      }

      transport.sendMail({
        from: '"MediColGes" <<superadmin@medicolges.com>>',
        to: updatedPatient.email,
        subject: "Your account has been unblocked",
        html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            <style>
                html, body {
                    height: 100%;
                }
                body {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                }
            </style>
        </head>
        <body>

            <div class="card text-center shadow-lg p-3 mb-5 bg-body rounded" style="width: 30rem;">
                <img class="card-img-top mx-auto d-block" src="https://res.cloudinary.com/dvofvctg3/image/upload/v1711821509/nj5tztlezkwzrfpgwlgr.png" style="width: 6rem; height: 5rem;" alt="Card image cap">
                <div class="card-body">
                    <h5 class="card-title">Hello <strong>${updatedPatient.nom} ${updatedPatient.prenom}</strong>,</h5>
                    <br>
                    <p class="card-text">We are pleased to inform you that your account on MediColGes has been <strong>unblocked</strong>.</p>
                    <p class="card-text">You can now access all the features of the platform.</p>
                    <br>
                    <a href="http://localhost:5173/login" class="btn btn-primary">To login</a>
                </div>
                <div class="card-footer">
                    <p class="card-text">If you have difficulty logging in, please do not hesitate to contact our support.</p>
                </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>

        </body>
        </html>
        `,
      });

      // Log the unblocking in the history model
      await historyModel.create({
        actionType: "Update",
        details: `Patient unblocked: ${updatedPatient.email}`,
        user: process.env.SUPERADMIN_ID,
      });

      res.status(200).json({
        success: true,
        message: "Patient confirmed successfully",
        data: updatedPatient,
      });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },

  blockedUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedPatient = await patientModel.findByIdAndUpdate(
        id,
        { $set: { blocked: true } },
        { new: true }
      );

      if (!updatedPatient) {
        return res
          .status(404)
          .json({ success: false, message: "Patient not found", data: null });
      }

      transport.sendMail({
        from: '"MediColGes" <<superadmin@medicolges.com>>',
        to: updatedPatient.email,
        subject: "Your account has been blocked",
        html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            <style>
                html, body {
                    height: 100%;
                }
                body {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                }
            </style>
        </head>
        <body>

            <div class="card text-center shadow-lg p-3 mb-5 bg-body rounded" style="width: 30rem;">
                <img class="card-img-top mx-auto d-block" src="https://res.cloudinary.com/dvofvctg3/image/upload/v1711821509/nj5tztlezkwzrfpgwlgr.png" style="width: 6rem; height: 5rem;" alt="Card image cap">
                <div class="card-body">
                    <h5 class="card-title">Hello <strong>${updatedPatient.nom} ${updatedPatient.prenom}</strong>,</h5>
                    <br>
                    <p class="card-text">We are sorry to inform you that your account on MediColGes has been temporarily <strong>blocked</strong> for security or compliance reasons.</p>
                    <p class="card-text">For more information on why this is stuck and what steps to take to resolve it, please contact our support team.</p>
                </div>
                <div class="card-footer">
                    <p class="card-text">We thank you for your understanding.</p>
                </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>

        </body>
        </html>
        `,
      });

      // Log the blocking in the history model
      await historyModel.create({
        actionType: "Update",
        details: `Patient blocked: ${updatedPatient.email}`,
        user: process.env.SUPERADMIN_ID,
      });

      res.status(200).json({
        success: true,
        message: "Patient unconfirmed successfully",
        data: updatedPatient,
      });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
  getAllNotVerified: async (req, res) => {
    try {
      const notVerifiedPatients = await patientModel.find({ verified: false });
      res
        .status(200)
        .json({ success: true, message: "Success", data: notVerifiedPatients });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
  getAllBlocked: async (req, res) => {
    try {
      const blockedPatients = await patientModel.find({ blocked: true });
      res
        .status(200)
        .json({ success: true, message: "Success", data: blockedPatients });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
};
