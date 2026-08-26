require("dotenv").config();

const jwt = require("jsonwebtoken");
const { Server } = require("@hocuspocus/server");
const User = require("../modules/auth/user.model");
const Document = require("../modules/document/document.model");

const collaborationServer = new Server({
    port: 1234,

    async onAuthenticate({
        token,
        documentName
    }) {
        if (!token) {
            throw new Error(
                "Authentication required"
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        const user = await User.findById(
            decoded.userId
        ).select("-password");

        if (!user) {
            throw new Error(
                "User not found"
            );
        }

        const documentId =
            documentName.replace(
                "document_",
                ""
            );

        const document =
            await Document.findById(
                documentId
            );

        if (!document) {
            throw new Error(
                "Document not found"
            );
        }

        const isOwner =
            document.owner.toString() ===
            user._id.toString();

        const collaborator =
            document.collaborators.find(
                (item) =>
                    item.user.toString() ===
                    user._id.toString()
            );

        if (
            !isOwner &&
            !collaborator
        ) {
            throw new Error(
                "You do not have access to this document"
            );
        }

        const role = isOwner
            ? "owner"
            : collaborator.role;

        console.log(
            `Collaboration authenticated: ${user.email}`
        );

        console.log(
            `Document: ${documentId}`
        );

        console.log(
            `Role: ${role}`
        );

        return {
            userId:
                user._id.toString(),
            documentId,
            role
        };
    },

    async onConnect({
        documentName
    }) {
        console.log(
            `Collaboration connected: ${documentName}`
        );
    },

    async onDisconnect({
        documentName,
        context
    }) {
        console.log(
            `Collaboration disconnected: ${documentName} User: ${context?.userId}`
        );
    }
});

module.exports = collaborationServer;