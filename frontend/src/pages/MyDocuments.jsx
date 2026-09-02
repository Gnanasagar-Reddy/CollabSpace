import { useNavigate } from "react-router-dom";
import useDocumentList from "../hooks/useDocumentList";
import DocumentGrid from "../components/dashboard/DocumentGrid";

function MyDocuments() {
    const navigate = useNavigate();

    const {
        documents,
        loading,
        error
    } = useDocumentList("/documents/owned");

    const openDocument = (documentId) => {
        navigate(`/document/${documentId}`);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Loading your documents...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <main className="px-4 py-8 sm:px-6 lg:ml-64 lg:px-8 lg:py-12">

                <div className="mb-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">
                        Workspace
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
                        My Documents
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
                        Documents created and owned by you.
                    </p>
                </div>

                {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                        {error}
                    </div>
                ) : documents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl dark:bg-indigo-950/50">
                            📄
                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
                            No documents yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                            Documents you create will appear here.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/dashboard")
                            }
                            className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                ) : (
                    <DocumentGrid
                        documents={documents}
                        onOpen={openDocument}
                        onDelete={() => {}}
                        deletingId={null}
                    />
                )}

            </main>
        </div>
    );
}

export default MyDocuments;