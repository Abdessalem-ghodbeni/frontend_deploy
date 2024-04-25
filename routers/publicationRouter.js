const publicationController = require("../controllers/publicationController");
const route = require("express").Router();
const authentificationMiddleware = require('../middleware/autorisation');

route.post("/add/:idInternaute", authentificationMiddleware.autorisation, publicationController.create);
route.get("/", authentificationMiddleware.autorisation, publicationController.read);
route.put("/update/:id", authentificationMiddleware.autorisation, publicationController.update);
route.get("/getById/:id", authentificationMiddleware.autorisation, publicationController.getById);
route.get("/getByIdInternaute/:idInternaute", authentificationMiddleware.autorisation, publicationController.getByIdInternaute);
route.delete("/delete/:id", authentificationMiddleware.autorisation, publicationController.delete);

module.exports = route;