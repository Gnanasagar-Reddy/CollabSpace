import { useEffect, useRef } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-text-style";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
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
            StarterKit,

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
        ],

        content: content || "",

        immediatelyRender: false,

        editable:
            userRole !== "viewer",

        editorProps: {
            attributes: {
                class: "tiptap-editor"
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
    }, [
        editor,
        userRole
    ]);

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
    }, [
        editor,
        documentId
    ]);

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
        <div className="overflow-visible">

            <div className="sticky top-16 z-20">
                <EditorToolbar
                    editor={editor}
                />
            </div>

            <EditorContentArea
                editor={editor}
                userRole={userRole}
            />

        </div>
    );
}

export default CollaborationEditor;