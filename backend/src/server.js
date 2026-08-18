require("dotenv").config();

const http = require("http");
const app = require("./app");

const connectDb = require("./config/db");
const { connectRedis } = require("./config/redis");
const initializeSocket = require("./socket/socket");
require("./queue/document.worker");

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const startServer = async() => {

    await connectDb();
    await connectRedis();
    
    initializeSocket(server);

    server.listen(
        PORT,
        ()=>{
            console.log(
                `Server running on port ${PORT}`
            );
        }
    );
};

startServer();