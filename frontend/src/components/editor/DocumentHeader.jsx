import { useEffect } from "react";


function DocumentHeader({
    title,
    role,

    editingTitle,
    newTitle,
    setNewTitle,

    startRename,
    renameDocument,
    cancelRename,
    renameMessage,

    deleteDocument,
    deleting
}) {

    useEffect(() => {

        if (!editingTitle) {
            return;
        }

        const handleKeyDown = (e) => {

            if (e.key === "Escape") {
                cancelRename();
            }

            if (e.key === "Enter") {
                renameDocument();
            }

        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    }, [
        editingTitle,
        renameDocument,
        cancelRename
    ]);


    return (

        <div className="document-header">

            <div className="document-header-title">

                {editingTitle ? (

                    <div className="rename-container">

                        <input
                            type="text"
                            value={newTitle}
                            autoFocus
                            onChange={(e) =>
                                setNewTitle(
                                    e.target.value
                                )
                            }
                        />


                        <button
                            onClick={
                                renameDocument
                            }
                        >
                            Save
                        </button>


                        <button
                            onClick={
                                cancelRename
                            }
                        >
                            Cancel
                        </button>


                        {renameMessage && (

                            <span className="rename-error">
                                {renameMessage}
                            </span>

                        )}

                    </div>

                ) : (

                    <div className="title-display">

                        <h1>
                            {title}
                        </h1>


                        {role === "owner" && (

                            <div className="document-owner-actions">

                                <button
                                    className="rename-button"
                                    onClick={startRename}
                                    title="Rename document"
                                >
                                    ✏️
                                </button>


                                <button
                                    className="delete-editor-button"
                                    onClick={deleteDocument}
                                    disabled={deleting}
                                    title="Delete document"
                                >
                                    {deleting
                                        ? "Deleting..."
                                        : "🗑️"
                                    }
                                </button>

                            </div>

                        )}

                    </div>

                )}

            </div>


            <div className="document-role">

                <strong>
                    Your role:
                </strong>{" "}

                {role}

            </div>

        </div>

    );

}


export default DocumentHeader;