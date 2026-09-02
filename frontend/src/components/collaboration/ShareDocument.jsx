import { useState } from "react";
import api from "../../services/api";

function ShareDocument({
    documentId,
    collaborators = [],
    onViewCollaborators
}) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("editor");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const visibleCollaborators =
        collaborators.slice(0, 3);

    const remainingCount =
        Math.max(
            collaborators.length - 3,
            0
        );

    const shareDocument = async () => {
        if (!email.trim()) {
            setMessage("Enter a user email");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            await api.post(
                `/documents/${documentId}/share`,
                {
                    email: email.trim(),
                    role
                }
            );

            setMessage(
                "Document shared successfully"
            );

            setEmail("");
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to share document"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 sm:p-6">

            <div className="mb-5 flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg dark:bg-indigo-950/60">
                        ↗
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Share document
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            Invite people to collaborate
                        </p>
                    </div>

                </div>

                {collaborators.length > 0 && (
                    <button
                        type="button"
                        onClick={onViewCollaborators}
                        className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/50"
                        title="View collaborators"
                    >

                        <div className="flex -space-x-2">

                            {visibleCollaborators.map(
                                (collaborator) => {
                                    const user =
                                        collaborator.user ||
                                        collaborator;

                                    const userId =
                                        user._id ||
                                        collaborator._id;

                                    const name =
                                        user.name ||
                                        user.username ||
                                        user.email ||
                                        "User";

                                    const initial =
                                        name
                                            .charAt(0)
                                            .toUpperCase();

                                    return (
                                        <div
                                            key={userId}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-[11px] font-semibold text-indigo-700 dark:border-gray-800 dark:bg-indigo-950 dark:text-indigo-300"
                                            title={name}
                                        >
                                            {initial}
                                        </div>
                                    );
                                }
                            )}

                            {remainingCount > 0 && (
                                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    +{remainingCount}
                                </div>
                            )}

                        </div>

                        <span className="hidden text-xs font-semibold text-gray-600 dark:text-gray-300 sm:block">
                            View
                        </span>

                        <span className="text-gray-400 dark:text-gray-500">
                            →
                        </span>

                    </button>
                )}

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

                <div className="relative min-w-0 flex-1">

                    <input
                        type="email"
                        placeholder="Enter user's email"
                        value={email}
                        onChange={(event) =>
                            setEmail(
                                event.target.value
                            )
                        }
                        onKeyDown={(event) => {
                            if (
                                event.key ===
                                "Enter"
                            ) {
                                shareDocument();
                            }
                        }}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
                    />

                </div>

                <select
                    value={role}
                    onChange={(event) =>
                        setRole(
                            event.target.value
                        )
                    }
                    className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
                >
                    <option value="editor">
                        Can edit
                    </option>

                    <option value="viewer">
                        Can view
                    </option>
                </select>

                <button
                    type="button"
                    onClick={shareDocument}
                    disabled={loading}
                    className="h-11 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? "Sharing..."
                        : "Share"}
                </button>

            </div>

            {message && (
                <div
                    className={`mt-4 rounded-lg px-3 py-2.5 text-sm ${
                        message.includes(
                            "successfully"
                        )
                            ? "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
                            : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                    }`}
                >
                    {message}
                </div>
            )}

        </section>
    );
}

export default ShareDocument;