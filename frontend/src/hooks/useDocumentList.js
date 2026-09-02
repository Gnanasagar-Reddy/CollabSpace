import { useEffect, useState } from "react";
import api from "../services/api";

function useDocumentList(endpoint) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(endpoint);

                setDocuments(
                    response.data.data || []
                );
            } catch (error) {
                console.log(
                    error.response?.data ||
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load documents"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [endpoint]);

    return {
        documents,
        loading,
        error
    };
}

export default useDocumentList;