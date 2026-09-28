import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-text-style";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

function VersionPreview({ content }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: "https"
            }),
            Highlight.configure({ multicolor: true }),
            TextStyle,
            Color,
            TextAlign.configure({
                types: ["heading", "paragraph"]
            }),
            TaskList,
            TaskItem.configure({ nested: true })
        ],
        content: content || "<p>No content available.</p>",
        editable: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "tiptap-editor text-gray-900 dark:text-gray-100"
            }
        }
    });

    if (!editor) {
        return null;
    }

    return <EditorContent editor={editor} />;
}

export default VersionPreview;
