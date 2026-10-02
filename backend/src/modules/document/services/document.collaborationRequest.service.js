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

    if (typeof email !== "string") {
        throw new ApiError(400, "User email must be a string");
    }
    if (message != null && typeof message !== "string") {
        throw new ApiError(400, "Message must be a string");
    }
    const cleanEmail = email.trim();
    if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        throw new ApiError(400, "Enter a valid email address");
    }
    if ((message?.trim().length || 0) > 500) {
        throw new ApiError(400, "Message must be at most 500 characters");
    }

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
    const result = await Document.db.transaction(async (session) => {
        const pendingRequest = {
            _id: requestId,
            recipient: userId,
            status: "pending"
        };
        const request = await CollaborationRequest.findOne(pendingRequest).session(session);
        if (!request) {
            throw new ApiError(404, "Collaboration request is no longer pending");
        }

        const document = await Document.findById(request.document).session(session);
        if (!document) {
            // A deleted document cannot be shared; finish this invitation truthfully.
            await CollaborationRequest.findOneAndUpdate(
                pendingRequest, { $set: { status: "rejected" } }, { session }
            );
            return { missingDocument: true };
        }
        if (document.owner.toString() !== request.sender.toString()) {
            throw new ApiError(409, "This invitation is no longer valid for the document owner");
        }

        const alreadyHasAccess = document.owner.toString() === userId.toString() ||
            document.collaborators.some((item) => item.user.toString() === userId.toString());
        let grantedDocument = document;
        if (!alreadyHasAccess) {
            grantedDocument = await Document.findOneAndUpdate(
                {
                    _id: request.document,
                    owner: request.sender,
                    "collaborators.user": { $ne: userId }
                },
                { $push: { collaborators: { user: userId, role: request.role } } },
                { new: true, runValidators: true, session }
            );
            if (!grantedDocument) {
                throw new ApiError(409, "Document permissions changed. Please try again.");
            }
        }

        const acceptedRequest = await CollaborationRequest.findOneAndUpdate(
            pendingRequest, { $set: { status: "accepted" } }, { new: true, session }
        );
        if (!acceptedRequest) {
            throw new ApiError(409, "Collaboration request is no longer pending");
        }
        return { document: grantedDocument };
    });

    if (result.missingDocument) {
        throw new ApiError(404, "Document no longer exists");
    }
    return result.document;
};

const rejectCollaborationRequest = async (
    requestId,
    userId
) => {
    const request =
        await CollaborationRequest.findOneAndUpdate(
            { _id: requestId, recipient: userId, status: "pending" },
            { $set: { status: "rejected" } },
            { new: true }
        );

    if (!request) {
        throw new ApiError(
            404,
            "Collaboration request not found"
        );
    }

    return request;
};

module.exports = {
    sendCollaborationRequest,
    getCollaborationRequests,
    acceptCollaborationRequest,
    rejectCollaborationRequest
};
