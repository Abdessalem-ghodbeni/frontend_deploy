const messageModel = require("../models/messageModel");
const userModel = require("../models/userModel");

const createMessage = async (req, res) => {
  const { chatId, senderId, text, isImage, isVoice } = req.body;
  const message = new messageModel({
    chatId,
    senderId,
    text,
    isImage,
    isVoice,
  });

  try {
    const response = await message.save();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await messageModel.find({ chatId });

    // Créer un tableau pour stocker les messages avec le nom de l'expéditeur
    const messagesWithSenderName = await Promise.all(
      messages.map(async (message) => {
        const sender = await userModel.findById(message.senderId);
        const senderName = sender ? `${sender.nom} ${sender.prenom}` : "Unknown";
        return {
          _id: message._id,
          chatId: message.chatId,
          senderId: message.senderId,
          text: message.text,
          isImage: message.isImage,
          isVoice: message.isVoice,
          createdAt: message.createdAt,
          senderName: senderName,
        };
      })
    );

    res.status(200).json(messagesWithSenderName);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = { createMessage, getMessages };
