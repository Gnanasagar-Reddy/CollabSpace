const asyncHandler = require("../../utils/asyncHandler");
const documentService = require("./document.service");
const sendResponse = require("../../utils/apiResponse");
const collaborationRequestService = require("./services/document.collaborationRequest.service");
const {
    getIo
} = require("../../socket/socket");

const createDocument = asyncHandler(async (req, res) => {
    const document =
        await documentService.createDocument(
            req.user._id,
            req.body
        );

    sendResponse(
        res,
        201,
        document,
        "Document created successfully"
    );
});

const getUserDocuments = asyncHandler(async (req, res) => {
    const documents =
        await documentService.getUserDocuments(
            req.user._id
        );

    sendResponse(
        res,
        200,
        documents,
        "Documents fetched successfully"
    );
});

const getDocumentById = asyncHandler(async (req, res) => {
    const document =
        await documentService.getDocumentById(
            req.params.id,
            req.user._id
        );

    sendResponse(
        res,
        200,
        document,
        "Document fetched successfully"
    );
});

const updateDocument = asyncHandler(async (req, res) => {
    const document =
        await documentService.updateDocument(

            req.params.id,

            req.user._id,

            req.body

        );

    sendResponse(
        res,
        200,
        document,
        "Document updated successfully"
    );
});

const deleteDocument = asyncHandler(async (req, res) => {
    await documentService.deleteDocument(
        req.params.id,
        req.user._id
    );

    sendResponse(
        res,
        200,
        null,
        "Document deleted successfully"
    );
});

const updateCollaboratorRole = asyncHandler(async (req, res) => {
    const document =
        await documentService.updateCollaboratorRole(

            req.params.id,

            req.user._id,

            req.params.userId,

            req.body.role

        );

    sendResponse(
        res,
        200,
        document,
        "Collaborator role updated"
    );
    getIo()?.to(`document_${req.params.id}`).emit("document-permissions-updated", { documentId: req.params.id });
});

const removeCollaborator = asyncHandler(async (req, res) => {
    const document =
        await documentService.removeCollaborator(

            req.params.id,

            req.user._id,

            req.params.userId

        );

    sendResponse(
        res,
        200,
        document,
        "Collaborator removed"
    );
    getIo()?.to(`document_${req.params.id}`).emit("document-permissions-updated", { documentId: req.params.id });
});

const saveDocument = asyncHandler(async (req, res) => {
    const result =
        await documentService.saveDocumentNow(
            req.params.documentId,
            req.user._id
        );

    return res.status(200).json({
        success: true,
        message:
            result.message
    });
});

const discardDocumentDraft = asyncHandler(async (req, res) => {
    const result =
        await documentService
            .discardDocumentDraft(
                req.params.documentId,
                req.user._id
            );

    res.status(200).json({
        success: true,
        message:
            result.message
    });
});

const getOwnedDocuments = asyncHandler(async (req, res) => {
    const documents =
        await documentService.getOwnedDocuments(
            req.user._id
        );

    sendResponse(
        res,
        200,
        documents,
        "Owned documents fetched successfully"
    );
});

const getSharedDocuments = asyncHandler(async (req, res) => {
    const documents =
        await documentService.getSharedDocuments(
            req.user._id
        );

    sendResponse(
        res,
        200,
        documents,
        "Shared documents fetched successfully"
    );
});

const getDocumentVersions = asyncHandler(async (req, res) => {
    const versions =
        await documentService
            .getDocumentVersions(
                req.params.documentId,
                req.user._id
            );

    sendResponse(
        res,
        200,
        versions,
        "Document versions fetched successfully"
    );
});

const restoreDocumentVersion = asyncHandler(async (req, res) => {
    const result = await documentService.restoreDocumentVersion(
        req.params.documentId,
        req.params.versionId,
        req.user._id
    );

    const io = getIo();

    if (io) {
        io.to(
            `document_${req.params.documentId}`
        ).emit(
            "document-restored",
            {
                documentId: req.params.documentId,
                collaborationVersion:
                    result.collaborationVersion
            }
        );
    }

    sendResponse(
        res,
        200,
        result,
        "Document version restored successfully"
    );
});

const sendCollaborationRequest = asyncHandler(async (req, res) => {
    const request =
        await collaborationRequestService
            .sendCollaborationRequest(
                req.params.id,
                req.user._id,
                req.body.email,
                req.body.role,
                req.body.message
            );

    sendResponse(
        res,
        201,
        request,
        "Collaboration request sent successfully"
    );
});

const getCollaborationRequests = asyncHandler(async (req, res) => {
    const requests =
        await collaborationRequestService
            .getCollaborationRequests(
                req.user._id
            );

    sendResponse(
        res,
        200,
        requests,
        "Collaboration requests fetched successfully"
    );
});

const acceptCollaborationRequest = asyncHandler(async (req, res) => {
    const document =
        await collaborationRequestService
            .acceptCollaborationRequest(
                req.params.requestId,
                req.user._id
            );

    sendResponse(
        res,
        200,
        document,
        "Collaboration request accepted"
    );
});

const rejectCollaborationRequest = asyncHandler(async (req, res) => {
    const request =
        await collaborationRequestService
            .rejectCollaborationRequest(
                req.params.requestId,
                req.user._id
            );

    sendResponse(
        res,
        200,
        request,
        "Collaboration request rejected"
    );
});

module.exports = {
    createDocument,
    getUserDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    updateCollaboratorRole,
    removeCollaborator,
    saveDocument,
    discardDocumentDraft,
    getOwnedDocuments,
    getSharedDocuments,
    getDocumentVersions,
    restoreDocumentVersion,
    sendCollaborationRequest,
    getCollaborationRequests,
    acceptCollaborationRequest,
    rejectCollaborationRequest
};
