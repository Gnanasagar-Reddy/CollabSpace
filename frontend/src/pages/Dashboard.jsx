import {
    useContext,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import { AuthContext } from "../context/AuthContext";
import { getUserProfile } from "../utils/userProfile";
import { getGreeting } from "../utils/greeting";

import useDashboard from "../hooks/useDashboard";
import useStarredDocuments from "../hooks/useStarredDocuments";
import SettingsModal from "../components/dashboard/SettingsModal";
import useCollaborationRequests from "../hooks/useCollaborationRequests";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DocumentGrid from "../components/dashboard/DocumentGrid";
import EmptyDocuments from "../components/dashboard/EmptyDocuments";
import CreateDocumentModal from "../components/dashboard/CreateDocumentModal";
import CollaborationRequests from "../components/dashboard/CollaborationRequests";


function Dashboard() {

    const navigate = useNavigate();

    const {
        user,
        logout
    } = useContext(AuthContext);

    const { name: userName } = getUserProfile(user);
    const { starredIds, toggleStar, error: starError } = useStarredDocuments(user?._id);
    const [showSettings, setShowSettings] = useState(false);
    const [recentNow, setRecentNow] = useState(() => Date.now());


    const {
        documents,
        loading,
        deletingId,
        loadError,
        deleteError,
        clearDeleteError,
        deleteDocument,
        fetchDocuments
    } = useDashboard();


    /*
     * COLLABORATION REQUESTS
     */

    const {
        requests,
        loading: requestsLoading,
        fetchRequests
    } = useCollaborationRequests();


    const [showRequests, setShowRequests] =
        useState(false);


    const openRequests = () => {

        setShowRequests(true);

        /*
         * Refresh requests whenever
         * the drawer is opened.
         */

        fetchRequests();
    };


    const closeRequests = () => {
        setShowRequests(false);
    };


    const respondToRequest = async (requestId, action) => {
        try {
            await api.patch(
                "/documents/share-requests/" + requestId + "/" + action
            );
            await fetchRequests();
            if (action === "accept") {
                await fetchDocuments();
            }
            return true;
        } catch (error) {
            const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
            console.log(actionLabel + " request error:", error.response?.data || error);
            alert(error.response?.data?.message || "Failed to " + action + " request");
            return false;
        }
    };

    const acceptRequest = (requestId) => respondToRequest(requestId, "accept");
    const rejectRequest = (requestId) => respondToRequest(requestId, "reject");

    /*
     * CREATE DOCUMENT
     */

    const [showCreate, setShowCreate] =
        useState(false);

    const [title, setTitle] =
        useState("");

    const [creating, setCreating] =
        useState(false);
    const [createError, setCreateError] = useState("");


    const [searchQuery, setSearchQuery] =
        useState("");


    const [documentView, setDocumentView] =
        useState("all");


    const createDocument = async () => {

        if (
            !title.trim() ||
            creating
        ) {
            return;
        }


        try {

            setCreating(true);
            setCreateError("");


            const response = await api.post(
                "/documents",
                {
                    title: title.trim(),
                    content: ""
                }
            );


            const documentId =
                response.data.data._id;


            setTitle("");
            setShowCreate(false);


            navigate(
                `/document/${documentId}`
            );

        } catch (error) {

            setCreateError(
                error.response?.data?.message || "Unable to create this document. Please try again."
            );

        } finally {

            setCreating(false);
        }
    };


    const openDocument = (
        documentId
    ) => {

        navigate(
            `/document/${documentId}`
        );
    };


    const handleLogout = async () => {

        await logout();

        navigate(
            "/login",
            {
                replace: true
            }
        );
    };


    /*
     * FILTER DOCUMENTS
     */

    const filteredDocuments =
        documents
            .filter((document) => {

                if (documentView === "starred") return starredIds.includes(document._id);
                if (documentView === "recent") {
                    const age = recentNow - new Date(document.updatedAt).getTime();
                    return age >= 0 && age < 24 * 60 * 60 * 1000;
                }

                if (
                    documentView ===
                    "owned"
                ) {

                    return (
                        document.accessType ===
                        "owned"
                    );
                }


                if (
                    documentView ===
                    "shared"
                ) {

                    return (
                        document.accessType ===
                        "shared"
                    );
                }


                return true;
            })
            .filter((document) => {

                const query =
                    searchQuery
                        .trim()
                        .toLowerCase();


                if (!query) {
                    return true;
                }


                return (
                    document.title
                        ?.toLowerCase()
                        .includes(query)
                );
            });


    const sharedDocuments =
        documents.filter(
            (document) =>
                document.accessType ===
                "shared"
        ).length;


    const recentlyUpdated =
        documents.filter(
            (document) => {

                const updated =
                    new Date(
                        document.updatedAt
                    );

                const now =
                    new Date();

                const difference =
                    now - updated;


                return (
                    difference <
                    24 *
                    60 *
                    60 *
                    1000
                );
            }
        );


    /*
     * LOADING
     */

    if (loading) {

        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading documents...
                </p>

            </div>
        );
    }


    return (

        <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 transition-colors duration-200 dark:bg-gray-950">


            {/* HEADER */}

            <DashboardHeader
                user={user}

                onCreate={() =>
                    setShowCreate(true)
                }

                onLogout={handleLogout}

                onOverview={() =>
                    setDocumentView("all")
                }

                onMyDocuments={() =>
                    setDocumentView("owned")
                }

                onSharedDocuments={() =>
                    setDocumentView("shared")
                }

                activeView={documentView}
                onRecent={() => { setRecentNow(Date.now()); setDocumentView("recent"); }}
                onStarred={() => setDocumentView("starred")}
                onSettings={() => setShowSettings(true)}

                onRequests={
                    openRequests
                }

                requestCount={
                    requests.length
                }

            />


            {/* MAIN */}

            <main className="px-4 py-8 sm:px-6 sm:py-10 lg:ml-64 lg:px-8 lg:py-12">
                {starError && <p role="alert" className="mb-4 text-sm text-red-600 dark:text-red-400">{starError}</p>}
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {documentView === "recent" ? "Recently updated (last 24 hours)" : documentView === "starred" ? "Starred documents" : "Documents"}
                </h2>

                {loadError && (
                    <div role="alert" className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                        <span>{loadError}</span>
                        <button type="button" onClick={fetchDocuments} className="shrink-0 font-semibold underline">
                            Retry loading
                        </button>
                    </div>
                )}
                {deleteError && (
                    <div role="alert" className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                        <span>{deleteError}</span>
                        <button type="button" onClick={clearDeleteError} className="shrink-0 font-semibold underline">
                            Dismiss
                        </button>
                    </div>
                )}


                {/* PAGE HEADER */}

                <section className="mb-8">

                    <div>

                        <div className="flex items-center gap-2">

                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />

                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                                Your workspace
                            </p>

                        </div>


                        <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-gray-950 dark:text-white sm:text-4xl">

                            {getGreeting()},

                            <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                                {userName}
                            </span>

                        </h1>


                        <p className="mt-3 max-w-xl text-[15px] leading-6 text-gray-500 dark:text-gray-400 sm:text-base">
                            Create, manage and collaborate
                            on your documents from one place.
                        </p>

                    </div>


                    {/* SEARCH */}

                    <div className="mt-6 flex min-w-0">

                        <div className="relative min-w-0 flex-1 sm:max-w-2xl">

                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">

                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >

                                    <circle
                                        cx="11"
                                        cy="11"
                                        r="7"
                                    />

                                    <path d="m20 20-4-4" />

                                </svg>

                            </span>


                            <input
                                id="document-search"
                                name="document-search"
                                type="text"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(
                                        event.target.value
                                    )
                                }
                                placeholder={
                                    documentView ===
                                        "owned"
                                        ? "Search your documents..."
                                        : documentView ===
                                            "shared"
                                            ? "Search shared documents..."
                                            : "Search documents..."
                                }
                                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
                            />

                        </div>

                    </div>

                </section>


                {/* STATISTICS */}

                <section className="mb-8">

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">


                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">

                            <div className="flex items-start justify-between">

                                <div>

                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Total documents
                                    </p>

                                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {documents.length}
                                    </p>

                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                    📄
                                </div>

                            </div>

                            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                                Documents in your workspace
                            </p>

                        </div>


                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">

                            <div className="flex items-start justify-between">

                                <div>

                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Shared with me
                                    </p>

                                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {sharedDocuments}
                                    </p>

                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                    👥
                                </div>

                            </div>

                            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                                Documents with collaborators
                            </p>

                        </div>


                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">

                            <div className="flex items-start justify-between">

                                <div>

                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Recently updated
                                    </p>

                                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                        {recentlyUpdated.length}
                                    </p>

                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                                    ◷
                                </div>

                            </div>

                            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                                Updated in the last 24 hours
                            </p>

                        </div>

                    </div>

                </section>


                {/* DOCUMENTS */}

                <section>

                    {filteredDocuments.length === 0 ? (!loadError && (

                        (documentView === "starred" || documentView === "recent" || searchQuery.trim()) ? (
                            <p className="py-12 text-center text-gray-500 dark:text-gray-400">No documents match this view. Use Overview to browse your documents.</p>
                        ) : <EmptyDocuments
                            onCreate={() =>
                                setShowCreate(true)
                            }
                        />

                    )) : (

                        <DocumentGrid
                            documents={
                                filteredDocuments
                            }
                            onOpen={openDocument}
                            onDelete={deleteDocument}
                            deletingId={deletingId}
                            starredIds={starredIds}
                            onToggleStar={toggleStar}
                        />

                    )}

                </section>

            </main>


            {/* CREATE DOCUMENT */}
            {showSettings && <SettingsModal user={user} onClose={() => setShowSettings(false)} />}

            {showCreate && (

                <CreateDocumentModal
                    title={title}
                    setTitle={(value) => {
                        setTitle(value);
                        setCreateError("");
                    }}
                    onCreate={createDocument}
                    onClose={() => {

                        if (!creating) {

                            setShowCreate(false);
                            setTitle("");
                            setCreateError("");

                        }

                    }}
                    creating={creating}
                    error={createError}
                />

            )}


            {/* COLLABORATION REQUEST DRAWER */}

            <CollaborationRequests

                requests={requests}

                loading={requestsLoading}

                open={showRequests}

                onClose={closeRequests}

                onAccept={acceptRequest}

                onReject={rejectRequest}

            />

        </div>
    );
}


export default Dashboard;
