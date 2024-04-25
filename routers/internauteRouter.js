const internauteController = require("../controllers/internauteController");
const route = require("express").Router();
const upload = require("../middleware/upload");
const authentificationMiddleware = require("../middleware/autorisation");

route.post(
  "/add",
  upload.single("licenceProfessionnelle"),
  internauteController.create
);
route.put(
  "/update/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "licenceProfessionnelle", maxCount: 1 },
  ]),
  authentificationMiddleware.autorisation,
  internauteController.update
);
route.put(
  "/updatePassword/:id",
  authentificationMiddleware.autorisation,
  internauteController.updatePassword
);
route.get(
  "/",
  authentificationMiddleware.autorisation,
  internauteController.read
);
route.delete(
  "/delete/:id",
  authentificationMiddleware.autorisation,
  internauteController.delete
);
route.get(
  "/getById/:id",
  authentificationMiddleware.autorisation,
  internauteController.getById
);
route.put(
  "/confirm/:id",
  authentificationMiddleware.autorisation,
  internauteController.confirmUser
);
route.put(
  "/unblocked/:id",
  authentificationMiddleware.autorisation,
  internauteController.unblockedUser
);
route.put(
  "/blocked/:id",
  authentificationMiddleware.autorisation,
  internauteController.blockedUser
);
route.get(
  "/getAllNotVerified",
  authentificationMiddleware.autorisation,
  internauteController.getAllNotVerified
);
route.get(
  "/getAllNotConfirmed",
  authentificationMiddleware.autorisation,
  internauteController.getAllNotConfirmed
);
route.get(
  "/getAllBlocked",
  authentificationMiddleware.autorisation,
  internauteController.getAllBlocked
);

module.exports = route;
