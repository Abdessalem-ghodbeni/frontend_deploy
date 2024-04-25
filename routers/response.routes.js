const Express = require("express");
const ResponseController = require("../controllers/Reponse.Controller.js");
const singleUpload = require("../middleware/multer.js");
const router = Express.Router();

router.post("/add", ResponseController.AjouterResponse);
// router.post("/add", addResp);
router.put("/update/:id", ResponseController.updateResponse);
router.post(
  "/add_test",
  singleUpload,
  ResponseController.UploadFileInCloudinary
);
router.get("/responseListe", ResponseController.getAllResponse);
router.delete("/delete/:id", ResponseController.deleteResponse);
router.get("/get_response/:id", ResponseController.getResponseById);
router.get("/get/formfiled/:id", ResponseController.GetFormFiledById);
router.get("/rep/by/user/:id", ResponseController.GetResponseByIdUser);
module.exports = router;
