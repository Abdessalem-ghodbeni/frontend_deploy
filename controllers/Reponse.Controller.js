const ResponseModel = require("../models/Reponse.model.js");
const Forms = require("../models/forms.model.js");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const path = require("path");
const FormField = require("../models/formField.model.js");
// const cloudinary = require("cloudinary");
const cloudinary = require("cloudinary").v2;
const { getDataUri } = require("./../utils/features.js");
const FormFiledModel = require("../models/formField.model.js");
const cloudinaryUploader = require("cloudinary");
const userModel = require("../models/userModel.js");
const singleUpload = require("../middleware/multer.js").singleUpload;
// const storage = (multer.diskStorage = {
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../images"));
//   },
//   filename: function (req, file, cb) {
//     cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
//   },
// });
// const upload = multer({
//   storage: storage,
// });

//cloudinary Config
cloudinary.config({
  cloud_name: "dqyyvvwap",
  api_key: "829332458549452",
  api_secret: "F4akaK4kP3eSh4cSjM-36tSbF60",
});
module.exports.AjouterResponse = async (req, res) => {
  try {
    const formId = req.body.form;
    const answer = req.body.answers;
    const userId = req.body.userId;

    const form = await Forms.findOne({ _id: formId });

    if (!form) {
      return res
        .status(404)
        .json({ error: "Form does not exist in the database" });
    }

    const responseAnswers = []; // Array to store answers for the response

    for (const answer of req.body.answers) {
      const fieldId = answer.field;

      // Find the field
      const field = await FormField.findOne({ _id: fieldId });

      if (!field) {
        return res
          .status(404)
          .json({ error: "Field does not exist in the database" });
      } else {
        responseAnswers.push({
          field: fieldId,
          value: answer.value,
        });
      }
    }
    // Create the response object
    const newResp = await ResponseModel.create({
      form: formId,
      answers: responseAnswers,
      user: userId,
    });
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        succes: false,
        message: "user not found with this id",
      });
    }

    // Save the response to the database
    const rep = await newResp.save();
    if (form) {
      form.addResponse(rep._id);
      await form.save();
    }
    await user.ResponsesListe.push(rep._id);
    await user.save();
    res.status(201).json({ message: "Response saved successfully", rep });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      succes: false,
      message: "somthing was warrning",
    });
  }
};
module.exports.UploadFileInCloudinary = async (req, res) => {
  try {
    // const { name } = req.body;
    const file = getDataUri(req.file);
    const cdb = await cloudinary.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    res.status(201).send({
      success: true,
      message: "cloudinary Created Successfully",
      url: cdb.secure_url,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      succes: false,
      message: "somthing was warrning",
    });
  }
};

module.exports.updateResponse = async (req, res) => {
  try {
    const responseId = req.params.id; // Récupérer l'ID de la réponse à mettre à jour depuis les paramètres d'URL
    const updateDataResponse = req.body; // Récupérer les données de mise à jour de la réponse depuis le corps de la requête

    // Vérifier si l'ID de la réponse est valide
    if (!ObjectId.isValid(responseId)) {
      return res.status(400).json({
        success: false,
        message: "ID de réponse invalide",
      });
    }

    // Vérifier s'il y a des données de mise à jour fournies
    if (
      !updateDataResponse.answers ||
      updateDataResponse.answers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Aucune donnée de mise à jour fournie",
      });
    }

    // Rechercher la réponse dans la base de données
    const response = await ResponseModel.findById(responseId);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: `Aucune réponse avec l'ID ${responseId} trouvée`,
      });
    }

    // Mettre à jour la valeur de la réponse
    response.answers.forEach((answer) => {
      if (answer._id.toString() === updateDataResponse.answers[0]._id) {
        answer.value = updateDataResponse.answers[0].value;
      }
    });

    // Sauvegarder la réponse mise à jour dans la base de données
    const updatedResponse = await response.save();

    // Envoyer une réponse réussie avec la réponse mise à jour
    res.status(200).json({
      success: true,
      message: "Réponse mise à jour avec succès",
      updatedResponse,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réponse :", error);
    res.status(500).json({
      success: false,
      message: "Une erreur s'est produite lors de la mise à jour de la réponse",
      error,
    });
  }
};

module.exports.getAllResponse = async (req, res) => {
  try {
    const responseListe = await ResponseModel.find()
      .populate("form")
      .populate("answers");
    if (responseListe.length === 0) {
      return res.status(200).json({
        succes: true,
        message: "Aucune réponse pour le moment",
        responseListe,
      });
    }

    const responseWithTestDetails = [];

    for (const response of responseListe) {
      responseWithTestDetails.push({
        _id: response._id,
        form: response.form,
        answers: response.answers,

        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        __v: response.__v,
      });
    }

    res.status(200).json({
      succes: true,
      message: "Voici la liste des réponses",
      responseListe: responseWithTestDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      succes: false,
      message: "Une erreur s'est produite",
      error: error,
    });
  }
};

module.exports.deleteResponse = async (req, res) => {
  try {
    const idResponse = req.params.id;

    if (!ObjectId.isValid(idResponse)) {
      return res.status(400).send({
        success: false,
        message: "Format d'ID invalide",
      });
    }

    const response = await ResponseModel.findById(idResponse);
    if (!response) {
      return res.status(404).send({
        success: false,
        message: `Aucune réponse avec l'ID ${idResponse} trouvée`,
      });
    }

    const formId = response.form;

    // Supprimer l'image associée à la réponse sur Cloudinary
    for (const answer of response.answers) {
      if (answer.field.type === "image") {
        await cloudinary.uploader.destroy(answer.value.public_id);
      }
    }

    await ResponseModel.findByIdAndDelete(idResponse);

    // mise a du   formulaire pour supprimer la reference a la reponse
    await Forms.findByIdAndUpdate(formId, {
      $pull: { responses: idResponse },
    });
    // await userModel.findByIdAndUpdate(userId, {
    //   $pull: { userId: userId },
    // });
    res.status(200).send({
      success: true,
      message: "Réponse supprimée avec succès",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Une erreur s'est produite",
      error,
    });
  }
};

module.exports.getResponseById = async (req, res) => {
  try {
    const idResponse = req.params.id;
    if (!ObjectId.isValid(idResponse)) {
      return res.status(500).send({
        succes: false,
        message: "L'ID n'est pas valide",
      });
    }

    const response = await ResponseModel.findById(idResponse);
    if (!response) {
      return res.status(404).send({
        succes: false,
        message: `La réponse avec l'ID ${idResponse} est introuvable`,
      });
    }

    const responseWithTestDetails = {
      _id: response._id,
      form: response.form,
      answers: response.answers,

      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      __v: response.__v,
    };

    res.status(200).send({
      succes: true,
      message: "Réponse récupérée avec succès",
      response: responseWithTestDetails,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: "Une erreur s'est produite",
      error: error,
    });
  }
};

module.exports.GetFormFiledById = async (req, res) => {
  try {
    const idformfiled = req.params.id;
    if (!ObjectId.isValid(idformfiled)) {
      return res.status(400).json({
        succes: false,
        message: "id fomr filed est non valid",
      });
    }

    const inputDetails = await FormFiledModel.findById(idformfiled);
    if (!inputDetails) {
      return res.status(404).json({
        succes: false,
        message: `auccun input avec l'id ${idformfiled}`,
      });
    }
    res.status(200).json({
      succes: true,
      message: "ceci le details de l'input",
      inputDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      succes: false,
      message: "somthing was warrning",
      error: error,
    });
  }
};

module.exports.GetResponseByIdUser = async (req, res) => {
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
    const listebyuser = [];
    const response = await ResponseModel.find()
      .populate("form")
      .populate("answers");
    for (rep of response) {
      if (rep.user == userId) {
        listebyuser.push(rep);
      }
    }
    res.status(200).json({
      succes: true,
      listebyuser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "sothing was warning....",
      error: error,
    });
  }
};
