const patientController = require("../controllers/patientController");
const route = require("express").Router();
const upload = require("../middleware/upload");
const authentificationMiddleware = require("../middleware/autorisation");

route.post("/add", upload.single("photo"), patientController.create);
route.put(
  "/update/:id",
  authentificationMiddleware.autorisation,
  upload.single("photo"),
  patientController.update
);
route.put(
  "/updatePassword/:id",
  authentificationMiddleware.autorisation,
  patientController.updatePassword
);
route.get("/", authentificationMiddleware.autorisation, patientController.read);
route.delete(
  "/delete/:id",
  authentificationMiddleware.autorisation,
  patientController.delete
);
route.get(
  "/getById/:id",
  authentificationMiddleware.autorisation,
  patientController.getById
);
route.put(
  "/unblocked/:id",
  authentificationMiddleware.autorisation,
  patientController.unblockedUser
);
route.put(
  "/blocked/:id",
  authentificationMiddleware.autorisation,
  patientController.blockedUser
);
route.get(
  "/getAllNotVerified",
  authentificationMiddleware.autorisation,
  patientController.getAllNotVerified
);
route.get(
  "/getAllBlocked",
  authentificationMiddleware.autorisation,
  patientController.getAllBlocked
);

module.exports = route;
