const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const SuperAdmin = require("./models/superAdminModel");
const Color = require("colors");

// Définition de l'option strictQuery à false pour éviter l'avertissement de dépréciation
//mongoose.set("strictQuery", false);

// Options de connexion recommandées
const options = {};

// URL de connexion MongoDB
// const url = "mongodb+srv://arfaouimondher:3QXkuvfxjfSYD2gF@medicolges.buaegmg.mongodb.net/?retryWrites=true&w=majority&appName=MediColGes";
const url = "mongodb+srv://slouma:slouma@cluster0.w3oefhr.mongodb.net/MedicoGes?retryWrites=true&w=majority&appName=Cluster0";

// Connexion à MongoDB avec gestion des promesses
mongoose
  .connect(url, options)
  .then(() => {
    console.log("Connecté avec succès à MongoDB".bgMagenta.bgCyan);
    ensureSuperAdminExists();
  })
  .catch((err) => {
    console.error("Erreur lors de la connexion à MongoDB:", err);
  });

async function ensureSuperAdminExists() {
  try {
    const superAdminExists = await SuperAdmin.findOne();
    if (!superAdminExists) {
      const hashedPassword = await bcrypt.hash(
        process.env.SUPERADMIN_PASSWORD,
        10
      );
      const newSuperAdmin = new SuperAdmin({
        _id: process.env.SUPERADMIN_ID,
        nom: process.env.SUPERADMIN_NOM,
        prenom: process.env.SUPERADMIN_PRENOM,
        telephone: process.env.SUPERADMIN_TELEPHONE,
        image: process.env.SUPERADMIN_IMAGE,
        email: process.env.SUPERADMIN_EMAIL,
        password: hashedPassword,
        updateProfile: true,
        verified: true,
        confirmed: true,
      });

      await newSuperAdmin.save();
      console.log("Le compte Super Admin a été créé avec succès.");
    } else {
      console.log("Un compte Super Admin existe déjà.".bgBlue.blue);
    }
  } catch (error) {
    console.error("Erreur lors de la création du compte Super Admin:", error);
  }
}
