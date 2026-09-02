import { useState } from "react";
import api from "../../services/api";

function CollaboratorList({
    documentId,
    collaborators = [],
    onUpdate,
    onClose
}) {
    const [message, setMessage] =
        useState("");

    const updateRole = async (
        collaboratorId,
        role
    ) => {
        try {
            await api.patch(
                `/documents/${documentId}/collaborators/${collaboratorId}`,
                {
                    role
                }
            );

            setMessage(
                "Role updated successfully"
            );

            onUpdate?.();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to update role"
            );
        }
    };

    const removeCollaborator = async (
        collaboratorId
    ) => {
        try {
            await api.delete(
                `/documents/${documentId}/collaborators/${collaboratorId}`
            );

            setMessage(
                "Collaborator removed"
            );

            onUpdate?.();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to remove collaborator"
            );
        }
    };

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xl transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 sm:p-6">

            <div className="mb-5 flex items-center justify-between pr-10">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg dark:bg-indigo-950/60">
                        👥
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Collaborators
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            Manage document access
                        </p>
                    </div>

                </div>

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {collaborators.length}
                </span>

            </div>

            {collaborators.length === 0 ? (

                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center dark:border-gray-700">

                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        No collaborators yet
                    </p>

                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        Share this document to
                        invite someone.
                    </p>

                </div>

            ) : (

                <div className="space-y-2">

                    {collaborators.map(
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
                                "Collaborator";

                            const email =
                                user.email || "";

                            const initial =
                                name
                                    .charAt(0)
                                    .toUpperCase();

                            return (
                                <div
                                    key={userId}
                                    className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 transition-colors dark:border-gray-800 dark:bg-gray-800 sm:flex-row sm:items-center"
                                >

                                    <div className="flex min-w-0 flex-1 items-center gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                            {initial}
                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                {name}
                                            </p>

                                            {email && (
                                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                    {email}
                                                </p>
                                            )}

                                        </div>

                                    </div>

                                    <div className="flex items-center gap-2">

                                        <select
                                            value={
                                                collaborator.role ||
                                                "editor"
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateRole(
                                                    userId,
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
                                        >
                                            <option value="editor">
                                                Editor
                                            </option>

                                            <option value="viewer">
                                                Viewer
                                            </option>
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeCollaborator(
                                                    userId
                                                )
                                            }
                                            className="h-9 rounded-lg px-3 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                                        >
                                            Remove
                                        </button>

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>

            )}

            {message && (
                <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {message}
                </p>
            )}

        </section>
    );
}

export default CollaboratorList;