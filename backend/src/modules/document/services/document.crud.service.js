const Document = require("../document.model");
const DocumentVersion = require(
    "../document.version.model"
);
const CollaborationRequest = require(
    "../collaborationRequest.model"
);
const ApiError = require("../../../utils/ApiError");
const { redisClient } =
    require("../../../config/redis");
const {
    removeDocumentSaveJobs
} = require("../../../queue/document.queue");

const MAX_DOCUMENT_TITLE_LENGTH = 200;
const MAX_DOCUMENT_CONTENT_LENGTH =
    1_000_000;

const validateTitle = (title) => {
    if (typeof title !== "string") {
        throw new ApiError(
            400,
            "Document title must be text"
        );
    }

    const cleanTitle = title.trim();

    if (!cleanTitle) {
        throw new ApiError(
            400,
            "Document title is required"
        );
    }

    if (cleanTitle.length > MAX_DOCUMENT_TITLE_LENGTH) {
        throw new ApiError(
            400,
            "Document title is too long"
        );
    }

    return cleanTitle;
};

const validateContent = (content) => {
    if (typeof content !== "string") {
        throw new ApiError(
            400,
            "Document content must be text"
        );
    }

    if (content.length > MAX_DOCUMENT_CONTENT_LENGTH) {
        throw new ApiError(
            400,
            "Document content is too large"
        );
    }

    return content;
};

const createDocument = async (
    userId,
    documentData
) => {
    const title = validateTitle(
        documentData?.title
    );

    const content =
        documentData?.content === undefined
            ? ""
            : validateContent(documentData.content);

    const document =
        await Document.create({
            title,
            content,
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
    if (
        !updateData ||
        typeof updateData !== "object" ||
        Array.isArray(updateData)
    ) {
        throw new ApiError(
            400,
            "Document update data is required"
        );
    }

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

    const isTitleUpdate =
        Object.hasOwn(updateData, "title");

    if (isTitleUpdate) {
        document.title = validateTitle(
            updateData.title
        );
    }

    const isContentUpdate =
        updateData.content !== undefined;

    if (isContentUpdate) {
        document.content = validateContent(
            updateData.content
        );
        document.yjsState = "";
    }

    await document.save();

    if (isContentUpdate) {
        await redisClient.del(
            `document:${documentId}:content`
        );

        await removeDocumentSaveJobs(documentId);
    }

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

    await Promise.all([
        DocumentVersion.deleteMany({
            document: documentId
        }),
        CollaborationRequest.deleteMany({
            document: documentId
        }),
        redisClient.del(
            `document:${documentId}:content`,
            `document:${documentId}:presence`
        ),
        removeDocumentSaveJobs(documentId)
    ]);

    await Document.deleteOne({
        _id: documentId
    });

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
