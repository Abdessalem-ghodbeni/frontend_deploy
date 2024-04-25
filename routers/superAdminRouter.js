const superAdminController = require("../controllers/superAdminController");
const route = require("express").Router();
const upload = require("../middleware/upload");
const authentificationMiddleware = require("../middleware/autorisation");

route.put(
  "/update/:id",
  upload.single("photo"),
  authentificationMiddleware.autorisation,
  superAdminController.update
);
route.put(
  "/updatePassword/:id",
  authentificationMiddleware.autorisation,
  superAdminController.updatePassword
);
route.get(
  "/getById/:id",
  authentificationMiddleware.autorisation,
  superAdminController.getById
);

module.exports = route;
