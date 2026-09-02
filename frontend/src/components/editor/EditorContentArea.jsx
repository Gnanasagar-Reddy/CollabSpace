import { EditorContent } from "@tiptap/react";

function EditorContentArea({
    editor,
    userRole
}) {
    return (
        <div className="min-h-[650px] bg-white px-6 py-8 transition-colors duration-200 dark:bg-gray-900 sm:px-10 sm:py-10 lg:px-14 lg:py-12">

            <EditorContent
                editor={editor}
                className={
                    userRole === "viewer"
                        ? "pointer-events-none"
                        : ""
                }
            />

        </div>
    );
}

export default EditorContentArea;