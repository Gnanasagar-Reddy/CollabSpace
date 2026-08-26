function DashboardHeader({
    onCreate,
    onLogout
}) {
    return (
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
                        C
                    </div>

                    <span className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                        CollabSpace
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onCreate}
                        className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:px-4"
                    >
                        <span className="text-lg leading-none">
                            +
                        </span>

                        <span className="hidden sm:inline">
                            New Document
                        </span>

                        <span className="sm:hidden">
                            New
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex h-10 shrink-0 items-center rounded-lg bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}

export default DashboardHeader;