function EmptyDocuments({ onCreate }) {
    return (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl dark:bg-indigo-500/10">
                📄
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
                No documents yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                Create your first document and
                start collaborating with your
                team.
            </p>

            <button
                type="button"
                onClick={onCreate}
                className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
            >
                + Create Document
            </button>
        </div>
    );
}

export default EmptyDocuments;