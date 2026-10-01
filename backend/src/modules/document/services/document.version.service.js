const DocumentVersion = require("../document.version.model");
const Document = require("../document.model");
const ApiError = require("../../../utils/ApiError");
const { getDocumentAccess } = require("../document.access");

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

    const { hasAccess } = getDocumentAccess(document, userId);

    if (!hasAccess) {
        throw new ApiError(
            403,
            "You do not have access to this document"
        );
    }

    const versions = await DocumentVersion
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

    // Number the retained history oldest-to-newest, independently of the
    // database sequence used to order saves and enforce uniqueness.
    return versions.map((version, index) => ({
        ...version,
        version: versions.length - index
    }));
};

module.exports = {
    getDocumentVersions
};
