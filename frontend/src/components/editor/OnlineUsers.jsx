function OnlineUsers({ users = [] }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                    <span className="text-sm font-semibold text-gray-900">
                        Online
                    </span>
                </div>

                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    {users.length}
                </span>
            </div>

            <div className="max-h-72 overflow-y-auto p-3">
                {users.length === 0 ? (
                    <p className="px-1 py-4 text-center text-xs text-gray-400">
                        No one else is online
                    </p>
                ) : (
                    <div className="space-y-1">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                                    {user.name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-gray-800">
                                        {user.name ||
                                            "User"}
                                    </p>

                                    <p className="text-xs text-green-600">
                                        Active now
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OnlineUsers;