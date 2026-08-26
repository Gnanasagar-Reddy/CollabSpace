const Document = require("../document.model");
const ApiError = require("../../../utils/ApiError");

const {
    redisClient
} = require("../../../config/redis");

const {
    documentQueue
} = require("../../../queue/document.queue");

const saveDocumentNow = async (
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

    const collaborator =
        document.collaborators.find(
            (item) =>
                item.user.toString() ===
                userId.toString()
        );

    const isEditor =
        collaborator &&
        collaborator.role === "editor";

    if (!isOwner && !isEditor) {
        throw new ApiError(
            403,
            "You do not have permission to save this document"
        );
    }

    const redisKey =
        `document:${documentId}:content`;

    const content =
        await redisClient.get(
            redisKey
        );

    if (content === null) {
        throw new ApiError(
            400,
            "No unsaved changes found"
        );
    }

    await Document.findByIdAndUpdate(
        documentId,
        {
            content
        }
    );

    const existingJob =
        await documentQueue.getJob(
            documentId
        );

    if (existingJob) {
        await existingJob.remove();
    }

    await redisClient.del(
        redisKey
    );

    return {
        message:
            "Document saved successfully"
    };
};

const discardDocumentDraft = async (
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

    const collaborator =
        document.collaborators.find(
            (item) =>
                item.user.toString() ===
                userId.toString()
        );

    const isEditor =
        collaborator &&
        collaborator.role === "editor";

    if (!isOwner && !isEditor) {
        throw new ApiError(
            403,
            "You do not have permission to discard changes"
        );
    }

    await redisClient.del(
        `document:${documentId}:content`
    );

    const existingJob =
        await documentQueue.getJob(
            documentId
        );

    if (existingJob) {
        await existingJob.remove();
    }

    return {
        message:
            "Unsaved changes discarded"
    };
};


module.exports = {
    saveDocumentNow,
    discardDocumentDraft
};