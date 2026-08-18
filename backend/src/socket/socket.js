const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { redisClient, redisSubscriber } = require("../config/redis");
const Document = require("../modules/document/document.model");
const socketAuth = require("./socket.middleware");
const {
    addDocumentSaveJob
} = require("../queue/document.queue");
const {
    addUserToDocument,
    removeUserFromDocument,
    getDocumentUsers
} = require("../services/presence.service");



const initializeSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.adapter(
        createAdapter(
            redisClient,
            redisSubscriber
        )
    );

    io.use(socketAuth);

    io.on("connection", (socket) => {

        console.log("Socket connected:", socket.id);
        console.log("User:", socket.user);

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

                const hasAccess =
                    document.owner.toString() === socket.user.toString() ||
                    document.collaborators.some(
                        (collaborator) =>
                            collaborator.user.toString() === socket.user.toString()
                    );

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
                    socket.user
                );


                const users =
                    await getDocumentUsers(documentId);


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

                console.log(
                    "Document change received:",
                    data
                );

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

                const isOwner =
                    document.owner.toString() === socket.user.toString();

                const collaborator =
                    document.collaborators.find(
                        (item) =>
                            item.user.toString() === socket.user.toString()
                    );

                const isEditor =
                    collaborator &&
                    collaborator.role === "editor";

                console.log({
                    socketUser: socket.user,
                    owner: document.owner,
                    collaborator,
                    isOwner,
                    isEditor
                });

                if (!isOwner && !isEditor) {

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
                    data.documentId,
                    data.content
                );

                console.log(
                    "Document content stored in Redis"
                );

                const room =
                    `document_${data.documentId}`;

                // Send update to other users in the document room
                socket.to(room).emit(
                    "document-update",
                    {
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
                    socket.user
                );


                const users =
                    await getDocumentUsers(
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