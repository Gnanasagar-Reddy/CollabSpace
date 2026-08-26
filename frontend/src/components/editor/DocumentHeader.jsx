import { useEffect } from "react";

function DocumentHeader({
    title,
    role,
    editingTitle,
    newTitle,
    setNewTitle,
    startRename,
    renameDocument,
    cancelRename,
    renameMessage,
    deleteDocument,
    deleting,
    onSave,
    saving,
    onBack
}) {
    useEffect(() => {
        if (!editingTitle) {
            return;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                cancelRename();
            }

            if (event.key === "Enter") {
                renameDocument();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        editingTitle,
        renameDocument,
        cancelRename
    ]);

    return (
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex min-h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <div className="min-w-0 flex-1">
                    {editingTitle ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                type="text"
                                value={newTitle}
                                autoFocus
                                onChange={(event) =>
                                    setNewTitle(
                                        event.target.value
                                    )
                                }
                                className="h-10 min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 sm:max-w-md"
                            />

                            <button
                                type="button"
                                onClick={renameDocument}
                                className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Save
                            </button>

                            <button
                                type="button"
                                onClick={cancelRename}
                                className="h-10 rounded-lg px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                            >
                                Cancel
                            </button>

                            {renameMessage && (
                                <p className="w-full text-xs text-red-500">
                                    {renameMessage}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex min-w-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                                title="Back"
                            >
                                ←
                            </button>

                            <div className="h-6 w-px bg-gray-200" />

                            <h1
                                title={title}
                                className="truncate text-base font-semibold text-gray-900 sm:text-lg"
                            >
                                {title ||
                                    "Untitled Document"}
                            </h1>

                            {role === "owner" && (
                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={startRename}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                        title="Rename document"
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        type="button"
                                        onClick={deleteDocument}
                                        disabled={deleting}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Delete document"
                                    >
                                        {deleting
                                            ? "..."
                                            : "🗑️"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!editingTitle && (
                    <div className="flex shrink-0 items-center gap-2">
                        <div className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                            {role === "owner"
                                ? "Owner"
                                : role === "editor"
                                ? "Editor"
                                : "Viewer"}
                        </div>

                        {role !== "viewer" && (
                            <button
                                type="button"
                                onClick={onSave}
                                disabled={saving}
                                className="flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <span>✓</span>
                                        Save
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

export default DocumentHeader;