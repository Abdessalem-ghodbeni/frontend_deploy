const ProjectModel = require("../models/Project.model.js");
const UserModel = require("../models/userModel.js");
const FormsModel = require("../models/forms.model.js");
const InternauteModel = require("../models/internauteModel.js");
const userModel = require("../models/userModel.js");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const internauteModel = require("../models/internauteModel.js");
module.exports.AjouterProjet = async (req, res) => {
  try {
    const {
      location,
      projectName,
      description,
      subject,
      objective,
      domain,
      startDate,
      endDate,
      radioValue,
      newFormId,
      userId,
      membresCollaborateur,
      organisation,
    } = req.body;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: " invalide id user",
      });
    }

    const forms = [];
    if (newFormId) {
      if (!ObjectId.isValid(newFormId)) {
        return res.status(400).json({
          success: false,
          message: "ID de formulaire radio invalide",
        });
      }

      const formulaire = await FormsModel.findById(newFormId);
      if (formulaire) {
        await forms.push(newFormId);
      } else {
        return res.status(404).json({
          success: false,
          message: "Formulaire non trouvable avec cet ID",
        });
      }
    }
    if (radioValue) {
      if (!ObjectId.isValid(radioValue)) {
        return res.status(400).json({
          success: false,
          message: "ID de formulaire radio invalide",
        });
      }

      const formulaire = await FormsModel.findById(radioValue);
      if (formulaire) {
        forms.push(radioValue);
      } else {
        return res.status(404).json({
          success: false,
          message: "Formulaire non trouvable avec cet ID",
        });
      }
    }
    const project = new ProjectModel({
      user: userId,
      name: projectName,
      lieu: location,
      description: description,
      sujet: subject,
      objectif: objective,
      domaine: domain,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      forms: forms,
      membresCollaborateur: membresCollaborateur,
      organisation: organisation,
    });

    await project.save();

    const internaute = await InternauteModel.findById(userId);
    internaute.ProjectCreated.push(project._id);
    await internaute.save();

    if (forms.length > 0 && forms) {
      for (id of forms) {
        const formulaire = await FormsModel.findById(id);
        if (formulaire) {
          formulaire.Project.push(project._id);
          formulaire.save();
        }
      }
    }
    if (membresCollaborateur && membresCollaborateur.length > 0) {
      for (membre of membresCollaborateur) {
        const membreCollaborateur = await UserModel.findById(membre);
        if (membreCollaborateur) {
          membreCollaborateur.Participations.push(project._id);
          await membreCollaborateur.save();
        } else {
          return res.status(404).json({
            success: false,
            message: "introuvable membre",
          });
        }
      }
    }
    return res.status(201).json({
      success: true,
      message: "Projet ajouté avec succès",
      project: project,
    });
  } catch (error) {
    console.log("Erreur :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur s'est produite lors de l'ajout du projet",
    });
  }
};

module.exports.AfficherTousLesProjets = async (req, res) => {
  try {
    const ListeProjects = await ProjectModel.find()
      .populate("membresCollaborateur")
      .populate("forms")
      .populate("user");
    if (ListeProjects.length === 0) {
      return res.status(200).json({
        success: true,
        message: "accun projet pour le moment",
        ListeProjects,
      });
    }
    res.status(200).json({
      success: true,
      message: "ceci la liste des projet",
      ListeProjects,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "une chose mal passé",
      error: error,
    });
  }
};
module.exports.supprimerProjet = async (req, res) => {
  try {
    const projetId = req.params.id;

    if (!ObjectId.isValid(projetId)) {
      return res.status(400).json({
        success: false,
        message: "id projet est non valide",
      });
    }

    const projet = await ProjectModel.findById(projetId);
    if (!projet) {
      return res.status(404).json({
        success: false,
        message: "Projet introuvable avec cet ID",
      });
    }

    await UserModel.updateMany(
      { Participations: projetId },
      { $pull: { Participations: projetId } }
    );
    await InternauteModel.updateMany(
      { ProjectCreated: projetId },
      { $pull: { ProjectCreated: projetId } }
    );
    await FormsModel.updateMany(
      { Project: projetId },
      { $pull: { Project: projetId } }
    );

    const Projet = await ProjectModel.deleteOne({ _id: projetId });

    return res.status(200).json({
      success: true,
      message: "Le projet et ses affectations ont été supprimés avec succès",
      Projet,
    });
  } catch (error) {
    console.log("Erreur :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur s'est produite lors de la suppression du projet",
    });
  }
};

module.exports.GetProjetById = async (req, res) => {
  try {
    const projetId = req.params.id;

    if (!ObjectId.isValid(projetId)) {
      return res.status(400).json({
        success: false,
        message: "id projet est non valide",
      });
    }

    const projet = await ProjectModel.findById(projetId)
      .populate("membresCollaborateur")
      .populate("forms")
      .populate("user");
    if (!projet) {
      return res.status(404).json({
        success: false,
        message: "Projet introuvable avec cet ID",
      });
    }
    res.status(200).json({
      success: true,
      message: "le projet recupéré est le suivant : ",
      projet,
    });
  } catch (error) {
    console.log("Erreur :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est produite lors de la recupération du projet",
    });
  }
};
module.exports.miseAJourProjet = async (req, res) => {
  try {
    const projetId = req.params.id;
    const {
      location,
      projectName,
      description,
      subject,
      objective,
      domain,
      startDate,
      endDate,
      radioValue,
      newFormId,
      userId,
      membresCollaborateur,
      organisation,
    } = req.body;
    const projet = await ProjectModel.findById(projetId);
    if (!projet) {
      return res.status(404).json({
        success: false,
        message: "Projet introuvable avec cet ID",
      });
    }
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur invalide",
      });
    }
    const forms = [];
    if (newFormId) {
      if (!ObjectId.isValid(newFormId)) {
        return res.status(400).json({
          success: false,
          message: "ID de formulaire radio invalide",
        });
      }

      const formulaire = await FormsModel.findById(newFormId);
      if (formulaire) {
        await forms.push(newFormId);
      } else {
        return res.status(404).json({
          success: false,
          message: "Formulaire non trouvable avec cet ID",
        });
      }
    }
    if (radioValue) {
      if (!ObjectId.isValid(radioValue)) {
        return res.status(400).json({
          success: false,
          message: "ID de formulaire radio invalide",
        });
      }

      const formulaire = await FormsModel.findById(radioValue);
      if (formulaire) {
        forms.push(radioValue);
      } else {
        return res.status(404).json({
          success: false,
          message: "Formulaire non trouvable avec cet ID",
        });
      }
    }
    projet.user = userId;
    projet.name = projectName;
    projet.lieu = location;
    projet.description = description;
    projet.sujet = subject;
    projet.objectif = objective;
    projet.domaine = domain;
    projet.startDate = new Date(startDate);
    projet.endDate = new Date(endDate);
    projet.forms = forms;
    projet.membresCollaborateur = membresCollaborateur;
    projet.organisation = organisation;
    const projetMisAjour = await projet.save();
    const existingForms = await FormsModel.find({ Project: projetId });
    for (const form of existingForms) {
      if (!forms.includes(form._id.toString())) {
        form.Project.pull(projetId);
        await form.save();
      }
    }
    for (const formId of forms) {
      const existingForm = await FormsModel.findById(formId);
      if (existingForm && !existingForm.Project.includes(projetId)) {
        existingForm.Project.push(projetId);
        await existingForm.save();
      }
    }
    const existingCollaborators = await UserModel.find({
      Participations: projetId,
    });

    for (const collaborator of existingCollaborators) {
      if (!membresCollaborateur.includes(collaborator._id.toString())) {
        collaborator.Participations.pull(projetId);
        await collaborator.save();
      }
    }
    for (const collaboratorId of membresCollaborateur) {
      const existingCollaborator = await UserModel.findById(collaboratorId);
      if (
        existingCollaborator &&
        !existingCollaborator.Participations.includes(projetId)
      ) {
        existingCollaborator.Participations.push(projetId);
        await existingCollaborator.save();
      }
    }
    return res.status(200).json({
      success: true,
      projet: projetMisAjour,
      message: "Le projet a été mis à jour avec succès",
    });
  } catch (error) {
    console.log("Erreur :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur s'est produite lors de la mise à jour du projet",
    });
  }
};

module.exports.GetAllPojectByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "invalid format d'id",
      });
    }
    const user = await userModel
      .findById(userId)
      .populate("membresCollaborateur")
      .populate("forms");
    if (!user) {
      return res.status(404).json({
        succes: false,
        message: "user not found with this id ",
      });
    }
    // Recherche des projets où l'ID de l'utilisateur existe dans la liste des membres collaborateurs
    const projects = await ProjectModel.find({ membresCollaborateur: userId });

    res.status(200).json({
      success: true,
      projects,
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
module.exports.GetProjectCreatedByIntermauteId = async (req, res) => {
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
    // const projects = [];
    // const liste = await ProjectModel.find();
    // for (projet of liste) {
    //   if (project.user == userId) {
    //     projects.push(project);
    //   }
    // }
    const projects = await ProjectModel.find({ user: userId });
    return res.status(200).json({
      success: true,
      message: "ceci la liste des projets created by you...",
      projects: projects,
    });
  } catch (error) {
    console.log("Erreur :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur s'est produite lors de l'ajout du projet",
    });
  }
};

module.exports.getOngoingProjects = async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();

    // Query the database for projects where endDate is greater than the current date
    const ongoingProjects = await ProjectModel.find({
      endDate: { $gt: currentDate },
    })
      .populate("membresCollaborateur")
      .populate("forms")
      .populate("user");

    res.status(200).json({
      success: true,
      message: "Ongoing projects retrieved successfully",
      data: ongoingProjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching ongoing projects: " + error,
      data: null,
    });
  }
};
module.exports.getProjectsEnCoursCreatedByIntarnaute = async (req, res) => {
  try {
    const currentDate = new Date();
    const userId = req.params.id;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "invalid format d'id",
      });
    }
    const user = await internauteModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        succes: false,
        message: "user not found with this id ",
      });
    }

    const ongoingProjects = await ProjectModel.find({
      endDate: { $gt: currentDate },
      user: userId,
    })
      .populate("membresCollaborateur")
      .populate("forms")
      .populate("user");

    res.status(200).json({
      success: true,
      message: "Ongoing projects retrieved successfully",
      data: ongoingProjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching ongoing projects: " + error,
      data: null,
    });
  }
};
