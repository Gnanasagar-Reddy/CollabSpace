const Document = require("../document.model");
const ApiError = require("../../../utils/ApiError");
const User = require("../../auth/user.model");

const shareDocument = async (
    documentId,
    ownerId,
    email,
    role
) => {
    const document =
        await Document.findById(
            documentId
        );

    if (!document) {
        throw new ApiError(
            404,
            "Document not found"
        );
    }

    const isOwner =
        document.owner.toString() ===
        ownerId.toString();

    if (!isOwner) {
        throw new ApiError(
            403,
            "Only the owner can share this document"
        );
    }

    if (
        ![
            "viewer",
            "editor"
        ].includes(role)
    ) {
        throw new ApiError(
            400,
            "Invalid collaboration role"
        );
    }

    const user =
        await User.findOne({
            email
        });

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    if (
        user._id.toString() ===
        ownerId.toString()
    ) {
        throw new ApiError(
            400,
            "Owner cannot be added as collaborator"
        );
    }

    const alreadyCollaborator =
        document.collaborators.some(
            (collaborator) =>
                collaborator.user.toString() ===
                user._id.toString()
        );

    if (alreadyCollaborator) {
        throw new ApiError(
            400,
            "User is already a collaborator"
        );
    }

    document.collaborators.push({
        user: user._id,
        role
    });

    await document.save();

    return document;
};

const updateCollaboratorRole = async (
    documentId,
    ownerId,
    collaboratorId,
    role
) => {
    const document =
        await Document.findById(
            documentId
        );

    if (!document) {
        throw new ApiError(
            404,
            "Document not found"
        );
    }

    const isOwner =
        document.owner.toString() ===
        ownerId.toString();

    if (!isOwner) {
        throw new ApiError(
            403,
            "Only owner can change permissions"
        );
    }

    if (
        ![
            "viewer",
            "editor"
        ].includes(role)
    ) {
        throw new ApiError(
            400,
            "Invalid role"
        );
    }

    const collaborator =
        document.collaborators.find(
            (item) =>
                item.user.toString() ===
                collaboratorId.toString()
        );

    if (!collaborator) {
        throw new ApiError(
            404,
            "Collaborator not found"
        );
    }

    collaborator.role = role;

    await document.save();

    return document;
};

const removeCollaborator = async (
    documentId,
    ownerId,
    collaboratorId
) => {
    const document =
        await Document.findById(
            documentId
        );

    if (!document) {
        throw new ApiError(
            404,
            "Document not found"
        );
    }

    const isOwner =
        document.owner.toString() ===
        ownerId.toString();

    if (!isOwner) {
        throw new ApiError(
            403,
            "Only owner can remove collaborators"
        );
    }

    const collaborator =
        document.collaborators.find(
            (item) =>
                item.user.toString() ===
                collaboratorId.toString()
        );

    if (!collaborator) {
        throw new ApiError(
            404,
            "Collaborator not found"
        );
    }

    document.collaborators =
        document.collaborators.filter(
            (item) =>
                item.user.toString() !==
                collaboratorId.toString()
        );

    await document.save();

    return document;
};

module.exports = {
    shareDocument,
    updateCollaboratorRole,
    removeCollaborator
};