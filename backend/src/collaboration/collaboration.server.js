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
const User = require("../modules/auth/user.model");
const Document = require("../modules/document/document.model");

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
    })
];

const getDocumentId = (documentName) => {
    const match = documentName.match(
        /^document_([a-f\d]{24})(?:_v\d+)?$/i
    );

    if (!match) {
        throw new Error("Invalid document name");
    }

    return match[1];
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
        connection
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

        const documentId = getDocumentId(documentName);

        const document =
            await Document.findById(
                documentId
            );

        if (!document) {
            throw new Error(
                "Document not found"
            );
        }

        const isOwner =
            document.owner.toString() ===
            user._id.toString();

        const collaborator =
            document.collaborators.find(
                (item) =>
                    item.user.toString() ===
                    user._id.toString()
            );

        if (
            !isOwner &&
            !collaborator
        ) {
            throw new Error(
                "You do not have access to this document"
            );
        }

        const role = isOwner
            ? "owner"
            : collaborator.role;

        if (role === "viewer") {
            connection.readOnly = true;
        }

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

    async onLoadDocument({ documentName }) {
        const documentId = getDocumentId(documentName);

        const document = await Document.findById(
            documentId
        ).select("+yjsState");

        if (!document) {
            throw new Error("Document not found");
        }

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
        const documentId = getDocumentId(documentName);

        const contentJson =
            TiptapTransformer.fromYdoc(
                document,
                "default"
            );

        await Document.findByIdAndUpdate(
            documentId,
            {
                content: generateHTML(
                    contentJson,
                    editorExtensions
                ),
                yjsState: Buffer.from(
                    Y.encodeStateAsUpdate(document)
                ).toString("base64")
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
