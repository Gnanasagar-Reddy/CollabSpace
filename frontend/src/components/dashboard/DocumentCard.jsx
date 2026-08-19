function DocumentCard({ document, onOpen }) {

    const formattedDate =
        new Date(document.updatedAt)
            .toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }
            );

    return (
        <div
            className="document-card"
            onClick={() => onOpen(document._id)}
        >

            <div className="document-card-icon">
                📄
            </div>


            <div className="document-card-body">

                <h3>
                    {document.title || "Untitled Document"}
                </h3>

                <p>
                    Last edited {formattedDate}
                </p>

            </div>


            <button
                className="open-document-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onOpen(document._id);
                }}
            >
                Open
            </button>

        </div>
    );

}

export default DocumentCard;