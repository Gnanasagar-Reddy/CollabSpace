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
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />

                    <p className="mt-3 text-sm text-gray-500">
                        Loading document...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <DocumentHeader
                title={document.title}
                role={userRole}
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
            />

            <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
                {userRole === "owner" && (
                    <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <ShareDocument
                            documentId={
                                documentId
                            }
                        />

                        <CollaboratorList
                            documentId={
                                documentId
                            }
                            collaborators={
                                collaborators
                            }
                            onUpdate={
                                reload
                            }
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <CollaborationEditor
                            documentId={
                                documentId
                            }
                            content={
                                document.content
                            }
                            userRole={
                                userRole
                            }
                        />
                    </section>

                    <aside className="h-fit lg:sticky lg:top-20">
                        <OnlineUsers
                            users={
                                onlineUsers
                            }
                        />
                    </aside>
                </div>
            </main>

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