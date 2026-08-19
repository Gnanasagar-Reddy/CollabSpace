function EditorToolbar({ editor }) {

    if (!editor) {
        return null;
    }


    const buttonClass = (active) => (
        `toolbar-btn ${active ? "active" : ""}`
    );


    return (

        <div className="editor-toolbar">


            {/* Bold */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("bold")
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleBold()
                        .run()
                }
                title="Bold"
            >
                <strong>B</strong>
            </button>


            {/* Italic */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("italic")
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleItalic()
                        .run()
                }
                title="Italic"
            >
                <em>I</em>
            </button>


            {/* Strike */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("strike")
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleStrike()
                        .run()
                }
                title="Strike"
            >
                <s>S</s>
            </button>


            <div className="toolbar-divider" />


            {/* Bullet List */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("bulletList")
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleBulletList()
                        .run()
                }
                title="Bullet List"
            >
                • List
            </button>


            {/* Ordered List */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("orderedList")
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleOrderedList()
                        .run()
                }
                title="Numbered List"
            >
                1. List
            </button>


            <div className="toolbar-divider" />


            {/* Undo */}

            <button
                type="button"
                className="toolbar-icon-btn"
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .undo()
                        .run()
                }
                disabled={
                    !editor.can()
                        .chain()
                        .focus()
                        .undo()
                        .run()
                }
                title="Undo"
            >
                ↶
            </button>


            {/* Redo */}

            <button
                type="button"
                className="toolbar-icon-btn"
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .redo()
                        .run()
                }
                disabled={
                    !editor.can()
                        .chain()
                        .focus()
                        .redo()
                        .run()
                }
                title="Redo"
            >
                ↷
            </button>

        </div>

    );

}


export default EditorToolbar;