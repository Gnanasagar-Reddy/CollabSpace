const express = require("express");

const router = express.Router();


const protect = require("../../middleware/auth.middleware");

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
    discardDocumentDraft
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