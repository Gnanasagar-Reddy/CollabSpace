function OnlineUsers({ users }) {

    return (
        <div className="online-users-card">

            <div className="online-users-header">

                <div className="online-status">
                    <span className="online-dot"></span>

                    <span>
                        {users.length} online
                    </span>
                </div>

            </div>


            <div className="online-users-list">

                {users.length === 0 ? (

                    <div className="no-users">
                        No one else is online
                    </div>

                ) : (

                    users.map((user) => (

                        <div
                            className="online-user"
                            key={user.id}
                        >

                            <div className="user-avatar">
                                {user.name
                                    ?.charAt(0)
                                    .toUpperCase()
                                }
                            </div>

                            <div className="user-info">

                                <span className="user-name">
                                    {user.name}
                                </span>

                                <span className="user-online">
                                    Active now
                                </span>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>
    );
}

export default OnlineUsers;