import { useState } from "react";
import api from "../../services/api";

function ShareDocument({
    documentId,
    onSuccess
}) {
    const [email, setEmail] =
        useState("");

    const [role, setRole] =
        useState("editor");

    const [message, setMessage] =
        useState("");

    const [sending, setSending] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const sendRequest = async () => {
        const cleanEmail =
            email.trim();

        if (!cleanEmail) {
            setError(
                "Please enter the user's email"
            );

            return;
        }

        try {
            setSending(true);
            setError("");
            setSuccess("");

            await api.post(
                `/documents/${documentId}/share-request`,
                {
                    email: cleanEmail,
                    role,
                    message
                }
            );

            setSuccess(
                "Collaboration request sent successfully"
            );

            setEmail("");
            setMessage("");
            setRole("editor");

            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            console.log(
                error.response?.data ||
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to send collaboration request"
            );

        } finally {
            setSending(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900">

            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Share document
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Send a collaboration request to another user.
                </p>
            </div>

            <div className="space-y-4">

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(
                                event.target.value
                            )
                        }
                        placeholder="user@example.com"
                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Permission
                    </label>

                    <select
                        value={role}
                        onChange={(event) =>
                            setRole(
                                event.target.value
                            )
                        }
                        className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    >
                        <option value="editor">
                            Editor
                        </option>

                        <option value="viewer">
                            Viewer
                        </option>
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Message
                    </label>

                    <textarea
                        value={message}
                        onChange={(event) =>
                            setMessage(
                                event.target.value
                            )
                        }
                        placeholder="Add a message..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />
                </div>

                {error && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400">
                        {success}
                    </div>
                )}

                <button
                    type="button"
                    onClick={sendRequest}
                    disabled={sending}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {sending ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                            Sending...
                        </>
                    ) : (
                        "Send request"
                    )}
                </button>

            </div>

        </div>
    );
}

export default ShareDocument;