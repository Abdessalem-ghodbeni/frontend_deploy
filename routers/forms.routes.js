const express = require("express");
const authentificationMiddleware = require("../middleware/autorisation");
const FormsController = require("../controllers/forms.controller.js");
const router = express.Router();
router.post(
  "/add_forms",
  authentificationMiddleware.autorisation,
  FormsController.AddForms
);
router.put("/update/:id", FormsController.updateFormWithFields);
router.delete("/delete/:id", FormsController.DeleteForm);
router.get("/get/all", FormsController.retrieveAllForms);
router.get("/get/:idForm", FormsController.getFormulaireById);
router.post("/send", FormsController.shareFormWithMembers);
router.post("/affecter", FormsController.affecterFormsToProjects);
router.get(
  "/recuperer/formulaire/internaute/:id",
  FormsController.getFormCreatedByInternaute
);

router.get(
  "/recuperer/FormsForUserProject/:id",
  FormsController.getFormsForUserProject
);
// export default router;
module.exports = router;
