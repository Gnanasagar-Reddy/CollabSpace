import {
    useEffect,
    useMemo,
    useRef
} from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-text-style";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import EditorToolbar from "./EditorToolbar";
import EditorContentArea from "./EditorContentArea";

function CollaborationEditor({
    documentId,
    userRole,
    onSaveReady,
    collaborationVersion = 0
}) {
    const ydoc = useMemo(
        () => new Y.Doc(),
        [documentId]
    );

    const teardownTimers = useRef(
        new Map()
    );

    const provider = useMemo(
        () => new HocuspocusProvider({
            url:
                import.meta.env.VITE_COLLABORATION_URL ||
                "ws://localhost:1234",
            name:
                `document_${documentId}_v` +
                collaborationVersion,
            document: ydoc,
            token: () =>
                localStorage.getItem("accessToken")
        }),
        [
            documentId,
            ydoc,
            collaborationVersion
        ]
    );

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: false,
                underline: false,
                undoRedo: false
            }),

            Collaboration.configure({
                document: ydoc
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

            Placeholder.configure({
                placeholder: "Start writing, or choose a tool above…"
            }),

            CharacterCount.configure({
                limit: 200000
            }),

            Table.configure({
                resizable: true
            }),

            TableRow,
            TableHeader,
            TableCell
        ],

        immediatelyRender: false,

        editable:
            userRole !== "viewer",

        editorProps: {
            attributes: {
                class: "tiptap-editor"
            }
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
        const flushCollaborationSave = async () => {
            provider.forceSync();

            await new Promise((resolve) => {
                setTimeout(resolve, 350);
            });
        };

        onSaveReady(flushCollaborationSave);

        return () => {
            onSaveReady(null);
        };
    }, [
        onSaveReady,
        provider
    ]);

    useEffect(() => {
        const pendingTeardown =
            teardownTimers.current.get(provider);

        if (pendingTeardown) {
            clearTimeout(pendingTeardown);
            teardownTimers.current.delete(provider);
        }

        return () => {
            const teardownTimer = setTimeout(() => {
                provider.destroy();
                ydoc.destroy();
                teardownTimers.current.delete(provider);
            }, 0);

            teardownTimers.current.set(
                provider,
                teardownTimer
            );
        };
    }, [
        provider,
        ydoc
    ]);

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
                    userRole={userRole}
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
