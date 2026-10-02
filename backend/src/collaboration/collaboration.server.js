require("dotenv").config();

const jwt = require("jsonwebtoken");
const Y = require("yjs");
const { Server } = require("@hocuspocus/server");
const {
    TiptapTransformer
} = require("@hocuspocus/transformer");
const {
    generateHTML,
    generateJSON
} = require("@tiptap/html/server");
const StarterKit =
    require("@tiptap/starter-kit").default;
const Underline =
    require("@tiptap/extension-underline").default;
const Link =
    require("@tiptap/extension-link").default;
const Highlight =
    require("@tiptap/extension-highlight").default;
const TextAlign =
    require("@tiptap/extension-text-align").default;
const {
    TextStyle
} = require("@tiptap/extension-text-style");
const {
    Color
} = require("@tiptap/extension-color");
const TaskList =
    require("@tiptap/extension-task-list").default;
const TaskItem =
    require("@tiptap/extension-task-item").default;
const {
    Table
} = require("@tiptap/extension-table");
const TableRow =
    require("@tiptap/extension-table-row").default;
const TableHeader =
    require("@tiptap/extension-table-header").default;
const TableCell =
    require("@tiptap/extension-table-cell").default;
const User = require("../modules/auth/user.model");
const Document = require("../modules/document/document.model");
const { getDocumentAccess } = require("../modules/document/document.access");

const COLLABORATION_PORT =
    process.env.COLLABORATION_PORT || 1234;

const editorExtensions = [
    StarterKit.configure({
        link: false,
        underline: false
    }),
    Underline,
    Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https"
    }),
    Highlight.configure({
        multicolor: true
    }),
    TextStyle,
    Color,
    TextAlign.configure({
        types: [
            "heading",
            "paragraph"
        ]
    }),
    TaskList,
    TaskItem.configure({
        nested: true
    }),
    Table.configure({
        resizable: false
    }),
    TableRow,
    TableHeader,
    TableCell
];

const getDocumentSession = (documentName) => {
    const match = documentName.match(
        /^document_([a-f\d]{24})(?:_v(\d+))?$/i
    );

    if (!match) {
        throw new Error("Invalid document name");
    }

    const collaborationVersion = Number(match[2] || 0);
    if (!Number.isSafeInteger(collaborationVersion)) {
        throw new Error("Invalid collaboration version");
    }
    return { documentId: match[1], collaborationVersion };
};

const assertCurrentSession = (document, collaborationVersion) => {
    if ((document.collaborationVersion ?? 0) !== collaborationVersion) {
        throw new Error("Document was restored. Reload to join the current collaboration session.");
    }
};

const activeRooms = new Map();
let permissionTimer;
let checkingPermissions = false;

const closeForPermissions = (connection) => {
    connection.readOnly = true;
    connection.close({ code: 1008, reason: "Document access changed. Reload the document." });
};

const applyCurrentPermissions = (connection, document, collaborationVersion) => {
    if (!document || !connection.context?.userId) {
        throw new Error("Document access is no longer available");
    }
    assertCurrentSession(document, collaborationVersion);
    const access = getDocumentAccess(document, connection.context.userId);
    if (!access.hasAccess) throw new Error("Document access was revoked");
    connection.readOnly = !access.canEdit;
    connection.context.role = access.role;
};

const revalidateConnection = async ({ documentName, connection }) => {
    const { documentId, collaborationVersion } = getDocumentSession(documentName);
    try {
        const document = await Document.findById(documentId).select("owner collaborators collaborationVersion");
        applyCurrentPermissions(connection, document, collaborationVersion);
    } catch (error) {
        closeForPermissions(connection);
        throw error;
    }
};

// Idle clients must also be revoked, even when they send no more messages.
const refreshActivePermissions = async () => {
    if (checkingPermissions) return;
    checkingPermissions = true;
    try {
        await Promise.all([...activeRooms].map(async ([documentName, connections]) => {
            const { documentId, collaborationVersion } = getDocumentSession(documentName);
            try {
                const document = await Document.findById(documentId).select("owner collaborators collaborationVersion");
                for (const connection of [...connections]) {
                    try { applyCurrentPermissions(connection, document, collaborationVersion); }
                    catch { closeForPermissions(connection); }
                }
            } catch {
                for (const connection of [...connections]) closeForPermissions(connection);
            }
        }));
    } finally {
        checkingPermissions = false;
    }
};

const stopPermissionChecks = () => {
    clearInterval(permissionTimer);
    permissionTimer = undefined;
};

const createYjsDocument = (content) => {
    const contentJson = generateJSON(
        content || "",
        editorExtensions
    );

    return TiptapTransformer.toYdoc(
        contentJson,
        "default",
        editorExtensions
    );
};

const collaborationServer = new Server({
    port: COLLABORATION_PORT,

    debounce: 250,

    maxDebounce: 1000,

    async onAuthenticate({
        token,
        documentName,
        connectionConfig
    }) {
        if (!token) {
            throw new Error(
                "Authentication required"
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        const user = await User.findById(
            decoded.userId
        ).select("-password");

        if (!user) {
            throw new Error(
                "User not found"
            );
        }

        const { documentId, collaborationVersion } = getDocumentSession(documentName);

        const document =
            await Document.findById(
                documentId
            );

        if (!document) {
            throw new Error(
                "Document not found"
            );
        }

        assertCurrentSession(document, collaborationVersion);
        const { hasAccess, role } = getDocumentAccess(document, user._id);

        if (!hasAccess) {
            throw new Error(
                "You do not have access to this document"
            );
        }

        connectionConfig.readOnly = role === "viewer";

        console.log(
            `Collaboration authenticated: ${user.email}`
        );

        console.log(
            `Document: ${documentId}`
        );

        console.log(
            `Role: ${role}`
        );

        return {
            userId:
                user._id.toString(),
            documentId,
            role
        };
    },

    async connected({ documentName, connection }) {
        let connections = activeRooms.get(documentName);
        if (!connections) {
            connections = new Set();
            activeRooms.set(documentName, connections);
        }
        connections.add(connection);
        connection.onClose(() => {
            connections.delete(connection);
            if (!connections.size) activeRooms.delete(documentName);
            if (!activeRooms.size) stopPermissionChecks();
        });
        if (!permissionTimer) {
            permissionTimer = setInterval(() =>
                refreshActivePermissions().catch((error) => console.error("Permission check failed:", error)), 1000);
            permissionTimer.unref();
        }
        // Covers a permission change between authentication and connection setup.
        await revalidateConnection({ documentName, connection });
    },

    beforeHandleMessage: revalidateConnection,

    async onDestroy() {
        stopPermissionChecks();
        activeRooms.clear();
    },

    async onLoadDocument({ documentName }) {
        const { documentId, collaborationVersion } = getDocumentSession(documentName);

        const document = await Document.findById(
            documentId
        ).select("+yjsState");

        if (!document) {
            throw new Error("Document not found");
        }

        assertCurrentSession(document, collaborationVersion);
        if (document.yjsState) {
            const ydoc = new Y.Doc();

            Y.applyUpdate(
                ydoc,
                Buffer.from(
                    document.yjsState,
                    "base64"
                )
            );

            return ydoc;
        }

        return createYjsDocument(document.content);
    },

    async onStoreDocument({
        document,
        documentName
    }) {
        const { documentId, collaborationVersion } = getDocumentSession(documentName);

        const contentJson =
            TiptapTransformer.fromYdoc(
                document,
                "default"
            );

        // Check the epoch in the write itself: a restore can race a queued save.
        // Legacy documents without an epoch are treated as version zero only.
        await Document.updateOne(
            {
                _id: documentId,
                ...(collaborationVersion === 0
                    ? { $or: [{ collaborationVersion: 0 }, { collaborationVersion: { $exists: false } }] }
                    : { collaborationVersion })
            },
            {
                $set: {
                    content: generateHTML(
                        contentJson,
                        editorExtensions
                    ),
                    yjsState: Buffer.from(
                        Y.encodeStateAsUpdate(document)
                    ).toString("base64")
                }
            }
        );
    },

    async onConnect({
        documentName
    }) {
        console.log(
            `Collaboration connected: ${documentName}`
        );
    },

    async onDisconnect({
        documentName,
        context
    }) {
        console.log(
            `Collaboration disconnected: ${documentName} User: ${context?.userId}`
        );
    }
});

module.exports = collaborationServer;
