import {
    useCallback,
    useEffect,
    useState
} from "react";

import api from "../services/api";

function useCollaborationRequests() {

    const [requests, setRequests] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const fetchRequests = useCallback(
        async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await api.get(
                        "/documents/share-requests"
                    );

                setRequests(
                    response.data?.data || []
                );

            } catch (error) {

                console.log(
                    "Fetch collaboration requests error:",
                    error.response?.data ||
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load collaboration requests"
                );

            } finally {

                setLoading(false);

            }
        },
        []
    );

    useEffect(() => {

        fetchRequests();

    }, [fetchRequests]);

    return {
        requests,
        loading,
        error,
        fetchRequests
    };
}

export default useCollaborationRequests;