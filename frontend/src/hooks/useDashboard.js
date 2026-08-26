import { useEffect, useState } from "react";
import api from "../services/api";

function useDashboard() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const fetchDocuments = async () => {
        try {
            const response = await api.get(
                "/documents"
            );

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

    return {
        documents,
        loading,
        deletingId,
        fetchDocuments,
        deleteDocument
    };
}

export default useDashboard;