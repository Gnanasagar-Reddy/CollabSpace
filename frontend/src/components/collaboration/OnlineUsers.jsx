function OnlineUsers({ users }) {

    return (
        <div>

            <h3>
                Online Users
            </h3>

            {users.map((user) => (

                <div key={user.id}>

                    🟢 {user.name}

                </div>

            ))}

        </div>
    );
}

export default OnlineUsers;