const express = require("express");

const router = express.Router();

const protect =
    require("../../middleware/auth.middleware");

const {
    createDocument,
    getUserDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    shareDocument,
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
} = require("./document.controller");


/* =========================
   BASIC DOCUMENT ROUTES
   ========================= */

router.get(
    "/",
    protect,
    getUserDocuments
);

router.post(
    "/",
    protect,
    createDocument
);


/* =========================
   SPECIFIC ROUTES
   These MUST come before
   /:id
   ========================= */

router.get(
    "/owned",
    protect,
    getOwnedDocuments
);

router.get(
    "/shared",
    protect,
    getSharedDocuments
);


/* =========================
   COLLABORATION REQUESTS
   These MUST also come before
   /:id
   ========================= */

router.get(
    "/share-requests",
    protect,
    getCollaborationRequests
);

router.patch(
    "/share-requests/:requestId/accept",
    protect,
    acceptCollaborationRequest
);

router.patch(
    "/share-requests/:requestId/reject",
    protect,
    rejectCollaborationRequest
);


/* =========================
   VERSION HISTORY
   ========================= */

router.get(
    "/:documentId/versions",
    protect,
    getDocumentVersions
);

router.post(
    "/:documentId/versions/:versionId/restore",
    protect,
    restoreDocumentVersion
);


/* =========================
   DOCUMENT-SPECIFIC ACTIONS
   ========================= */

router.post(
    "/:id/share-request",
    protect,
    sendCollaborationRequest
);

router.post(
    "/:id/share",
    protect,
    shareDocument
);

router.patch(
    "/:id/collaborators/:userId",
    protect,
    updateCollaboratorRole
);

router.delete(
    "/:id/collaborators/:userId",
    protect,
    removeCollaborator
);

router.post(
    "/:documentId/save",
    protect,
    saveDocument
);

router.delete(
    "/:documentId/draft",
    protect,
    discardDocumentDraft
);


/* =========================
   DYNAMIC DOCUMENT ROUTES
   Keep these LAST
   ========================= */

router.get(
    "/:id",
    protect,
    getDocumentById
);

router.put(
    "/:id",
    protect,
    updateDocument
);

router.delete(
    "/:id",
    protect,
    deleteDocument
);


module.exports = router;