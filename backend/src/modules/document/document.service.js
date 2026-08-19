const Document = require("./document.model");
const ApiError = require("../../utils/ApiError");
const User = require("../auth/user.model");

const createDocument = async (userId, documentData) => {

    const document = await Document.create({

        title: documentData.title,

        content: documentData.content || "",

        owner: userId

    });


    return document;

};

const getUserDocuments = async (userId) => {

    const documents = await Document.find({

        $or: [
            {
                owner: userId
            },

            {
                "collaborators.user": userId
            }
        ]

    })
        .sort({
            updatedAt: -1
        });


    return documents;

};

const getDocumentById = async (documentId, userId) => {

    const document = await Document.findById(
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
        userId.toString();


    const isCollaborator =
        document.collaborators.some(
            (collaborator) =>
                collaborator.user._id.toString() ===
                userId.toString()
        );

    if (!isOwner && !isCollaborator) {

        throw new ApiError(
            403,
            "You do not have access to this document"
        );

    }


    let role;


    if (isOwner) {

        role = "owner";

    } else {

        const collaborator =
            document.collaborators.find(
                (item) =>
                    item.user._id.toString() ===
                    userId.toString()
            );

        role = collaborator.role;

    }


    return {
        document,
        role
    };

};

const updateDocument = async (
    documentId,
    userId,
    updateData
) => {


    const document = await Document.findById(
        documentId
    );


    if (!document) {

        throw new ApiError(
            404,
            "Document not found"
        );

    }


    const isOwner =
        document.owner.toString() === userId.toString();


    const collaborator =
        document.collaborators.find(
            (item) =>
                item.user.toString() === userId.toString()
        );


    const canEdit =
        isOwner ||
        (
            collaborator &&
            collaborator.role === "editor"
        );


    if (!canEdit) {

        throw new ApiError(
            403,
            "You do not have edit permission"
        );

    }


    if (updateData.title) {

        document.title =
            updateData.title;

    }


    if (updateData.content !== undefined) {

        document.content =
            updateData.content;

    }


    await document.save();


    return document;

};

const deleteDocument = async (documentId, userId) => {
    const document = await Document.findById(
        documentId
    );

    if (!document) {

        throw new ApiError(
            404,
            "Document not found"
        );

    }

    const isOwner =
        document.owner.toString() === userId.toString();


    if (!isOwner) {

        throw new ApiError(
            403,
            "Only the owner can delete this document"
        );

    }
    await Document.findByIdAndDelete(
        documentId
    );

    return document;

};


const shareDocument = async (
    documentId,
    ownerId,
    email,
    role
) => {

    const document = await Document.findById(
        documentId
    );


    if (!document) {

        throw new ApiError(
            404,
            "Document not found"
        );

    }


    const isOwner =
        document.owner.toString() === ownerId.toString();


    if (!isOwner) {

        throw new ApiError(
            403,
            "Only the owner can share this document"
        );

    }


    if (!["viewer", "editor"].includes(role)) {

        throw new ApiError(
            400,
            "Invalid collaboration role"
        );

    }


    const user = await User.findOne({
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

    const document = await Document.findById(
        documentId
    );


    if (!document) {

        throw new ApiError(
            404,
            "Document not found"
        );

    }


    const isOwner =
        document.owner.toString() === ownerId.toString();


    if (!isOwner) {

        throw new ApiError(
            403,
            "Only owner can change permissions"
        );

    }


    if (!["viewer", "editor"].includes(role)) {

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

    const document = await Document.findById(
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
    createDocument,
    getUserDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    shareDocument,
    updateCollaboratorRole,
    removeCollaborator
};