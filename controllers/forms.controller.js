const FormField = require("../models/formField.model.js");
const FormsModel = require("../models/forms.model.js");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const FormAnswer = require("../models/Reponse.model.js");
const InternautesModel = require("../models/internauteModel.js");
const projectModel = require("../models/Project.model.js");
const userModel = require("../models/userModel.js");
const ProjectModel = require("../models/Project.model.js");
module.exports.AddForms = async (req, res) => {
  try {
    const { title, description, formFields, style, userId } = req.body;

    if (!title || !description || formFields.length == null) {
      return res.status(500).send({
        succes: false,
        message: "merci de verifier vos champs",
      });
    }
    const uniqueId = uuidv4();
    //`${req.protocol}://${req.get('host')}/formulaire/${uniqueId}` a changer apres de deploiement
    const formulaireLink = `http://localhost:${process.env.PORT}/formulaire/${uniqueId}`;

    const form = await FormsModel.create({
      user: userId,
      title,
      description,
      style: {
        backgroundColor: style.backgroundColor || "#FFFFFF",
        textColor: style.textColor || "#000000",
        fontFamily: style.fontFamily || "Arial",
        fontSize: style.fontSize || 14,
      },
      link: formulaireLink,
    });
    const internaute = await InternautesModel.findById(userId);
    if (!internaute) {
      return res.status(404).send({
        success: false,
        message: "Internaute non trouvé",
      });
    }
    internaute.formulairesCreated.push(form._id);
    await internaute.save();

    const createdFields = await FormField.create(
      formFields.map((field) => ({ ...field, form: form._id }))
    );

    form.formFields = createdFields.map((field) => field._id);
    await form.save();

    res.status(201).json({ success: true, data: form });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      succes: false,
      message: "An error occurred in adding forms",
      error,
    });
  }
};

module.exports.updateFormWithFields = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    if (session.inTransaction()) {
      throw new Error("Transaction already in progress");
    }
    session.startTransaction();
    const formId = req.params.id;
    const updateData = req.body;

    if (!ObjectId.isValid(formId)) {
      return res.status(400).send({
        success: false,
        message: "ID de formulaire non valide",
      });
    }

    const existingForm = await FormsModel.findById(formId).session(session);

    if (!existingForm) {
      return res.status(404).send({
        success: false,
        message: "Formulaire non trouvé avec cet ID",
      });
    }

    if (updateData.formFields) {
      if (!Array.isArray(updateData.formFields)) {
        return res.status(400).send({
          success: false,
          message: "Les champs du formulaire doivent être un tableau",
        });
      }

      if (req.body.newFormField) {
        updateData.formFields.push(req.body.newFormField);
      }

      await Promise.all(
        updateData.formFields.map(async (field) => {
          if (field.type !== "checkbox" && field.type !== "radio") {
            field.options = undefined;
          }
          if (field._id) {
            await FormField.findByIdAndUpdate(field._id, field, { session });
          } else {
            const createdField = await FormField.create({
              ...field,
              form: existingForm._id,
            });
            existingForm.formFields.push(createdField._id);
          }
        })
      );
    }

    existingForm.title = updateData.title || existingForm.title;
    existingForm.description =
      updateData.description || existingForm.description;
    existingForm.style = updateData.style || existingForm.style;

    await existingForm.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).send({
      success: true,
      message: "Formulaire mis à jour avec succès",
      updatedForm: existingForm,
    });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).send({
      success: false,
      message: "Une erreur s'est produite lors de la mise à jour du formulaire",
      error,
    });
  }
};

module.exports.DeleteForm = async (req, res) => {
  try {
    const formId = req.params.id;

    if (!ObjectId.isValid(formId)) {
      return res.status(400).send({
        succes: false,
        message: "id de formulaire est de format non valide",
      });
    }

    const form = await FormsModel.findById(formId);
    if (!form) {
      return res.status(404).send({
        succes: false,
        message: "Formulaire non trouvé",
      });
    }

    await FormField.deleteMany({ form: formId });
    await FormAnswer.deleteMany({ form: formId });
    await FormsModel.findByIdAndDelete(formId);
    res.status(200).send({
      succes: true,
      message: "Le formulaire et ses champs ont été supprimés avec succès",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      succes: false,
      message: "Une erreur s'est produite lors de la suppression du formulaire",
      error,
    });
  }
};

module.exports.retrieveAllForms = async (req, res) => {
  try {
    const formsListe = await FormsModel.find()
      .populate("formFields")
      .populate("Project")
      .populate("user");
    if (formsListe.length == 0) {
      return res.status(200).send({
        succes: true,
        message: "liste des formulaires est vide",
        formsListe,
      });
    }
    res.status(200).send({
      succes: true,
      message: "fomulaires  recuperés successfully",
      formsListe,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      succes: false,
      message: "erreur lors de recuperation des formulaire",
      error: error,
    });
  }
};

module.exports.getFormulaireById = async (req, res) => {
  try {
    const id = req.params.idForm;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        succes: false,
        message: "Invalid id",
      });
    }

    const formulaire = await FormsModel.findById(id).populate("formFields");
    if (!formulaire) {
      return res.status(404).json({
        succes: false,
        message: `introuvable formulaire avec l'id ${id}`,
      });
    }
    res.status(200).json({
      succes: true,
      message: "formulaire recupéré avec succes",
      formulaire,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      succes: false,
      message: "somthing was warrning",
      error: error.message,
    });
  }
};

module.exports.shareFormWithMembers = async (req, res) => {
  const sendShareEmail = async (email, formulaireLink) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "slouma4ghodbeny@gmail.com",
        pass: "hpsm wukl ihhg tohk",
      },
    });

    const mailOptions = {
      from: {
        name: "Abdessalem",
        adress: "slouma4ghodbeny@gmail.com",
      },
      to: email,

      subject: "Invitation à participer à un projet passionnant !",
      text: "Invitation à participer à un projet passionnant !",
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
            }
            .button {
              width: 100% !important;
            }
          }
        </style>
      </head>
      <body>
        <table class="container" style="max-width: 550px; width: 100%; margin: 0 auto;">
          <tr>
            <td style="background-color: #f0f0f0; padding: 20px;">
              <table style="background-color: #ffffff; padding: 20px; border-radius: 10px; width: 100%;">
                <tr>
                  <td>
                    <h1 style="color: #333333; font-family: Arial, sans-serif; text-align: center;">Invitation à participer à un projet passionnant !</h1>
                    <strong style="color: #555555; font-family: Arial, sans-serif;">Cher membre de MedicolGes,</strong>
                    <p style="color: #555555; font-family: Arial, sans-serif;">Nous sommes ravis de vous inviter à participer à un projet des plus captivants. Votre contribution et vos idées sont d'une grande importance pour nous.</p>
                    <p style="color: #555555; font-family: Arial, sans-serif;">Pour participer, veuillez cliquer sur le bouton ci-dessous :</p>
                    <div style="text-align: center; margin-top: 20px;">
                      <a href=${formulaireLink} class="button" style="background-color: #007bff; color: #ffffff; display: inline-block; padding: 8px 17px; text-decoration: none; border-radius: 5px; font-family: Arial, sans-serif;">Accéder au formulaire</a>
                    </div>
                    <p style="color: #555555; font-family: Arial, sans-serif;">Ce formulaire nous permettra de mieux comprendre vos besoins et d'adapter notre projet en conséquence.</p>
                    <p style="color: #555555; font-family: Arial, sans-serif;">Nous apprécions votre participation et nous sommes impatients de collaborer avec vous pour réussir ce projet ensemble.</p>
                    <p style="color: #555555; font-family: Arial, sans-serif;">Cordialement,</p>
                    <p style="color: #555555; font-family: Arial, sans-serif;"> Ghodbani Abdessalem - Responsable Principale MedicolGes </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("E-mail envoyé : " + info.response);
      }
    });
  };
  try {
    const { members, formulaireLink } = req.body;
    console.log(formulaireLink);

    members.forEach((member) => {
      sendShareEmail(member.email, formulaireLink);
    });

    res.status(200).send({
      success: true,
      message: "Lien de formulaire partagé avec succès",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erreur lors du partage du lien de formulaire",
    });
  }
};
module.exports.affecterFormsToProjects = async (req, res) => {
  try {
    const { projectIdArray, formulaireId } = req.body;

    if (!projectIdArray || !formulaireId) {
      return res.status(400).send({
        success: false,
        message:
          "Les identifiants de projet et de formulaire sont obligatoires.",
      });
    }

    const formulaire = await FormsModel.findById(formulaireId);

    if (!formulaire) {
      return res.status(404).send({
        success: false,
        message: "Formulaire non trouvé.",
      });
    }

    const projets = await projectModel.find({ _id: { $in: projectIdArray } });

    if (projets.length !== projectIdArray.length) {
      return res.status(404).send({
        success: false,
        message: "Certains projets n'ont pas été trouvés.",
      });
    }

    formulaire.Project = projectIdArray;

    await formulaire.save();

    return res.status(200).send({
      success: true,
      message: "Les projets ont été affectés avec succès au formulaire.",
      formulaire,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Erreur lors de l'affectation des projets au formulaire.",
    });
  }
};
module.exports.getFormCreatedByInternaute = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "invalid format d'id",
      });
    }
    const user = await InternautesModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        succes: false,
        message: "user not found with this id ",
      });
    }
    const formsListe = await FormsModel.find({ user: userId })
      .populate("formFields")
      .populate("Project");

    if (formsListe.length == 0) {
      return res.status(200).send({
        succes: true,
        message: "liste des formulaires est vide",
        formsListe,
      });
    }
    res.status(200).send({
      succes: true,
      message: "fomulaires  recuperés successfully",
      formsListe,
    });
  } catch (error) {
    console.error("ceci", error);
    return res.status(500).send({
      success: false,
      message:
        "Erreur lors de recuperation des formulaires created by this user...",
    });
  }
};

module.exports.getFormsForUserProject = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "invalid format d'id",
      });
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        succes: false,
        message: "user not found with this id ",
      });
    }
    const projects = await ProjectModel.find({
      membresCollaborateur: { $in: [userId] },
    });

    // Extract the project IDs
    const projectIds = projects.map((project) => project._id);

    // Find forms associated with the extracted project IDs
    const forms = await FormsModel.find({ Project: { $in: projectIds } });

    return res.status(200).json({
      succes: false,
      message: "Ceci la liste des formulaire",
      forms,
    });
  } catch (error) {
    console.error("ceci", error);
    return res.status(500).send({
      success: false,
      message:
        "Erreur lors de recuperation des formulaires dedie a cet ustilisation...",
    });
  }
};
