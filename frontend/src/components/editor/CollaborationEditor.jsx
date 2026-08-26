import { useEffect, useRef } from "react";
import {
    useEditor
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import socket from "../../socket/socket";
import EditorToolbar from "./EditorToolbar";
import EditorContentArea from "./EditorContentArea";

function CollaborationEditor({
    documentId,
    content,
    userRole
}) {
    const isReceivingUpdate =
        useRef(false);

    const updateTimeout =
        useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit
        ],

        content: content || "",

        immediatelyRender: false,

        editable:
            userRole !== "viewer",

        editorProps: {
            attributes: {
                class: "outline-none border-none shadow-none focus:outline-none focus:border-none focus:ring-0"
            }
        },

        onUpdate: ({ editor }) => {
            if (
                isReceivingUpdate.current ||
                userRole === "viewer"
            ) {
                return;
            }

            if (updateTimeout.current) {
                clearTimeout(
                    updateTimeout.current
                );
            }

            updateTimeout.current =
                setTimeout(() => {
                    socket.emit(
                        "document-change",
                        {
                            documentId,
                            content:
                                editor.getHTML()
                        }
                    );
                }, 50);
        }
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        editor.setEditable(
            userRole !== "viewer"
        );
    }, [editor, userRole]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        const handleDocumentUpdate =
            (data) => {
                if (
                    data.documentId &&
                    data.documentId !==
                    documentId
                ) {
                    return;
                }

                isReceivingUpdate.current =
                    true;

                editor.commands.setContent(
                    data.content || "",
                    false
                );

                isReceivingUpdate.current =
                    false;
            };

        socket.on(
            "document-update",
            handleDocumentUpdate
        );

        return () => {
            socket.off(
                "document-update",
                handleDocumentUpdate
            );
        };
    }, [editor, documentId]);

    useEffect(() => {
        return () => {
            if (updateTimeout.current) {
                clearTimeout(
                    updateTimeout.current
                );
            }

            editor?.destroy();
        };
    }, [editor]);

    if (!editor) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <p className="text-sm text-gray-400">
                    Loading editor...
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden">
            <EditorToolbar
                editor={editor}
            />

            <EditorContentArea
                editor={editor}
                userRole={userRole}
            />
        </div>
    );
}

export default CollaborationEditor;