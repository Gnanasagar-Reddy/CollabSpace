import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

function useDocument(documentId) {
    const [document, setDocument] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [collaborators, setCollaborators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDocument = useCallback(async () => {
        if (!documentId) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.get(
                `/documents/${documentId}`
            );

            const data = response.data.data;

            setDocument(data.document);
            setUserRole(data.role);
            setCollaborators(
                data.document.collaborators || []
            );
        } catch (error) {
            console.log(
                "Error loading document:",
                error.response?.data || error
            );
            setError(
                error.response?.data?.message || "Failed to load this document. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [documentId]);

    useEffect(() => {
        loadDocument();
    }, [loadDocument]);

    return {
        document,
        userRole,
        collaborators,
        loading,
        error,
        reload: loadDocument
    };
}

export default useDocument;
