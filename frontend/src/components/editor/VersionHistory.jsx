import { useEffect, useState } from "react";
import api from "../../services/api";

function VersionHistory({
    documentId,
    onClose,
    onRestored
}) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [restoreVersion, setRestoreVersion] = useState(null);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/documents/${documentId}/versions`
                );

                setVersions(response.data.data || []);
            } catch (error) {
                console.log(error.response?.data || error);

                setError(
                    error.response?.data?.message ||
                    "Failed to load version history"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchVersions();
    }, [documentId]);

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        return new Date(date).toLocaleString([], {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    };

    const handleVersionClick = (version) => {
        setSelectedVersion(version);
    };

    const closePreview = () => {
        setSelectedVersion(null);
    };

    const handleRestore = async () => {
        if (!restoreVersion || restoring) {
            return;
        }

        try {
            setRestoring(true);
            setError("");

            await api.post(
                `/documents/${documentId}/versions/${restoreVersion._id}/restore`
            );

            setRestoreVersion(null);
            setSelectedVersion(null);

            if (onRestored) {
                await onRestored();
            }

            onClose();
        } catch (error) {
            console.log(error.response?.data || error);

            setError(
                error.response?.data?.message ||
                "Failed to restore version"
            );

            setRestoreVersion(null);
        } finally {
            setRestoring(false);
        }
    };

    return (
        <>
            {/* Version History Drawer */}

            <div className="fixed inset-0 z-[100]">
                <div
                    className="absolute inset-0 bg-black/30 backdrop-blur-[2px] dark:bg-black/60"
                    onClick={onClose}
                />

                <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">

                    {/* Header */}

                    <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                Version history
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Previous saved versions
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                            aria-label="Close version history"
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}

                    <div className="min-h-0 flex-1 overflow-y-auto p-4">

                        {loading && (
                            <div className="flex min-h-40 items-center justify-center">
                                <div className="text-center">
                                    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500" />

                                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                        Loading history...
                                    </p>
                                </div>
                            </div>
                        )}

                        {!loading && error && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                            </div>
                        )}

                        {!loading &&
                            !error &&
                            versions.length === 0 && (
                                <div className="flex min-h-40 items-center justify-center">
                                    <div className="text-center">
                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-lg dark:bg-gray-800">
                                            🕘
                                        </div>

                                        <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                                            No versions yet
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                            Saved versions will appear here.
                                        </p>
                                    </div>
                                </div>
                            )}

                        {!loading &&
                            !error &&
                            versions.length > 0 && (
                                <div className="space-y-2">

                                    {versions.map(
                                        (version, index) => {
                                            const createdBy =
                                                version.createdBy;

                                            const name =
                                                createdBy?.name ||
                                                createdBy?.email ||
                                                "User";

                                            const initial =
                                                name
                                                    .charAt(0)
                                                    .toUpperCase();

                                            const isLatest =
                                                index === 0;

                                            return (
                                                <div
                                                    key={version._id}
                                                    onClick={() =>
                                                        handleVersionClick(
                                                            version
                                                        )
                                                    }
                                                    className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/30"
                                                >
                                                    <div className="flex items-start gap-3">

                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                                                            {initial}
                                                        </div>

                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                    Version{" "}
                                                                    {version.version}
                                                                </p>

                                                                {isLatest && (
                                                                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                                                                        Latest
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                Saved by {name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                                                {formatDate(
                                                                    version.createdAt
                                                                )}
                                                            </p>

                                                        </div>

                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}

                                </div>
                            )}

                    </div>

                    {/* Footer */}

                    {!loading &&
                        !error &&
                        versions.length > 0 && (
                            <div className="shrink-0 border-t border-gray-200 px-5 py-3 dark:border-gray-800">
                                <p className="text-center text-[11px] text-gray-400 dark:text-gray-500">
                                    Showing the latest{" "}
                                    {versions.length} saved version
                                    {versions.length !== 1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>
                        )}

                </aside>
            </div>

            {/* Large Version Preview */}

            {selectedVersion && (
                <div
                    className="fixed inset-0 z-[150] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[2px] sm:p-6 lg:p-10 dark:bg-black/45"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closePreview();
                        }
                    }}
                >
                    <div className="flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">

                        {/* Preview Header */}

                        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">

                            <div className="flex min-w-0 items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                    ↶
                                </div>

                                <div className="min-w-0">

                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                            Version{" "}
                                            {
                                                selectedVersion.version
                                            }
                                        </h2>

                                        {selectedVersion.version ===
                                            versions[0]?.version && (
                                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                                                Latest
                                            </span>
                                        )}
                                    </div>

                                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                        Saved by{" "}
                                        {selectedVersion.createdBy
                                            ?.name ||
                                            selectedVersion.createdBy
                                                ?.email ||
                                            "User"}{" "}
                                        ·{" "}
                                        {formatDate(
                                            selectedVersion.createdAt
                                        )}
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={closePreview}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                                aria-label="Close preview"
                            >
                                ×
                            </button>

                        </div>

                        {/* Document Preview */}

                        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-100 px-4 py-6 dark:bg-gray-950 sm:px-8 sm:py-8 lg:px-12">

                            <div className="mx-auto min-h-full w-full max-w-4xl rounded-xl border border-gray-200 bg-white px-8 py-10 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:px-12 lg:px-16">

                                <div
                                    className="tiptap-editor text-gray-900 dark:text-gray-100"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            selectedVersion.content ||
                                            "<p>No content available.</p>"
                                    }}
                                />

                            </div>

                        </div>

                        {/* Preview Footer */}

                        <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">

                            <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
                                You are viewing a previous saved version.
                            </p>

                            <div className="ml-auto flex items-center gap-2">

                                <button
                                    type="button"
                                    onClick={closePreview}
                                    className="h-10 rounded-lg px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    Close
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setRestoreVersion(
                                            selectedVersion
                                        )
                                    }
                                    className="h-10 rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                >
                                    Restore this version
                                </button>

                            </div>

                        </div>

                    </div>
                </div>
            )}

            {/* Restore Confirmation */}

            {restoreVersion && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] dark:bg-black/60"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setRestoreVersion(null);
                        }
                    }}
                >
                    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">

                        <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                ↶
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Restore Version{" "}
                                    {restoreVersion.version}?
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                    Your current document will be replaced with this saved version.
                                </p>
                            </div>

                        </div>

                        <div className="mt-5 flex justify-end gap-2">

                            <button
                                type="button"
                                disabled={restoring}
                                onClick={() =>
                                    setRestoreVersion(null)
                                }
                                className="h-9 rounded-lg px-4 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={restoring}
                                onClick={handleRestore}
                                className="h-9 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {restoring
                                    ? "Restoring..."
                                    : "Restore"}
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

export default VersionHistory;