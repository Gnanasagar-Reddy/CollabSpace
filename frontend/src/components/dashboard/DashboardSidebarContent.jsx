import ThemeToggle from "../common/ThemeToggle";
import { getUserProfile } from "../../utils/userProfile";

const navigateDirectly = (callback) => callback();

export function DashboardNavigation({
    activeView, onOverview, onMyDocuments, onSharedDocuments,
    onNavigate = navigateDirectly, showActivity = true, children
}) {
    const navigation = [
        { view: "all", label: "Overview", icon: "▣", onClick: onOverview },
        { view: "owned", label: "My Documents", icon: "◫", onClick: onMyDocuments },
        { view: "shared", label: "Shared with me", icon: "👥", onClick: onSharedDocuments }
    ];

    const getNavClass = (view) => activeView === view
        ? "flex w-full items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400"
        : "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white";

    return (
        <nav className="flex-1 px-3 py-6">
            {children}
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Workspace
            </p>
            {navigation.map(({ view, label, icon, onClick }) => (
                <button key={view} type="button" onClick={() => onNavigate(onClick)} className={getNavClass(view)}>
                    <span>{icon}</span> {label}
                </button>
            ))}
            <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Activity
            </p>
            {showActivity && <>
                <button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
                    <span>◷</span> Recent
                </button>
                <button type="button" className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
                    <span>★</span> Starred
                </button>
            </>}
        </nav>
    );
}

export function DashboardSidebarFooter({ user, onLogout, mobile = false }) {
    const { name: userName, initial: userInitial } = getUserProfile(user);
    const logoutClass = mobile
        ? "text-xs font-semibold text-red-500 transition hover:text-red-600"
        : "rounded-md px-2 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40";

    return (
        <div className="border-t border-gray-100 p-3 dark:border-gray-800">
            <div className="flex items-center gap-2">
                <button type="button" className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
                    <span>⚙</span> Settings
                </button>
                <ThemeToggle />
            </div>
            <div className="mt-2 flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                    {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Workspace member</p>
                </div>
                <button type="button" onClick={onLogout} className={logoutClass}>Logout</button>
            </div>
        </div>
    );
}
