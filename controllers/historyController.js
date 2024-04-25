const historyModel = require("../models/historyModel");

module.exports = {
    read: async (req, res) => {
        try {
            const history = await historyModel.find().populate(['user']);

            res.status(200).json({ success: true, message: "Success", data: history });
        } catch (error) {
            res.status(400).json({ success: false, message: "Error: " + error, data: null });
        }
    },
};