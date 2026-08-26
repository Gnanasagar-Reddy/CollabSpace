import { useEffect } from "react";

function CreateDocumentModal({
    title,
    setTitle,
    onCreate,
    onClose,
    creating
}) {
    const handleSubmit = (event) => {
        event.preventDefault();

        if (!title.trim() || creating) {
            return;
        }

        onCreate();
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !creating) {
                onClose();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [creating, onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-7">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Create Document
                    </h2>

                    <p className="mt-1.5 text-sm leading-6 text-gray-500">
                        Give your document a name
                        to get started.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mt-6"
                >
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Document title
                    </label>

                    <input
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(
                                event.target.value
                            )
                        }
                        placeholder="Enter document title"
                        autoFocus
                        className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={creating}
                            className="h-10 rounded-lg px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                !title.trim() ||
                                creating
                            }
                            className="h-10 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creating
                                ? "Creating..."
                                : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateDocumentModal;