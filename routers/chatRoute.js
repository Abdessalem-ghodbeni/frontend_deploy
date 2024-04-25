const express = require("express")
const { createChat, findUserChats, findChat } = require("../controllers/ChatController")
const userModel = require('../models/userModel');
const router = express.Router();

router.post("/", createChat);
router.get("/:userId", findUserChats); // Correction ici : utilisation de :userId
router.get("/find/:firstId/:secondId", findChat);


  

module.exports = router;
