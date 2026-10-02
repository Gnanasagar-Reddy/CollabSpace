import {
    useEffect,
    useRef,
    useState
} from "react";
import socket, {
    connectSocket
} from "../socket/socket";

function useDocumentSocket(
    documentId,
    onDocumentRestored
) {
    const [onlineUsers, setOnlineUsers] =
        useState([]);

    const disconnectTimer = useRef(null);

    useEffect(() => {
        if (!documentId) {
            return;
        }

        if (disconnectTimer.current) {
            clearTimeout(disconnectTimer.current);
            disconnectTimer.current = null;
        }

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

        const handlePresenceUpdate = (data) => {
            setOnlineUsers(
                data.users || []
            );
        };

        const handleDisconnect = () => setOnlineUsers([]);

        const handleDocumentRestored = (data) => {
            if (
                data.documentId === documentId &&
                onDocumentRestored
            ) {
                onDocumentRestored();
            }
        };

        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "presence-update",
            handlePresenceUpdate
        );

        socket.on(
            "document-restored",
            handleDocumentRestored
        );

        socket.on("disconnect", handleDisconnect);
        socket.on("document-permissions-updated", handleDocumentRestored);
        socket.on("connect_error", handleDisconnect);
        connectSocket();

        if (socket.connected) {
            handleConnect();
        }

        return () => {
            handleDisconnect();
            socket.off("disconnect", handleDisconnect);
            socket.off("document-permissions-updated", handleDocumentRestored);
            socket.off("connect_error", handleDisconnect);
            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "presence-update",
                handlePresenceUpdate
            );

            socket.off(
                "document-restored",
                handleDocumentRestored
            );

            disconnectTimer.current = setTimeout(() => {
                socket.disconnect();
                disconnectTimer.current = null;
            }, 0);
        };
    }, [
        documentId,
        onDocumentRestored
    ]);

    return {
        onlineUsers
    };
}

export default useDocumentSocket;
