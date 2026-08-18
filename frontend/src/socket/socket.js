import { io } from "socket.io-client";


const socket = io(
    "http://localhost:5000",
    {
        autoConnect:false
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