function EmptyDocuments({ onCreate }) {

    return (
        <div className="empty-documents">

            <div className="empty-icon">
                📄
            </div>

            <h2>
                No documents yet
            </h2>

            <p>
                Create your first document and
                start collaborating with your team.
            </p>

            <button
                className="new-document-btn"
                onClick={onCreate}
            >
                + Create Document
            </button>

        </div>
    );

}

export default EmptyDocuments;