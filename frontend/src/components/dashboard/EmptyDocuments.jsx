function EmptyDocuments({ onCreate }) {
    return (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                📄
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
                No documents yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Create your first document and
                start collaborating with your
                team.
            </p>

            <button
                type="button"
                onClick={onCreate}
                className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
                + Create Document
            </button>
        </div>
    );
}

export default EmptyDocuments;