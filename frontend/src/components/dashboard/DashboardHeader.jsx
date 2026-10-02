import { useState } from "react";
import ThemeToggle from "../common/ThemeToggle";
import { DashboardNavigation, DashboardSidebarFooter } from "./DashboardSidebarContent";

function DashboardHeader({
    user,
    onCreate,
    onLogout,
    onOverview,
    onMyDocuments,
    onSharedDocuments,
    onRecent,
    onStarred,
    onSettings,
    onRequests,
    requestCount = 0,
    activeView
}) {
    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const handleNavigation = (callback) => {
        callback();
        setSidebarOpen(false);
    };

    return (
        <>
            {/* =====================================================
                DESKTOP SIDEBAR
            ===================================================== */}

            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white lg:flex lg:flex-col dark:border-gray-800 dark:bg-gray-950">

                {/* LOGO */}

                <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6 dark:border-gray-800">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white">
                        C
                    </div>

                    <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                        CollabSpace
                    </span>

                </div>


                {/* NAVIGATION */}

                <DashboardNavigation
                    activeView={activeView}
                    onOverview={onOverview}
                    onMyDocuments={onMyDocuments}
                    onSharedDocuments={onSharedDocuments}
                    onRecent={onRecent}
                    onStarred={onStarred}
                />


                {/* SIDEBAR BOTTOM */}

                <DashboardSidebarFooter user={user} onLogout={onLogout} onSettings={onSettings} />

            </aside>


            {/* =====================================================
                DESKTOP TOP BAR
            ===================================================== */}

            <header className="fixed right-0 top-0 z-30 hidden h-16 border-b border-gray-200 bg-white lg:flex lg:left-64 dark:border-gray-800 dark:bg-gray-950">

                <div className="flex w-full items-center justify-end gap-3 px-5">

                    {/* =================================================
                        MESSAGE / COLLABORATION REQUESTS
                    ================================================= */}

                    <button
                        type="button"
                        onClick={onRequests}
                        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                        title="Collaboration requests"
                        aria-label="Collaboration requests"
                    >

                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect
                                x="3"
                                y="5"
                                width="18"
                                height="14"
                                rx="2"
                            />

                            <path d="m3 7 9 6 9-6" />
                        </svg>


                        {/* NOTIFICATION COUNT */}

                        {requestCount > 0 && (
                            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                {requestCount}
                            </span>
                        )}

                    </button>


                    {/* =================================================
                        NEW DOCUMENT
                    ================================================= */}

                    <button
                        type="button"
                        onClick={onCreate}
                        className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
                    >

                        <span className="text-lg leading-none">
                            +
                        </span>

                        New document

                    </button>

                </div>

            </header>


            {/* =====================================================
                MOBILE HEADER
            ===================================================== */}

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

                    {/* MOBILE REQUEST BUTTON */}

                    <button
                        type="button"
                        onClick={onRequests}
                        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        title="Collaboration requests"
                        aria-label="Collaboration requests"
                    >

                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect
                                x="3"
                                y="5"
                                width="18"
                                height="14"
                                rx="2"
                            />

                            <path d="m3 7 9 6 9-6" />
                        </svg>


                        {requestCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                                {requestCount}
                            </span>
                        )}

                    </button>


                    {/* THEME */}

                    <ThemeToggle />


                    {/* NEW */}

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


            {/* =====================================================
                MOBILE OVERLAY
            ===================================================== */}

            {sidebarOpen && (

                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] dark:bg-black/60 lg:hidden"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />

            )}


            {/* =====================================================
                MOBILE SIDEBAR
            ===================================================== */}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-200 dark:border-gray-800 dark:bg-gray-950 lg:hidden ${sidebarOpen
                    ? "translate-x-0"
                    : "-translate-x-full"
                    }`}
            >

                {/* HEADER */}

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


                {/* NAVIGATION */}

                <DashboardNavigation
                    activeView={activeView}
                    onOverview={onOverview}
                    onMyDocuments={onMyDocuments}
                    onSharedDocuments={onSharedDocuments}
                    onNavigate={handleNavigation}
                    onRecent={onRecent}
                    onStarred={onStarred}
                >
                    <button
                        type="button"
                        onClick={() =>
                            handleNavigation(
                                onCreate
                            )
                        }
                        className="mb-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >

                        <span className="text-lg leading-none">
                            +
                        </span>

                        New document

                    </button>
                </DashboardNavigation>


                {/* MOBILE SIDEBAR BOTTOM */}

                <DashboardSidebarFooter user={user} onLogout={onLogout} onSettings={() => handleNavigation(onSettings)} mobile />

            </aside>
        </>
    );
}

export default DashboardHeader;
