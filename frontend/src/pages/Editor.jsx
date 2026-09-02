import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import useDocument from "../hooks/useDocument";
import useDocumentSocket from "../hooks/useDocumentSocket";
import DocumentHeader from "../components/editor/DocumentHeader";
import CollaborationEditor from "../components/editor/CollaborationEditor";
import OnlineUsers from "../components/editor/OnlineUsers";
import ShareDocument from "../components/collaboration/ShareDocument";
import CollaboratorList from "../components/collaboration/CollaboratorList";
import ExitConfirmModal from "../components/editor/ExitConfirmModal";
import VersionHistory from "../components/editor/VersionHistory";


function Editor() {
    const { documentId } = useParams();
    const navigate = useNavigate();

    const {
        document,
        userRole,
        collaborators,
        loading,
        reload
    } = useDocument(documentId);

    const {
        onlineUsers
    } = useDocumentSocket(documentId);

    const [editingTitle, setEditingTitle] =
        useState(false);

    const [newTitle, setNewTitle] =
        useState("");

    const [renameMessage, setRenameMessage] =
        useState("");

    const [deleting, setDeleting] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [showExitModal, setShowExitModal] =
        useState(false);

    const [showShare, setShowShare] =
        useState(false);

    const [
        showCollaborators,
        setShowCollaborators
    ] = useState(false);

    const [showHistory, setShowHistory] =
        useState(false);

    const renameDocument = async () => {
        const title = newTitle.trim();

        if (!title) {
            setRenameMessage(
                "Document name cannot be empty"
            );

            return;
        }

        if (title === document.title) {
            setEditingTitle(false);
            return;
        }

        try {
            await api.put(
                `/documents/${documentId}`,
                {
                    title
                }
            );

            await reload();

            setEditingTitle(false);
            setNewTitle("");
            setRenameMessage("");
        } catch (error) {
            console.log(
                error.response?.data ||
                error
            );

            setRenameMessage(
                error.response?.data?.message ||
                "Failed to rename document"
            );
        }
    };

    const startRename = () => {
        setNewTitle(
            document.title || ""
        );

        setRenameMessage("");
        setEditingTitle(true);
    };

    const cancelRename = () => {
        setEditingTitle(false);
        setNewTitle("");
        setRenameMessage("");
    };

    const deleteDocument = async () => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this document?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);

            await api.delete(
                `/documents/${documentId}`
            );

            navigate("/dashboard");
        } catch (error) {
            console.log(
                error.response?.data ||
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete document"
            );
        } finally {
            setDeleting(false);
        }
    };

    const saveDocument = async () => {
        if (saving) {
            return;
        }

        try {
            setSaving(true);

            await api.post(
                `/documents/${documentId}/save`
            );

            navigate(
                "/dashboard",
                {
                    state: {
                        message:
                            "Document saved successfully"
                    }
                }
            );
        } catch (error) {
            console.log(
                error.response?.data ||
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to save document"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        setShowExitModal(true);
    };

    const exitWithoutSaving = async () => {
        try {
            await api.delete(
                `/documents/${documentId}/draft`
            );

            setShowExitModal(false);

            navigate("/dashboard");
        } catch (error) {
            console.log(
                error.response?.data ||
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to discard changes"
            );
        }
    };

    const saveAndExit = async () => {
        if (saving) {
            return;
        }

        try {
            setSaving(true);

            await api.post(
                `/documents/${documentId}/save`
            );

            navigate(
                "/dashboard",
                {
                    state: {
                        message:
                            "Document saved successfully"
                    }
                }
            );
        } catch (error) {
            console.log(
                error.response?.data ||
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to save document"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading || !document) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500" />

                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        Loading document...
                    </p>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 transition-colors duration-200 dark:bg-gray-950">

            <DocumentHeader
                title={document.title}
                role={userRole}
                collaborators={collaborators}
                editingTitle={editingTitle}
                newTitle={newTitle}
                setNewTitle={setNewTitle}
                startRename={startRename}
                renameDocument={renameDocument}
                cancelRename={cancelRename}
                renameMessage={renameMessage}
                deleteDocument={deleteDocument}
                deleting={deleting}
                onSave={saveDocument}
                saving={saving}
                onBack={handleBack}
                onShare={() =>
                    setShowShare(true)
                }
                onShowCollaborators={() =>
                    setShowCollaborators(true)
                }
                onShowHistory={() =>
                    setShowHistory(true)
                }
            />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">

                    <section className="min-w-0 overflow-visible rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

                        <CollaborationEditor
                            documentId={documentId}
                            content={document.content}
                            userRole={userRole}
                        />

                    </section>

                    <aside className="h-fit lg:sticky lg:top-20">

                        <OnlineUsers
                            users={onlineUsers}
                        />

                    </aside>

                </div>

            </main>

            {/* Version history */}

            {showHistory && (
                <VersionHistory
                    documentId={documentId}
                    onClose={() =>
                        setShowHistory(false)
                    }
                    onRestored={async () => {
                        await reload();
                        setShowHistory(false);
                    }}
                />
            )}

            {/* Share modal */}

            {showShare && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] dark:bg-black/60"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowShare(false);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-xl"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="relative">

                            <ShareDocument
                                documentId={documentId}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowShare(false)
                                }
                                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* Collaborators modal */}

            {showCollaborators && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] dark:bg-black/60"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowCollaborators(false);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-2xl"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="relative">

                            <CollaboratorList
                                documentId={documentId}
                                collaborators={
                                    collaborators
                                }
                                onUpdate={reload}
                                onClose={() =>
                                    setShowCollaborators(
                                        false
                                    )
                                }
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowCollaborators(
                                        false
                                    )
                                }
                                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* Exit modal */}

            {showExitModal && (
                <ExitConfirmModal
                    onSaveAndExit={
                        saveAndExit
                    }
                    onExitWithoutSaving={
                        exitWithoutSaving
                    }
                    onCancel={() =>
                        setShowExitModal(
                            false
                        )
                    }
                    saving={saving}
                />
            )}

        </div>
    );
}

export default Editor;