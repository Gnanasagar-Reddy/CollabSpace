const Document = require("../document.model");
const DocumentVersion = require(
    "../document.version.model"
);
const ApiError = require("../../../utils/ApiError");

const {
    redisClient
} = require("../../../config/redis");

const {
    removeDocumentSaveJobs
} = require("../../../queue/document.queue");


const MAX_DOCUMENT_VERSIONS = 30;


const checkEditPermission = (
    document,
    userId,
    action = "save"
) => {

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
            `You do not have permission to ${action} this document`
        );
    }
};


const createDocumentVersion = async (
    documentId,
    userId,
    content
) => {

    const latestVersion =
        await DocumentVersion
            .findOne({
                document: documentId
            })
            .sort({
                version: -1
            });

    /*
     * Do not create duplicate versions
     * when the content has not changed.
     */

    if (
        latestVersion &&
        latestVersion.content === content
    ) {
        return latestVersion;
    }

    await Document.updateOne(
        {
            _id: documentId,
            versionSequence: {
                $exists: false
            }
        },
        {
            $set: {
                versionSequence:
                    latestVersion?.version || 0
            }
        }
    );

    const documentWithNextVersion =
        await Document.findByIdAndUpdate(
            documentId,
            {
                $inc: {
                    versionSequence: 1
                }
            },
            {
                new: true
            }
        ).select("+versionSequence");

    if (!documentWithNextVersion) {
        throw new ApiError(
            404,
            "Document not found"
        );
    }

    const version =
        await DocumentVersion.create({
            document: documentId,
            version:
                documentWithNextVersion
                    .versionSequence,
            content,
            createdBy: userId
        });

    /*
     * Keep only the latest 30 versions.
     */

    const versions =
        await DocumentVersion
            .find({
                document: documentId
            })
            .sort({
                version: -1
            })
            .select("_id")
            .lean();

    if (
        versions.length >
        MAX_DOCUMENT_VERSIONS
    ) {

        const versionsToDelete =
            versions.slice(
                MAX_DOCUMENT_VERSIONS
            );

        await DocumentVersion.deleteMany({
            _id: {
                $in:
                    versionsToDelete.map(
                        (item) => item._id
                    )
            }
        });
    }

    return version;
};


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

    checkEditPermission(
        document,
        userId
    );

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

    /*
     * First persist the current content.
     */

    await Document.findByIdAndUpdate(
        documentId,
        {
            content
        }
    );

    /*
     * Then create a version.
     */

    await createDocumentVersion(
        documentId,
        userId,
        content
    );

    /*
     * Remove the delayed autosave job.
     */

    await removeDocumentSaveJobs(documentId);

    /*
     * Remove the temporary Redis draft.
     */

    await redisClient.del(
        redisKey
    );

    return {
        message:
            "Document saved successfully"
    };
};


const restoreDocumentVersion = async (
    documentId,
    versionId,
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

    /*
     * Only owner and editor can restore.
     * Viewer/reader receives 403.
     */

    checkEditPermission(
        document,
        userId,
        "restore"
    );

    const version =
        await DocumentVersion.findOne({
            _id: versionId,
            document: documentId
        });

    if (!version) {
        throw new ApiError(
            404,
            "Version not found"
        );
    }

    // Replace current document content with the selected version.

    await Document.findByIdAndUpdate(
        documentId,
        {
            content: version.content
        }
    );

    // Create a NEW version so old history is never destroyed.

    const restoredVersion =
        await createDocumentVersion(
            documentId,
            userId,
            version.content
        );

    // Remove any unsaved draft.

    await redisClient.del(
        `document:${documentId}:content`
    );

    // Remove pending autosave job if one exists.

    await removeDocumentSaveJobs(documentId);

    return {
        restoredVersion
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

    checkEditPermission(
        document,
        userId
    );

    await redisClient.del(
        `document:${documentId}:content`
    );

    await removeDocumentSaveJobs(documentId);

    return {
        message:
            "Unsaved changes discarded"
    };
};


module.exports = {
    saveDocumentNow,
    discardDocumentDraft,
    createDocumentVersion,
    restoreDocumentVersion
};
