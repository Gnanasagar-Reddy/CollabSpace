import DocumentCard from "./DocumentCard";

function DocumentGrid({
    documents,
    onOpen,
    onDelete,
    deletingId,
    starredIds = [],
    onToggleStar
}) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
                <DocumentCard
                    key={document._id}
                    document={document}
                    onOpen={onOpen}
                    onDelete={onDelete}
                    starred={starredIds.includes(document._id)}
                    onToggleStar={onToggleStar}
                    deleting={
                        deletingId ===
                        document._id
                    }
                />
            ))}
        </div>
    );
}

export default DocumentGrid;
