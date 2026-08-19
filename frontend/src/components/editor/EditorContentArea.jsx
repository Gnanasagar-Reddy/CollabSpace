import {
    EditorContent
} from "@tiptap/react";

function EditorContentArea({
    editor
}) {

    return (

        <main className="editor-workspace">

            <div className="document-page">

                <EditorContent
                    editor={editor}
                />

            </div>

        </main>

    );
}

export default EditorContentArea;