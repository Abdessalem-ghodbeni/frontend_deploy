const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
    {
        actionType: {
        type: String,
        required: true,
        enum: ['Create', 'Update', 'Delete']
        },
        details: {
        type: String,
        required: true
        },
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("historys", historySchema);