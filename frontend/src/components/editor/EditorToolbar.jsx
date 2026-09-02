import { useEffect, useState } from "react";

function EditorToolbar({ editor }) {
    const [, forceUpdate] = useState(0);

    useEffect(() => {
        if (!editor) {
            return;
        }

        const updateToolbar = () => {
            forceUpdate((value) => value + 1);
        };

        editor.on("transaction", updateToolbar);
        editor.on("selectionUpdate", updateToolbar);

        return () => {
            editor.off("transaction", updateToolbar);
            editor.off("selectionUpdate", updateToolbar);
        };
    }, [editor]);

    if (!editor) {
        return null;
    }

    const buttonClass = (active) =>
        `flex h-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition ${
            active
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`;

    const disabledClass =
        "cursor-not-allowed opacity-30 hover:bg-transparent hover:text-gray-300";

    const divider = (
        <div className="mx-1 h-6 w-px bg-gray-700" />
    );

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-700 bg-gray-900 px-3 py-2">

            {/* Undo */}

            <button
                type="button"
                className={`${buttonClass(false)} ${
                    !editor.can().undo()
                        ? disabledClass
                        : ""
                }`}
                onClick={() => {
                    editor
                        .chain()
                        .focus()
                        .undo()
                        .run();
                }}
                disabled={!editor.can().undo()}
                title="Undo"
            >
                ↶
            </button>

            {/* Redo */}

            <button
                type="button"
                className={`${buttonClass(false)} ${
                    !editor.can().redo()
                        ? disabledClass
                        : ""
                }`}
                onClick={() => {
                    editor
                        .chain()
                        .focus()
                        .redo()
                        .run();
                }}
                disabled={!editor.can().redo()}
                title="Redo"
            >
                ↷
            </button>

            {divider}

            {/* Headings */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("heading", {
                        level: 1
                    })
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleHeading({
                            level: 1
                        })
                        .run()
                }
                title="Heading 1"
            >
                H1
            </button>

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("heading", {
                        level: 2
                    })
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleHeading({
                            level: 2
                        })
                        .run()
                }
                title="Heading 2"
            >
                H2
            </button>

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("heading", {
                        level: 3
                    })
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleHeading({
                            level: 3
                        })
                        .run()
                }
                title="Heading 3"
            >
                H3
            </button>

            {divider}

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

            {/* Underline */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("underline")
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleUnderline()
                        .run()
                }
                title="Underline"
            >
                <u>U</u>
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
                title="Strikethrough"
            >
                <s>S</s>
            </button>

            {divider}

            {/* Bullet list */}

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
                title="Bullet list"
            >
                • List
            </button>

            {/* Ordered list */}

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
                title="Numbered list"
            >
                1. List
            </button>

            {/* Task list */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("taskList")
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleTaskList()
                        .run()
                }
                title="Task list"
            >
                ☑ Task
            </button>

            {divider}

            {/* Blockquote */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("blockquote")
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleBlockquote()
                        .run()
                }
                title="Blockquote"
            >
                ❝
            </button>

            {/* Inline code */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("code")
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleCode()
                        .run()
                }
                title="Inline code"
            >
                {"</>"}
            </button>

            {/* Code block */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("codeBlock")
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleCodeBlock()
                        .run()
                }
                title="Code block"
            >
                Code
            </button>

            {divider}

            {/* Align left */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive({
                        textAlign: "left"
                    })
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .setTextAlign("left")
                        .run()
                }
                title="Align left"
            >
                ≡
            </button>

            {/* Align center */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive({
                        textAlign: "center"
                    })
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .setTextAlign("center")
                        .run()
                }
                title="Align center"
            >
                ≡
            </button>

            {/* Align right */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive({
                        textAlign: "right"
                    })
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .setTextAlign("right")
                        .run()
                }
                title="Align right"
            >
                ≡
            </button>

            {divider}

            {/* Highlight */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("highlight")
                )}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleHighlight()
                        .run()
                }
                title="Highlight"
            >
                <span className="rounded bg-yellow-200 px-1 text-gray-900">
                    H
                </span>
            </button>

            {/* Text color */}

            <button
                type="button"
                className={buttonClass(false)}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .setColor("#ef4444")
                        .run()
                }
                title="Red text"
            >
                <span className="font-bold text-red-500">
                    A
                </span>
            </button>

            {/* Remove color */}

            <button
                type="button"
                className={buttonClass(false)}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .unsetColor()
                        .run()
                }
                title="Remove text color"
            >
                A
            </button>

            {divider}

            {/* Link */}

            <button
                type="button"
                className={buttonClass(
                    editor.isActive("link")
                )}
                onClick={() => {
                    const previousUrl =
                        editor.getAttributes(
                            "link"
                        ).href;

                    const url =
                        window.prompt(
                            "Enter URL",
                            previousUrl ||
                                "https://"
                        );

                    if (url === null) {
                        return;
                    }

                    if (url === "") {
                        editor
                            .chain()
                            .focus()
                            .unsetLink()
                            .run();

                        return;
                    }

                    editor
                        .chain()
                        .focus()
                        .setLink({
                            href: url
                        })
                        .run();
                }}
                title="Add link"
            >
                🔗
            </button>

            {/* Horizontal rule */}

            <button
                type="button"
                className={buttonClass(false)}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .setHorizontalRule()
                        .run()
                }
                title="Horizontal line"
            >
                ―
            </button>

            {divider}

            {/* Clear formatting */}

            <button
                type="button"
                className={buttonClass(false)}
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .clearNodes()
                        .unsetAllMarks()
                        .run()
                }
                title="Clear formatting"
            >
                Tx
            </button>
        </div>
    );
}

export default EditorToolbar;