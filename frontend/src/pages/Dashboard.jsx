import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useDashboard from "../hooks/useDashboard";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DocumentGrid from "../components/dashboard/DocumentGrid";
import EmptyDocuments from "../components/dashboard/EmptyDocuments";
import CreateDocumentModal from "../components/dashboard/CreateDocumentModal";

function Dashboard() {
    const navigate = useNavigate();

    const {
        documents,
        loading,
        deletingId,
        deleteDocument
    } = useDashboard();

    const [showCreate, setShowCreate] =
        useState(false);

    const [title, setTitle] =
        useState("");

    const [creating, setCreating] =
        useState(false);

    const createDocument = async () => {
        if (!title.trim() || creating) {
            return;
        }

        try {
            setCreating(true);

            const response = await api.post(
                "/documents",
                {
                    title: title.trim(),
                    content: ""
                }
            );

            const documentId =
                response.data.data._id;

            setTitle("");
            setShowCreate(false);

            navigate(
                `/document/${documentId}`
            );
        } catch (error) {
            console.log(
                error.response?.data
            );
        } finally {
            setCreating(false);
        }
    };

    const openDocument = (documentId) => {
        navigate(
            `/document/${documentId}`
        );
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-500">
                    Loading documents...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader
                onCreate={() =>
                    setShowCreate(true)
                }
                onLogout={logout}
            />

            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                <section className="mb-8 sm:mb-10">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                        My Documents
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 sm:text-base">
                        Create, manage and
                        collaborate on your
                        documents.
                    </p>
                </section>

                {documents.length === 0 ? (
                    <EmptyDocuments
                        onCreate={() =>
                            setShowCreate(true)
                        }
                    />
                ) : (
                    <DocumentGrid
                        documents={documents}
                        onOpen={openDocument}
                        onDelete={
                            deleteDocument
                        }
                        deletingId={
                            deletingId
                        }
                    />
                )}
            </main>

            {showCreate && (
                <CreateDocumentModal
                    title={title}
                    setTitle={setTitle}
                    onCreate={createDocument}
                    onClose={() => {
                        if (!creating) {
                            setShowCreate(false);
                            setTitle("");
                        }
                    }}
                    creating={creating}
                />
            )}
        </div>
    );
}

export default Dashboard;