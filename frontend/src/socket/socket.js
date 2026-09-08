import { io } from "socket.io-client";


const socket = io(
    import.meta.env.VITE_SOCKET_URL,
    {
        autoConnect: false,

        transports: ["websocket"],

        auth: {
            token: localStorage.getItem(
                "accessToken"
            )
        }
    }
);


export const connectSocket = () => {

    socket.auth = {
        token:
            localStorage.getItem("accessToken")
    };


    socket.connect();

};


export default socket;