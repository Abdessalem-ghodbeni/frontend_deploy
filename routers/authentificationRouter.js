const auth = require("../controllers/authentificationController");
const route = require("express").Router();
const authentificationMiddleware = require('../middleware/autorisation');

route.get("/verify/:codeVerification", auth.verif);
route.post("/login", auth.login);
route.post("/logout", authentificationMiddleware.autorisation, auth.logout);
route.post("/verifyRefreshToken", auth.verifyRefreshToken);
route.post("/forgotPassword", auth.forgotPassword);
route.post("/reset/:resetToken", auth.resetPassword);
route.post("/verify2fa/:id", authentificationMiddleware.autorisation, auth.verify2fa);
route.post("/disable2fa/:id", authentificationMiddleware.autorisation, auth.disable2fa);


module.exports = route;