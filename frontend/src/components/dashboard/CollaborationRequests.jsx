import { useEffect, useState } from "react";

function CollaborationRequests({
    requests,
    loading,
    open,
    onClose,
    onAccept,
    onReject
}) {
    const [selectedRequest, setSelectedRequest] =
        useState(null);

    useEffect(() => {
        if (!open) {
            setSelectedRequest(null);
            return;
        }

        if (
            selectedRequest &&
            !requests.some(
                (request) =>
                    request._id === selectedRequest._id
            )
        ) {
            setSelectedRequest(null);
        }
    }, [
        open,
        requests,
        selectedRequest
    ]);

    const handleAccept = async () => {
        if (!selectedRequest) {
            return;
        }

        const success = await onAccept(
            selectedRequest._id
        );

        if (success) {
            setSelectedRequest(null);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) {
            return;
        }

        const success = await onReject(
            selectedRequest._id
        );

        if (success) {
            setSelectedRequest(null);
        }
    };

    if (!open) {
        return null;
    }

    return (
        <>
            {/* BACKDROP */}

            <div
                className="fixed inset-0 z-[100] bg-black/25 backdrop-blur-[1px] dark:bg-black/50"
                onMouseDown={(event) => {
                    if (
                        event.target ===
                        event.currentTarget
                    ) {
                        onClose();
                    }
                }}
            />

            {/* RIGHT DRAWER */}

            <aside className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">

                {/* HEADER */}

                <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-800">

                    <div className="flex items-center gap-3">

                        {selectedRequest && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedRequest(
                                        null
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                                title="Back to requests"
                            >
                                ←
                            </button>
                        )}

                        <div>

                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                {selectedRequest
                                    ? "Collaboration request"
                                    : "Requests"}
                            </h2>

                            {!selectedRequest && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {requests.length} pending request
                                    {requests.length !== 1
                                        ? "s"
                                        : ""}
                                </p>
                            )}

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        title="Close"
                    >
                        ×
                    </button>

                </div>

                {/* CONTENT */}

                <div className="flex-1 overflow-y-auto p-4">

                    {loading ? (

                        <div className="flex min-h-60 items-center justify-center">

                            <div className="text-center">

                                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500" />

                                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                    Loading requests...
                                </p>

                            </div>

                        </div>

                    ) : requests.length === 0 ? (

                        <div className="flex min-h-60 flex-col items-center justify-center text-center">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                ✓
                            </div>

                            <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                No pending requests
                            </p>

                            <p className="mt-1 max-w-xs text-xs leading-5 text-gray-400 dark:text-gray-500">
                                New collaboration requests will appear here.
                            </p>

                        </div>

                    ) : selectedRequest ? (

                        /* REQUEST DETAILS */

                        <div>

                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                                        {(
                                            selectedRequest
                                                .sender
                                                ?.name ||
                                            selectedRequest
                                                .sender
                                                ?.email ||
                                            "User"
                                        )
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div className="min-w-0">

                                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                            {selectedRequest
                                                .sender
                                                ?.name ||
                                                selectedRequest
                                                    .sender
                                                    ?.email ||
                                                "Someone"}
                                        </p>

                                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                            wants to collaborate with you
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* DOCUMENT */}

                            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">

                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    Document
                                </p>

                                <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                                    {selectedRequest
                                        .document
                                        ?.title ||
                                        "Untitled document"}
                                </p>

                            </div>

                            {/* MESSAGE */}

                            <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">

                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    Message
                                </p>

                                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                                    {selectedRequest.message ||
                                        "No message was added."}
                                </p>

                            </div>

                            {/* PERMISSION */}

                            <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">

                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    Permission
                                </p>

                                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                                    {selectedRequest.role ===
                                    "editor"
                                        ? "Editor — can edit the document"
                                        : "Viewer — can view the document"}
                                </p>

                            </div>

                            {/* ACTIONS */}

                            <div className="mt-6 flex gap-3">

                                <button
                                    type="button"
                                    onClick={handleReject}
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    No
                                </button>

                                <button
                                    type="button"
                                    onClick={handleAccept}
                                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                                >
                                    Yes
                                </button>

                            </div>

                        </div>

                    ) : (

                        /* REQUEST LIST */

                        <div className="space-y-3">

                            {requests.map(
                                (request) => {
                                    const sender =
                                        request.sender;

                                    const name =
                                        sender?.name ||
                                        sender?.email ||
                                        "User";

                                    const initial =
                                        name
                                            .charAt(
                                                0
                                            )
                                            .toUpperCase();

                                    return (
                                        <button
                                            key={
                                                request._id
                                            }
                                            type="button"
                                            onClick={() =>
                                                setSelectedRequest(
                                                    request
                                                )
                                            }
                                            className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/40 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/30"
                                        >

                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                                                {
                                                    initial
                                                }
                                            </div>

                                            <div className="min-w-0 flex-1">

                                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                    {
                                                        name
                                                    }{" "}
                                                    wants to collaborate
                                                </p>

                                                <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                                                    {request
                                                        .document
                                                        ?.title ||
                                                        "Untitled document"}
                                                </p>

                                                <div className="mt-2 flex items-center gap-2">

                                                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                                                        Pending
                                                    </span>

                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                                        {request.role ===
                                                        "editor"
                                                            ? "Editor"
                                                            : "Viewer"}
                                                    </span>

                                                </div>

                                            </div>

                                            <span className="shrink-0 text-gray-400 dark:text-gray-500">
                                                →
                                            </span>

                                        </button>
                                    );
                                }
                            )}

                        </div>

                    )}

                </div>

            </aside>
        </>
    );
}

export default CollaborationRequests;