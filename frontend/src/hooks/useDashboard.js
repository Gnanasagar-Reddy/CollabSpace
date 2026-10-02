import { useEffect, useState } from "react";
import api from "../services/api";

function useDashboard() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const fetchDocuments = async () => {
        setLoadError("");
        try {
            const response = await api.get(
                "/documents"
            );

            setDocuments(
                response.data.data
            );
        } catch (error) {
            setLoadError(
                error.response?.data?.message || "Unable to load documents. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const deleteDocument = async (
        documentId
    ) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this document?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleteError("");
            setDeletingId(documentId);

            await api.delete(
                `/documents/${documentId}`
            );

            setDocuments(
                (currentDocuments) =>
                    currentDocuments.filter(
                        (document) =>
                            document._id !==
                            documentId
                    )
            );
        } catch (error) {
            setDeleteError(
                error.response?.data?.message || "Unable to delete this document. Please try again."
            );
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return {
        documents,
        loading,
        deletingId,
        loadError,
        deleteError,
        clearDeleteError: () => setDeleteError(""),
        fetchDocuments,
        deleteDocument
    };
}

export default useDashboard;
