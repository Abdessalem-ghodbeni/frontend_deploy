const express = require("express");
const authentificationMiddleware = require("../middleware/autorisation");
const ProjectController = require("../controllers/Project.Controller.js");
const router = express.Router();

router.post(
  "/add",
  //   authentificationMiddleware.autorisation,
  ProjectController.AjouterProjet
);
router.get("/liste", ProjectController.AfficherTousLesProjets);
router.delete("/delete/:id", ProjectController.supprimerProjet);
router.get("/retrieve/:id", ProjectController.GetProjetById);
router.put("/update/:id", ProjectController.miseAJourProjet);
router.get(
  "/get/all/projets/by/user/:id",
  ProjectController.GetAllPojectByUserId
);
router.get(
  "/get/projectCreated/:id",
  ProjectController.GetProjectCreatedByIntermauteId
);
router.get(
  "/enCours/byInternaute/:id",
  ProjectController.getProjectsEnCoursCreatedByIntarnaute
);
router.get("/ongoing", ProjectController.getOngoingProjects);
module.exports = router;
