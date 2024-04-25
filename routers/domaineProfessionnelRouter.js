const domaineProfessionnelController = require("../controllers/domaineProfessionnelController");
const route = require("express").Router();
const authentificationMiddleware = require('../middleware/autorisation');

route.post("/add", authentificationMiddleware.autorisation, domaineProfessionnelController.create);
route.get("/", authentificationMiddleware.autorisation, domaineProfessionnelController.read);
route.delete("/delete/:id", authentificationMiddleware.autorisation, domaineProfessionnelController.delete);

module.exports = route;