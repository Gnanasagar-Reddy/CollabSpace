import { useEffect, useState } from "react";
import { EditorContent } from "@tiptap/react";

function EditorContentArea({ editor, userRole }) {
    const [, refresh] = useState(0);

    useEffect(() => {
        if (!editor) return undefined;
        const update = () => refresh((value) => value + 1);
        editor.on("update", update);
        return () => editor.off("update", update);
    }, [editor]);

    const words = editor?.storage.characterCount?.words() || 0;
    const characters = editor?.storage.characterCount?.characters() || 0;

    return (
        <div className="editor-workspace">
            <div className="editor-page">
                <EditorContent
                    editor={editor}
                    className={userRole === "viewer" ? "pointer-events-none" : ""}
                />
            </div>
            <div className="editor-status-bar">
                <span>{userRole === "viewer" ? "View only" : "Changes sync automatically"}</span>
                <span>{words} {words === 1 ? "word" : "words"} · {characters} characters</span>
            </div>
            {characters > 200000 && (
                <p role="status" className="px-4 pb-3 text-sm text-amber-700 dark:text-amber-300">
                    This document exceeds the recommended 200,000 characters. Changes still sync, but editing may be slower.
                </p>
            )}
        </div>
    );
}

export default EditorContentArea;
