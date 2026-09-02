const mongoose = require("mongoose");

const collaborationRequestSchema =
    new mongoose.Schema(
        {
            document: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Document",
                required: true
            },

            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            recipient: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            role: {
                type: String,
                enum: ["viewer", "editor"],
                default: "viewer"
            },

            message: {
                type: String,
                trim: true,
                maxlength: 500,
                default: ""
            },

            status: {
                type: String,
                enum: [
                    "pending",
                    "accepted",
                    "rejected"
                ],
                default: "pending"
            }
        },
        {
            timestamps: true
        }
    );

module.exports = mongoose.model(
    "CollaborationRequest",
    collaborationRequestSchema
);