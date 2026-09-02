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
    restoreDocumentVersion
} = require("./document.controller");

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


/*
 * Specific routes MUST come
 * before /:id
 */

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


/*
 * Dynamic route comes after
 * specific routes
 */

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

module.exports = router;