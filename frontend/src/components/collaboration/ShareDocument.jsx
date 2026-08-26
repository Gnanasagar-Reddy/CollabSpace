import { useState } from "react";
import api from "../../services/api";

function ShareDocument({ documentId }) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("editor");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                        ↗
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Share document
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                            Invite people to collaborate
                        </p>
                    </div>
                </div>
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
                        className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />
                </div>

                <select
                    value={role}
                    onChange={(event) =>
                        setRole(
                            event.target.value
                        )
                    }
                    className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
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
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                    }`}
                >
                    {message}
                </div>
            )}
        </section>
    );
}

export default ShareDocument;