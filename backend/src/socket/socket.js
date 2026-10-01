const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { redisClient, socketPublisher, socketSubscriber } = require("../config/redis");
const Document = require("../modules/document/document.model");
const { getDocumentAccess } = require("../modules/document/document.access");
const socketAuth = require("./socket.middleware");
const {
    addDocumentSaveJob
} = require("../queue/document.queue");
const {
    addUserToDocument,
    removeUserFromDocument,
    getUsersByIds
} = require("../services/presence.service");

const MAX_DOCUMENT_CONTENT_LENGTH =
    1_000_000;
const DOCUMENT_CHANGE_WINDOW_MS = 1000;
const MAX_DOCUMENT_CHANGES_PER_WINDOW = 30;



let ioInstance;

const initializeSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    ioInstance = io;

    io.adapter(
        createAdapter(
            socketPublisher,
            socketSubscriber
        )
    );

    io.use(socketAuth);

    io.on("connection", (socket) => {

        console.log("Socket connected:", socket.id);
        console.log("User:", socket.user);

        socket.documentChangeWindowStartedAt =
            Date.now();
        socket.documentChangeCount = 0;
        socket.data.userId = socket.user.toString();

        const getConnectedUsers = async (documentId) => {
            const connectedSockets =
                await io.in(
                    `document_${documentId}`
                ).fetchSockets();

            const userIds = [
                ...new Set(
                    connectedSockets
                        .map(
                            (connectedSocket) =>
                                connectedSocket.data.userId
                        )
                        .filter(Boolean)
                )
            ];

            return getUsersByIds(userIds);
        };

        socket.on("join-document", async (documentId) => {

            try {

                const document =
                    await Document.findById(documentId);

                if (!document) {
                    return socket.emit(
                        "error",
                        "Document not found"
                    );
                }

                const { hasAccess } = getDocumentAccess(document, socket.user);

                if (!hasAccess) {
                    return socket.emit(
                        "error",
                        "Access denied"
                    );
                }

                const room =
                    `document_${documentId}`;

                socket.join(room);

                socket.currentDocument = documentId;
                await addUserToDocument(
                    documentId,
                    socket.user,
                    socket.id
                );


                const users =
                    await getConnectedUsers(documentId);


                io.to(room).emit(
                    "presence-update",
                    {
                        users
                    }
                );

                console.log(
                    `${socket.user} joined ${room}`
                );

            } catch (error) {

                console.log(error);

            }

        });

        socket.on("document-change", async (data) => {

            try {

                console.log("Document change received");

                if (
                    !data ||
                    typeof data.documentId !== "string" ||
                    typeof data.content !== "string"
                ) {
                    return socket.emit(
                        "socket-error",
                        {
                            message: "Invalid document update"
                        }
                    );
                }

                if (
                    data.content.length >
                    MAX_DOCUMENT_CONTENT_LENGTH
                ) {
                    return socket.emit(
                        "socket-error",
                        {
                            message:
                                "Document content is too large"
                        }
                    );
                }

                const now = Date.now();

                if (
                    now -
                    socket.documentChangeWindowStartedAt >=
                    DOCUMENT_CHANGE_WINDOW_MS
                ) {
                    socket.documentChangeWindowStartedAt = now;
                    socket.documentChangeCount = 0;
                }

                if (
                    socket.documentChangeCount >=
                    MAX_DOCUMENT_CHANGES_PER_WINDOW
                ) {
                    return socket.emit(
                        "socket-error",
                        {
                            message:
                                "Too many document updates"
                        }
                    );
                }

                socket.documentChangeCount += 1;

                const room =
                    `document_${data.documentId}`;

                if (
                    socket.currentDocument !==
                    data.documentId ||
                    !socket.rooms.has(room)
                ) {
                    return socket.emit(
                        "socket-error",
                        {
                            message:
                                "Join the document before editing"
                        }
                    );
                }

                const document =
                    await Document.findById(data.documentId);

                if (!document) {
                    return socket.emit(
                        "socket-error",
                        {
                            message: "Document not found"
                        }
                    );
                }

                const { isOwner, collaborator, isEditor, canEdit } =
                    getDocumentAccess(document, socket.user);

                console.log({
                    socketUser: socket.user,
                    owner: document.owner,
                    collaborator,
                    isOwner,
                    isEditor
                });

                if (!canEdit) {

                    return socket.emit(
                        "socket-error",
                        {
                            message: "You do not have permission to edit"
                        }
                    );

                }

                // Store latest document content in Redis
                await redisClient.set(
                    `document:${data.documentId}:content`,
                    data.content
                );

                await addDocumentSaveJob(
                    data.documentId
                );

                console.log(
                    "Document content stored in Redis"
                );

                // Send update to other users in the document room
                socket.to(room).emit(
                    "document-update",
                    {
                        documentId: data.documentId,
                        content: data.content
                    }
                );

            } catch (error) {

                console.log(
                    "Document change error:",
                    error
                );

                socket.emit(
                    "socket-error",
                    {
                        message: "Failed to process document change"
                    }
                );

            }

        });

        socket.on("disconnect", async () => {

            console.log(
                "Socket disconnected:",
                socket.id
            );


            if (socket.currentDocument) {

                await removeUserFromDocument(
                    socket.currentDocument,
                    socket.id
                );


                const users =
                    await getConnectedUsers(
                        socket.currentDocument
                    );


                io.to(
                    `document_${socket.currentDocument}`
                ).emit(
                    "presence-update",
                    {
                        users
                    }
                );

            }

        });

    });

    return io;
};

module.exports = initializeSocket;
module.exports.getIo = () => ioInstance;
