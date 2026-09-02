import { useState } from "react";
import ThemeToggle from "../common/ThemeToggle";

function DashboardHeader({
    onCreate,
    onLogout,
    onOverview,
    onMyDocuments,
    onSharedDocuments,
    activeView
}) {
    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const getNavClass = (view) => {
        if (activeView === view) {
            return "flex w-full items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400";
        }

        return "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white";
    };

    const handleNavigation = (callback) => {
        callback();
        setSidebarOpen(false);
    };

    return (
        <>
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white lg:flex lg:flex-col dark:border-gray-800 dark:bg-gray-950">

                <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6 dark:border-gray-800">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white">
                        C
                    </div>

                    <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                        CollabSpace
                    </span>
                </div>

                <nav className="flex-1 px-3 py-6">
                    <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Workspace
                    </p>

                    <button
                        type="button"
                        onClick={onOverview}
                        className={getNavClass("all")}
                    >
                        <span>▣</span>
                        Overview
                    </button>

                    <button
                        type="button"
                        onClick={onMyDocuments}
                        className={getNavClass("owned")}
                    >
                        <span>◫</span>
                        My Documents
                    </button>

                    <button
                        type="button"
                        onClick={onSharedDocuments}
                        className={getNavClass("shared")}
                    >
                        <span>👥</span>
                        Shared with me
                    </button>

                    <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Activity
                    </p>

                    <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <span>◷</span>
                        Recent
                    </button>

                    <button
                        type="button"
                        className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <span>★</span>
                        Starred
                    </button>
                </nav>

                <div className="border-t border-gray-100 p-3 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        >
                            <span>⚙</span>
                            Settings
                        </button>

                        <ThemeToggle />
                    </div>

                    <div className="mt-2 flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                            S
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                Sagar
                            </p>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Workspace member
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onLogout}
                            className="rounded-md px-2 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95 lg:hidden">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            setSidebarOpen(true)
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        ☰
                    </button>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white">
                        C
                    </div>

                    <span className="truncate text-base font-bold text-gray-900 dark:text-white">
                        CollabSpace
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <ThemeToggle />

                    <button
                        type="button"
                        onClick={onCreate}
                        className="flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        <span className="text-lg leading-none">
                            +
                        </span>
                        New
                    </button>
                </div>
            </header>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] dark:bg-black/60 lg:hidden"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-200 dark:border-gray-800 dark:bg-gray-950 lg:hidden ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5 dark:border-gray-800">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white">
                            C
                        </div>

                        <span className="truncate text-lg font-bold text-gray-900 dark:text-white">
                            CollabSpace
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setSidebarOpen(false)
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 px-3 py-6">
                    <button
                        type="button"
                        onClick={onCreate}
                        className="mb-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        <span className="text-lg leading-none">
                            +
                        </span>
                        New document
                    </button>

                    <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Workspace
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            handleNavigation(
                                onOverview
                            )
                        }
                        className={getNavClass("all")}
                    >
                        <span>▣</span>
                        Overview
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleNavigation(
                                onMyDocuments
                            )
                        }
                        className={getNavClass("owned")}
                    >
                        <span>◫</span>
                        My Documents
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleNavigation(
                                onSharedDocuments
                            )
                        }
                        className={getNavClass("shared")}
                    >
                        <span>👥</span>
                        Shared with me
                    </button>

                    <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Activity
                    </p>

                    <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <span>◷</span>
                        Recent
                    </button>

                    <button
                        type="button"
                        className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                        <span>★</span>
                        Starred
                    </button>
                </nav>

                <div className="border-t border-gray-100 p-3 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        >
                            <span>⚙</span>
                            Settings
                        </button>

                        <ThemeToggle />
                    </div>

                    <div className="mt-2 flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                            S
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                Sagar
                            </p>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Workspace member
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onLogout}
                            className="text-xs font-semibold text-red-500 transition hover:text-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default DashboardHeader;