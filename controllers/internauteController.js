const { uploadFile } = require("../middleware/uploadCloudinary");
const internauteModel = require("../models/internauteModel");
const historyModel = require("../models/historyModel");
const domaineProfessionnel = require("../models/domaineProfessionnelModel");
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
        specialite: Joi.string(),
      });

      const { error, value } = schemaVal.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Vérification de l'unicité de l'email
      const emailExists = await internauteModel.findOne({
        email: req.body.email,
      });
      if (emailExists) {
        return res
          .status(409)
          .json({ message: "This email is already in use." });
      }

      // Extrait le domaine de l'email de l'utilisateur
      const emailDomain = req.body.email.split("@")[1];

      // Vérifiez si le domaine existe dans la base de données des domaines professionnels
      const domaineExists = await domaineProfessionnel.findOne({
        domaine: emailDomain,
      });

      let licenceProfessionnelleUrl = "";
      let isDomaineProfessionnel = false; // Ajouté pour déterminer si le domaine est professionnel

      if (domaineExists) {
        isDomaineProfessionnel = true; // Le domaine est professionnel
        // Si le domaine est professionnel, vérifiez si un fichier a été fourni
        if (req.file) {
          // Un fichier est fourni, téléchargez-le et utilisez son URL sécurisée
          const result = await uploadFile(req.file.path);
          licenceProfessionnelleUrl = result.secure_url;

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
        } else {
          // Un fichier n'est pas fourni, utilisez une URL par défaut pour la licence
          licenceProfessionnelleUrl =
            "https://res.cloudinary.com/dvofvctg3/image/upload/v1710859240/kaxhxkqeydr2l00fkp0n.pdf";
        }
      } else {
        // Si le domaine n'est pas professionnel, vérifiez si un fichier a été fourni
        if (req.file) {
          // Un fichier est fourni, téléchargez-le et utilisez son URL sécurisée
          const result = await uploadFile(req.file.path);
          licenceProfessionnelleUrl = result.secure_url;

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
        } else {
          // Si aucun fichier n'est fourni pour un domaine non professionnel, renvoyez une erreur
          return res
            .status(400)
            .json({ message: "A professional license file is required." });
        }
      }

      // Génération du secret 2FA
      const secret = speakeasy.generateSecret({ length: 20 });

      // Hashage du mot de passe
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

      // Ici, générez le QR Code avant de sauvegarder l'utilisateur
      QRCode.toDataURL(secret.otpauth_url, async (err, data_url) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Erreur lors de la génération du QR Code" });
        }

        const internaute = new internauteModel({
          ...req.body,
          licenceProfessionnelle: licenceProfessionnelleUrl,
          image:
            "https://res.cloudinary.com/dvofvctg3/image/upload/v1709681139/nqqimfl2bsrryj2taid6.png",
          password: hashedPassword,
          codeVerification: crypto.randomBytes(20).toString("hex"),
          twoFactorSecret: secret.base32,
          twoFactorQrCode: data_url,
          confirmed: isDomaineProfessionnel,
        });

        const item = await internaute.save();

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
          details: `New health professionals created: ${item.email}`,
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
        specialite: Joi.string(),
      });
      const { error } = schemaVal.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const updateData = { ...req.body, updateProfile: true };

      if (req.files) {
        // Gestion du fichier image
        if (req.files.image) {
          const imageUploadResult = await uploadFile(req.files.image[0].path);
          updateData.image = imageUploadResult.secure_url;

          // Suppression du fichier temporaire
          fs.unlink(req.files.image[0].path, (err) => {
            if (err) {
              console.error(
                "Erreur lors de la suppression du fichier temporaire:",
                err
              );
            } else {
              console.log("Fichier temporaire image supprimé avec succès.");
            }
          });
        }

        // Gestion du fichier licenceProfessionnelle
        if (req.files.licenceProfessionnelle) {
          const licenceUploadResult = await uploadFile(
            req.files.licenceProfessionnelle[0].path
          );
          updateData.licenceProfessionnelle = licenceUploadResult.secure_url;

          // Suppression du fichier temporaire
          fs.unlink(req.files.licenceProfessionnelle[0].path, (err) => {
            if (err) {
              console.error(
                "Erreur lors de la suppression du fichier temporaire:",
                err
              );
            } else {
              console.log(
                "Fichier temporaire licenceProfessionnelle supprimé avec succès."
              );
            }
          });
        }
      }

      const internaute = await internauteModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!internaute) {
        return res.status(404).json({
          success: false,
          message: "Internaute not found",
          data: null,
        });
      }

      res.status(200).json({
        success: true,
        message: "Internaute updated successfully",
        data: { data: internaute },
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
      const internaute = await internauteModel.findById(id);
      if (!internaute) {
        return res.status(404).json({ message: "Internaute not found" });
      }

      // Comparer l'ancien mot de passe avec celui dans la base de données
      const isMatch = await bcrypt.compare(oldPassword, internaute.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      // Hacher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Mettre à jour le document du internaute avec le nouveau mot de passe haché
      const updatedInternaute = await internauteModel.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );

      // Répondre avec succès
      res
        .status(200)
        .json({ message: "Internaute password updated successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating password", error: error.message });
    }
  },
  read: async (req, res) => {
    try {
      const internautes = await internauteModel.find();
      res
        .status(200)
        .json({ success: true, message: "Success", data: internautes });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const internaute = await internauteModel.findByIdAndDelete(id);

      if (!internaute) {
        return res.status(404).json({
          success: false,
          message: "Internaute not found",
          data: null,
        });
      }

      res.status(200).json({
        success: true,
        message: "Internaute deleted successfully",
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

      const internaute = await internauteModel.findById(id);

      if (!internaute) {
        return res.status(404).json({
          success: false,
          message: "Internaute not found",
          data: null,
        });
      }

      res
        .status(200)
        .json({ success: true, message: "Success", data: internaute });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
  confirmUser: async (req, res) => {
    try {
      const { id } = req.params;

      const updatedInternaute = await internauteModel.findByIdAndUpdate(
        id,
        { $set: { confirmed: true } },
        { new: true }
      );

      if (!updatedInternaute) {
        return res.status(404).json({
          success: false,
          message: "Internaute not found",
          data: null,
        });
      }

      transport.sendMail({
        from: '"MediColGes" <<superadmin@medicolges.com>>',
        to: updatedInternaute.email,
        subject: "Your account has been confirmed",
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
                    <h5 class="card-title">Hello <strong>${updatedInternaute.nom} ${updatedInternaute.prenom}</strong>,</h5>
                    <br>
                    <p class="card-text">We are pleased to inform you that your account on MediColGes has been <strong>confirmed</strong>.</p>
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

      // Log the confirmed in the history model
      await historyModel.create({
        actionType: "Update",
        details: `Health Professionals confirmed: ${updatedInternaute.email}`,
        user: process.env.SUPERADMIN_ID,
      });

      res.status(200).json({
        success: true,
        message: "Internaute confirmed successfully",
        data: updatedInternaute,
      });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
  unblockedUser: async (req, res) => {
    try {
      const { id } = req.params;

      const updatedInternaute = await internauteModel.findByIdAndUpdate(
        id,
        { $set: { blocked: false } },
        { new: true }
      );

      if (!updatedInternaute) {
        return res.status(404).json({
          success: false,
          message: "Internaute not found",
          data: null,
        });
      }

      transport.sendMail({
        from: '"MediColGes" <<superadmin@medicolges.com>>',
        to: updatedInternaute.email,
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
                    <h5 class="card-title">Hello <strong>${updatedInternaute.nom} ${updatedInternaute.prenom}</strong>,</h5>
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
        details: `Health Professionals unblocked: ${updatedInternaute.email}`,
        user: process.env.SUPERADMIN_ID,
      });

      res.status(200).json({
        success: true,
        message: "Internaute confirmed successfully",
        data: updatedInternaute,
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

      const updatedInternaute = await internauteModel.findByIdAndUpdate(
        id,
        { $set: { blocked: true } },
        { new: true }
      );

      if (!updatedInternaute) {
        return res.status(404).json({
          success: false,
          message: "Internaute not found",
          data: null,
        });
      }

      transport.sendMail({
        from: '"MediColGes" <<superadmin@medicolges.com>>',
        to: updatedInternaute.email,
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
                    <h5 class="card-title">Hello <strong>${updatedInternaute.nom} ${updatedInternaute.prenom}</strong>,</h5>
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
        details: `Health Professionals blocked: ${updatedInternaute.email}`,
        user: process.env.SUPERADMIN_ID,
      });

      res.status(200).json({
        success: true,
        message: "Internaute unconfirmed successfully",
        data: updatedInternaute,
      });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
  getAllNotVerified: async (req, res) => {
    try {
      const notVerifiedInternautes = await internauteModel.find({ verified: false });
      res
        .status(200)
        .json({ success: true, message: "Success", data: notVerifiedInternautes });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
  getAllNotConfirmed: async (req, res) => {
    try {
      const notConfirmedInternautes = await internauteModel.find({ confirmed: false });
      res
        .status(200)
        .json({ success: true, message: "Success", data: notConfirmedInternautes });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
  getAllBlocked: async (req, res) => {
    try {
      const blockedInternautes = await internauteModel.find({ blocked: true });
      res
        .status(200)
        .json({ success: true, message: "Success", data: blockedInternautes });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Error: " + error, data: null });
    }
  },
};
