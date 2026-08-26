const documentService = require("./document.service");
const sendResponse = require("../../utils/apiResponse");


const createDocument = async (req, res, next) => {

    try {

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


    } catch (error) {

        next(error);

    }

};

const getUserDocuments = async (req, res, next) => {

    try {

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


    }
    catch (error) {

        next(error);

    }

};

const getDocumentById = async (req, res, next) => {

    try {

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


    }
    catch (error) {

        next(error);

    }

};

const updateDocument = async (
    req,
    res,
    next
) => {

    try {

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


    }
    catch (error) {

        next(error);

    }

};

const deleteDocument = async (
    req,
    res,
    next
) => {

    try {

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

    }
    catch (error) {

        next(error);

    }

};

const shareDocument = async (
    req,
    res,
    next
) => {

    try {

        const {
            email,
            role
        } = req.body;


        const document =
            await documentService.shareDocument(
                req.params.id,
                req.user._id,
                email,
                role
            );


        sendResponse(
            res,
            200,
            document,
            "Document shared successfully"
        );

    }
    catch (error) {

        next(error);

    }

};

const updateCollaboratorRole = async (
    req,
    res,
    next
) => {

    try {

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


    }
    catch (error) {

        next(error);

    }

};

const removeCollaborator = async (
    req,
    res,
    next
) => {

    try {

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


    }
    catch (error) {

        next(error);

    }

};

const saveDocument = async (
    req,
    res,
    next
) => {
    try {
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
    } catch (error) {
        next(error);
    }
};

const discardDocumentDraft = async (
    req,
    res,
    next
) => {
    try {
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
    } catch (error) {
        next(error);
    }
};

module.exports = {
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

};