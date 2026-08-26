import DocumentCard from "./DocumentCard";

function DocumentGrid({
    documents,
    onOpen,
    onDelete,
    deletingId
}) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
                <DocumentCard
                    key={document._id}
                    document={document}
                    onOpen={onOpen}
                    onDelete={onDelete}
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