const historyController = require("../controllers/historyController");
const route = require("express").Router();
const authentificationMiddleware = require('../middleware/autorisation');

route.get("/", authentificationMiddleware.autorisation, historyController.read);

module.exports = route;