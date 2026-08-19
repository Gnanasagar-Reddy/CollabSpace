import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";


function Dashboard() {

    const navigate = useNavigate();

    const [documents, setDocuments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [showCreate, setShowCreate] =
        useState(false);

    const [title, setTitle] =
        useState("");

    const [creating, setCreating] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);


    const fetchDocuments = async () => {

        try {

            const response =
                await api.get("/documents");

            setDocuments(
                response.data.data
            );

        } catch (error) {

            console.log(
                error.response?.data
            );

        } finally {

            setLoading(false);

        }

    };


    const createDocument = async () => {

        if (!title.trim()) {
            return;
        }

        try {

            setCreating(true);

            const response =
                await api.post(
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


    const deleteDocument = async (documentId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this document?"
            );

        if (!confirmed) {
            return;
        }


        try {

            setDeletingId(documentId);

            await api.delete(
                `/documents/${documentId}`
            );


            setDocuments(
                (prev) =>
                    prev.filter(
                        (doc) =>
                            doc._id !== documentId
                    )
            );


        } catch (error) {

            console.log(
                error.response?.data
            );

        } finally {

            setDeletingId(null);

        }

    };

    useEffect(() => {

        fetchDocuments();

    }, []);


    if (loading) {

        return (
            <div className="dashboard-loading">
                Loading...
            </div>
        );

    }


    return (

        <div className="dashboard">

            {/* HEADER */}

            <header className="dashboard-header">

                <div className="dashboard-logo">

                    <div className="dashboard-logo-icon">
                        C
                    </div>

                    <span>
                        CollabSpace
                    </span>

                </div>


                <button
                    className="new-document-btn"
                    onClick={() =>
                        setShowCreate(true)
                    }
                >
                    + New Document
                </button>

            </header>


            {/* MAIN */}

            <main className="dashboard-main">

                <section className="dashboard-title-section">

                    <h1 className="dashboard-title">
                        My Documents
                    </h1>

                    <p className="dashboard-subtitle">
                        Create, manage and collaborate
                        on your documents.
                    </p>

                </section>


                {/* DOCUMENTS */}

                {documents.length === 0 ? (

                    <div className="empty-documents">

                        <h3>
                            No documents yet
                        </h3>

                        <p>
                            Create your first document
                            to get started.
                        </p>

                    </div>

                ) : (

                    <div className="document-grid">

                        {documents.map(
                            (doc) => (

                                <div
                                    className="document-card"
                                    key={doc._id}
                                >

                                    <div>

                                        <div className="document-icon">
                                            📄
                                        </div>


                                        <div className="document-info">

                                            <h3 className="document-title">
                                                {doc.title}
                                            </h3>

                                            <p className="document-date">
                                                Last edited{" "}
                                                {new Date(
                                                    doc.updatedAt
                                                ).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric"
                                                    }
                                                )}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="document-card-actions">

                                        <button
                                            className="open-document-btn"
                                            onClick={() =>
                                                navigate(
                                                    `/document/${doc._id}`
                                                )
                                            }
                                        >
                                            Open →
                                        </button>


                                        <button
                                            className="delete-document-btn"
                                            disabled={
                                                deletingId === doc._id
                                            }
                                            onClick={() =>
                                                deleteDocument(
                                                    doc._id
                                                )
                                            }
                                        >

                                            {deletingId === doc._id
                                                ? "Deleting..."
                                                : "Delete"
                                            }

                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </main>
            {showCreate && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setShowCreate(false)
                    }
                >

                    <div
                        className="create-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <h2>
                            Create Document
                        </h2>

                        <p>
                            Give your document a name.
                        </p>


                        <input
                            type="text"
                            placeholder="Document name"
                            value={title}
                            autoFocus
                            onChange={(e) =>
                                setTitle(
                                    e.target.value
                                )
                            }
                            onKeyDown={(e) => {

                                if (
                                    e.key === "Enter"
                                ) {
                                    createDocument();
                                }

                                if (
                                    e.key === "Escape"
                                ) {
                                    setShowCreate(false);
                                }

                            }}
                        />


                        <div className="modal-actions">

                            <button
                                onClick={() =>
                                    setShowCreate(false)
                                }
                            >
                                Cancel
                            </button>


                            <button
                                onClick={createDocument}
                                disabled={
                                    !title.trim() ||
                                    creating
                                }
                            >

                                {creating
                                    ? "Creating..."
                                    : "Create"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}
        </div>

    );

}


export default Dashboard;