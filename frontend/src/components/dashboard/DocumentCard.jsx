function DocumentCard({
    document,
    onOpen,
    onDelete,
    deleting
}) {
    const formattedDate = new Date(
        document.updatedAt
    ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return (
        <article className="group flex min-h-[210px] flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-500 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl dark:bg-indigo-500/10">
                    📄
                </div>

                <button
                    type="button"
                    disabled={deleting}
                    onClick={() =>
                        onDelete(document._id)
                    }
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-500/10"
                >
                    {deleting
                        ? "Deleting..."
                        : "Delete"}
                </button>
            </div>

            <div className="mt-5 min-w-0 flex-1">
                <h3
                    title={
                        document.title ||
                        "Untitled Document"
                    }
                    className="truncate text-base font-semibold text-gray-900 dark:text-white sm:text-lg"
                >
                    {document.title ||
                        "Untitled Document"}
                </h3>

                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                    Last edited {formattedDate}
                </p>
            </div>

            <button
                type="button"
                onClick={() =>
                    onOpen(document._id)
                }
                className="mt-5 flex w-fit items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
                Open

                <span className="transition-transform group-hover:translate-x-1">
                    →
                </span>
            </button>
        </article>
    );
}

export default DocumentCard;