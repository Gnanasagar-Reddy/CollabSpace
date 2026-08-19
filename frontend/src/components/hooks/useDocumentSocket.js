import { useEffect, useState } from "react";
import socket, {
    connectSocket
} from "../../socket/socket"
function useDocumentSocket(documentId) {

    const [onlineUsers, setOnlineUsers] =
        useState([]);

    useEffect(() => {

        if (!documentId) {
            return;
        }

        connectSocket();

        const handleConnect = () => {

            console.log(
                "Socket connected:",
                socket.id
            );

            socket.emit(
                "join-document",
                documentId
            );

        };

        const handlePresenceUpdate = (
            data
        ) => {

            console.log(
                "Presence update:",
                data.users
            );

            setOnlineUsers(
                data.users
            );

        };

        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "presence-update",
            handlePresenceUpdate
        );

        return () => {

            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "presence-update",
                handlePresenceUpdate
            );

            socket.disconnect();

        };

    }, [documentId]);

    return {
        onlineUsers
    };
}

export default useDocumentSocket;