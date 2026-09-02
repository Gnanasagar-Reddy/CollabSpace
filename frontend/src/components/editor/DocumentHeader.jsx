import {
    useContext,
    useEffect,
    useState
} from "react";
import { AuthContext } from "../../context/AuthContext";

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
    onBack,
    onShare,
    onShowCollaborators,
    onShowHistory
}) {
    const { user } =
        useContext(AuthContext);

    const [profileOpen, setProfileOpen] =
        useState(false);

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

    /*
     * Get the actual logged-in user's name
     *
     * Depending on your backend response,
     * the name may be in user.name or user.username.
     */
    const userName =
        user?.name ||
        user?.username ||
        user?.email ||
        "User";

    const userInitial =
        userName
            .trim()
            .charAt(0)
            .toUpperCase();

    /*
     * Close profile menu when clicking anywhere
     * outside the profile button/menu.
     */
    useEffect(() => {
        if (!profileOpen) {
            return;
        }

        const handleClickAway = (event) => {
            const profileArea =
                document.getElementById(
                    "document-profile-area"
                );

            if (
                profileArea &&
                !profileArea.contains(
                    event.target
                )
            ) {
                setProfileOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickAway
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickAway
            );
        };
    }, [profileOpen]);

    return (
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur transition-colors duration-200 dark:border-gray-800 dark:bg-gray-950/95">

            <div className="mx-auto flex min-h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

                {/* LEFT SIDE */}

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
                                className="h-10 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
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
                                className="h-10 rounded-lg px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                                title="Back"
                            >
                                ←
                            </button>

                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />

                            <h1
                                title={title}
                                className="truncate text-base font-semibold text-gray-900 dark:text-white sm:text-lg"
                            >
                                {title ||
                                    "Untitled Document"}
                            </h1>

                            {role === "owner" && (
                                <div className="flex shrink-0 items-center gap-1">

                                    <button
                                        type="button"
                                        onClick={startRename}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                                        title="Rename document"
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        type="button"
                                        onClick={deleteDocument}
                                        disabled={deleting}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
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

                {/* RIGHT SIDE */}

                {!editingTitle && (

                    <div className="relative flex shrink-0 items-center gap-3">

                        {/* SAVE */}

                        {role !== "viewer" && (
                            <button
                                type="button"
                                onClick={onSave}
                                disabled={saving}
                                className="flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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

                        {/* PROFILE */}

                        <div
                            id="document-profile-area"
                            className="relative"
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setProfileOpen(
                                        (prev) => !prev
                                    )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-sm ring-2 ring-indigo-100 transition hover:bg-indigo-700 hover:ring-indigo-200 dark:bg-indigo-500 dark:ring-indigo-950 dark:hover:bg-indigo-400"
                                title={userName}
                                aria-label="Account options"
                            >
                                {userInitial}
                            </button>

                            {/* PROFILE MENU */}

                            {profileOpen && (

                                <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900">

                                    {/* USER INFO */}

                                    <div className="mb-2 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3 dark:bg-gray-800">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white dark:bg-indigo-500">
                                            {userInitial}
                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                {userName}
                                            </p>

                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                {role === "owner"
                                                    ? "Owner"
                                                    : role === "editor"
                                                        ? "Editor"
                                                        : "Viewer"}
                                            </p>

                                        </div>

                                    </div>

                                    {/* OWNER OPTIONS */}

                                    {role === "owner" && (
                                        <>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProfileOpen(
                                                        false
                                                    );

                                                    onShowHistory();
                                                }}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                            >
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300">
                                                    ↶
                                                </span>

                                                <span>
                                                    History
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProfileOpen(
                                                        false
                                                    );

                                                    onShare();
                                                }}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                            >
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-300">
                                                    ↗
                                                </span>

                                                <span>
                                                    Share
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProfileOpen(
                                                        false
                                                    );

                                                    onShowCollaborators();
                                                }}
                                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                            >
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/70 dark:text-sky-300">
                                                    👥
                                                </span>

                                                <span>
                                                    Members
                                                </span>
                                            </button>

                                        </>
                                    )}

                                </div>
                            )}

                        </div>

                    </div>
                )}

            </div>
        </header>
    );
}

export default DocumentHeader;