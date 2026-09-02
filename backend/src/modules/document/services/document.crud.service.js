const Document = require("../document.model");
const ApiError = require("../../../utils/ApiError");
const { redisClient } =
    require("../../../config/redis");

const createDocument = async (
    userId,
    documentData
) => {
    const document =
        await Document.create({
            title: documentData.title,
            content:
                documentData.content || "",
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
        })
        .lean();

    return documents.map((document) => {
        const isOwner =
            document.owner.toString() ===
            userId.toString();

        return {
            ...document,
            accessType: isOwner
                ? "owned"
                : "shared"
        };
    });
};

const getDocumentById = async (
    documentId,
    userId
) => {
    const document =
        await Document.findById(
            documentId
        ).populate(
            "collaborators.user",
            "name email"
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

    if (
        !isOwner &&
        !isCollaborator
    ) {
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

    const redisKey =
        `document:${documentId}:content`;

    const redisContent =
        await redisClient.get(
            redisKey
        );

    if (redisContent !== null) {
        document.content =
            redisContent;
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
        userId.toString();

    const collaborator =
        document.collaborators.find(
            (item) =>
                item.user.toString() ===
                userId.toString()
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

    if (
        updateData.content !==
        undefined
    ) {
        document.content =
            updateData.content;
    }

    await document.save();

    return document;
};

const deleteDocument = async (
    documentId,
    userId
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
        userId.toString();

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

const getOwnedDocuments = async (userId) => {
    const documents = await Document.find({
        owner: userId
    }).sort({
        updatedAt: -1
    });

    return documents;
};

const getSharedDocuments = async (userId) => {
    const documents = await Document.find({
        "collaborators.user": userId
    }).sort({
        updatedAt: -1
    });

    return documents;
};

module.exports = {
    createDocument,
    getUserDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getOwnedDocuments,
    getSharedDocuments
};