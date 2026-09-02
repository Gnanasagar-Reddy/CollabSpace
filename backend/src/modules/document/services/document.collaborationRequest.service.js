const Document = require("../document.model");
const User = require("../../auth/user.model");
const CollaborationRequest =
    require("../collaborationRequest.model");
const ApiError =
    require("../../../utils/ApiError");

const escapeRegex = (value) =>
    value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

const sendCollaborationRequest = async (
    documentId,
    ownerId,
    email,
    role,
    message
) => {
    const document =
        await Document.findById(documentId);

    if (!document) {
        throw new ApiError(
            404,
            "Document not found"
        );
    }

    if (
        document.owner.toString() !==
        ownerId.toString()
    ) {
        throw new ApiError(
            403,
            "Only the owner can share this document"
        );
    }

    if (
        !["viewer", "editor"].includes(role)
    ) {
        throw new ApiError(
            400,
            "Invalid collaboration role"
        );
    }

    const cleanEmail = email.trim();

    if (!cleanEmail) {
        throw new ApiError(
            400,
            "User email is required"
        );
    }

    const user = await User.findOne({
        email: {
            $regex:
                `^${escapeRegex(cleanEmail)}$`,
            $options: "i"
        }
    });

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    if (
        user._id.toString() ===
        ownerId.toString()
    ) {
        throw new ApiError(
            400,
            "You cannot send a request to yourself"
        );
    }

    const alreadyCollaborator =
        document.collaborators.some(
            (collaborator) =>
                collaborator.user.toString() ===
                user._id.toString()
        );

    if (alreadyCollaborator) {
        throw new ApiError(
            400,
            "User is already a collaborator"
        );
    }

    const existingRequest =
        await CollaborationRequest.findOne({
            document: documentId,
            recipient: user._id,
            status: "pending"
        });

    if (existingRequest) {
        throw new ApiError(
            400,
            "A collaboration request is already pending"
        );
    }

    const request =
        await CollaborationRequest.create({
            document: documentId,
            sender: ownerId,
            recipient: user._id,
            role,
            message:
                message?.trim() || ""
        });

    return request;
};

const getCollaborationRequests = async (
    userId
) => {
    return CollaborationRequest.find({
        recipient: userId,
        status: "pending"
    })
        .populate(
            "sender",
            "name email avatar"
        )
        .populate(
            "document",
            "title"
        )
        .sort({
            createdAt: -1
        })
        .lean();
};

const acceptCollaborationRequest = async (
    requestId,
    userId
) => {
    const request =
        await CollaborationRequest.findOne({
            _id: requestId,
            recipient: userId,
            status: "pending"
        });

    if (!request) {
        throw new ApiError(
            404,
            "Collaboration request not found"
        );
    }

    const document =
        await Document.findById(
            request.document
        );

    if (!document) {
        request.status = "rejected";

        await request.save();

        throw new ApiError(
            404,
            "Document no longer exists"
        );
    }

    const alreadyCollaborator =
        document.collaborators.some(
            (collaborator) =>
                collaborator.user.toString() ===
                userId.toString()
        );

    if (!alreadyCollaborator) {
        document.collaborators.push({
            user: userId,
            role: request.role
        });

        await document.save();
    }

    request.status = "accepted";

    await request.save();

    return document;
};

const rejectCollaborationRequest = async (
    requestId,
    userId
) => {
    const request =
        await CollaborationRequest.findOne({
            _id: requestId,
            recipient: userId,
            status: "pending"
        });

    if (!request) {
        throw new ApiError(
            404,
            "Collaboration request not found"
        );
    }

    request.status = "rejected";

    await request.save();

    return request;
};

module.exports = {
    sendCollaborationRequest,
    getCollaborationRequests,
    acceptCollaborationRequest,
    rejectCollaborationRequest
};