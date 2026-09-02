const DocumentVersion = require("../document.version.model");
const Document = require("../document.model");
const ApiError = require("../../../utils/ApiError");

const getDocumentVersions = async (
    documentId,
    userId
) => {
    const document =
        await Document.findById(documentId);

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
            (item) =>
                item.user.toString() ===
                userId.toString()
        );

    if (!isOwner && !isCollaborator) {
        throw new ApiError(
            403,
            "You do not have access to this document"
        );
    }

    return DocumentVersion
        .find({
            document: documentId
        })
        .populate(
            "createdBy",
            "name email"
        )
        .sort({
            version: -1
        })
        .lean();
};

module.exports = {
    getDocumentVersions
};