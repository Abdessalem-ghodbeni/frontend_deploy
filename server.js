const express = require("express");
const app = express();
const cors = require("cors");
const Color = require("colors");
const Web3 = require("web3");
const formsRouter = require("./routers/forms.routes.js");
const ProjectRoutes = require("./routers/Poject.routes.js");
const ResponseRoutes = require("./routers/response.routes.js");
const chatRoute = require("./routers/chatRoute");
const messageRoute = require("./routers/messageRoute");

require("./db");
require("./socket/index.js");
require("dotenv").config();
const port = 3000;

app.use(express.json());
app.use(cors());

//chat
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);
// Importation des routes
const authentificationRouter = require("./routers/authentificationRouter");
app.use("/authentification", authentificationRouter);

const superAdminRouter = require("./routers/superAdminRouter");
app.use("/superAdmin", superAdminRouter);

const internauteRouter = require("./routers/internauteRouter");
app.use("/internaute", internauteRouter);

const patientRouter = require("./routers/patientRouter");
app.use("/patient", patientRouter);

const organizationRoutes = require("./routers/organizationRoutes");
app.use("/organizations", organizationRoutes);

const subCategoryRoutes = require("./routers/subCategoryRoutes");
app.use("/sub-categories", subCategoryRoutes);

const categoryRoutes = require("./routers/categoryRoutes");
app.use("/categories", categoryRoutes);

const feedbackRouter = require("./routers/feedbackRouter");
app.use("/feedback", feedbackRouter);

const domaineProfessionnelRouter = require("./routers/domaineProfessionnelRouter");
app.use("/domaineProfessionnel", domaineProfessionnelRouter);

const historyRouter = require("./routers/historyRouter");
app.use("/history", historyRouter);

const publicationRouter = require("./routers/publicationRouter");
app.use("/publication", publicationRouter);

const commentaireRouter = require("./routers/commentaireRouter");
app.use("/commentaire", commentaireRouter);

app.get("/getImage/:img", function (req, res) {
  res.sendFile(__dirname + "/storage/" + req.params.img);
});

app.use("/forms", formsRouter);
// app.use("/response", responseForms);
app.use("/project", ProjectRoutes);
app.use("/response", ResponseRoutes);

// Blockchain
//const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/1ec883a19df745bea5f892a91a13c3f5`));

app.get("/getImage/:img", function (req, res) {
  res.sendFile(__dirname + "/storage/" + req.params.img);
});

app.use("/forms", formsRouter);
// app.use("/response", responseForms);
app.use("/project", ProjectRoutes);
app.use("/response", ResponseRoutes);
// Démarrage du serveur
app.listen(port, function () {
  console.log(
    `Le serveur est en cours d'exécution, veuillez ouvrir dans votre navigateur à l'adresse http://localhost:${port}`
      .bgYellow.yellow
  );
});
