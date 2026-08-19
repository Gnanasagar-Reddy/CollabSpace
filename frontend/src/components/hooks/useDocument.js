import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

function useDocument(
    documentId,
    editor
) {

    const [document, setDocument] =
        useState(null);

    const [userRole, setUserRole] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    const loadDocument = useCallback(
        async () => {

            try {

                const response =
                    await api.get(
                        `/documents/${documentId}`
                    );

                const data =
                    response.data.data;

                setDocument(
                    data.document
                );

                setUserRole(
                    data.role
                );

                if (editor) {

                    editor.commands.setContent(
                        data.document.content || "",
                        false
                    );

                }

            } catch (error) {

                console.log(
                    "Error loading document:",
                    error
                );

            } finally {

                setLoading(false);

            }

        },
        [
            documentId,
            editor
        ]
    );


    useEffect(() => {

        if (!documentId) {
            return;
        }

        loadDocument();

    }, [
        documentId,
        loadDocument
    ]);


    return {
        document,
        userRole,
        loading,
        reloadDocument: loadDocument
    };
}

export default useDocument;