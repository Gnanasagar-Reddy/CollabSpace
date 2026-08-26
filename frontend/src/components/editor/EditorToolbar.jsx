function EditorToolbar({ editor }) {
    if (!editor) {
        return null;
    }

    const buttonClass = (active) => {
        return `flex h-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition ${
            active
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`;
    };

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-white px-3 py-2">
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

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <button
                type="button"
                className={buttonClass(
                    editor.isActive(
                        "bulletList"
                    )
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleBulletList()
                        .run()
                }
            >
                • List
            </button>

            <button
                type="button"
                className={buttonClass(
                    editor.isActive(
                        "orderedList"
                    )
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleOrderedList()
                        .run()
                }
            >
                1. List
            </button>

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
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

            <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
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