function ExitConfirmModal({
    onSaveAndExit,
    onExitWithoutSaving,
    onCancel,
    saving
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    💾
                </div>

                <h2 className="text-lg font-semibold text-gray-900">
                    Leave this document?
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                    You have changes that may not be saved yet.
                    What would you like to do?
                </p>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onExitWithoutSaving}
                        disabled={saving}
                        className="h-10 rounded-lg px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Exit without saving
                    </button>

                    <button
                        type="button"
                        onClick={onSaveAndExit}
                        disabled={saving}
                        className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving
                            ? "Saving..."
                            : "Save & Exit"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExitConfirmModal;