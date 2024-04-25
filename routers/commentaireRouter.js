const commentaireController = require("../controllers/commentaireController");
const route = require("express").Router();
const authentificationMiddleware = require('../middleware/autorisation');

route.post("/add/:idPublication/:idInternaute", authentificationMiddleware.autorisation, commentaireController.create);
route.put("/update/:id", authentificationMiddleware.autorisation, commentaireController.update);
route.get("/getByIdPublication/:idPublication", authentificationMiddleware.autorisation, commentaireController.getByIdPublication);
route.delete("/delete/:id", authentificationMiddleware.autorisation, commentaireController.delete);

module.exports = route;