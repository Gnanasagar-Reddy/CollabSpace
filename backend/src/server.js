require("dotenv").config();

const http = require("http");
const mongoose = require("mongoose");

const connectDb = require("./config/db");
const {
    connectRedis,
    closeRedis
} = require("./config/redis");

const initializeSocket = require("./socket/socket");

const PORT = process.env.PORT || 5000;

let server;
let io;

const startServer = async () => {

    await connectDb();
    await connectRedis();

    const app = require("./app");

    server = http.createServer(app);

    io = initializeSocket(server);

    server.listen(
        PORT,
        "0.0.0.0",
        () => {
            console.log(
                `Server running on port ${PORT}`
            );
        }
    );
};


// Graceful shutdown

const shutdown = async (signal) => {

    console.log(
        `${signal} received. Shutting down gracefully...`
    );

    try {

        // Close Socket.IO connections
        if (io) {
            await io.close();

            console.log(
                "Socket.IO closed"
            );
        }


        if (server) {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    console.log("HTTP server closed");
                    resolve();
                });
            });
        }


        // Close Redis connections
        await closeRedis();

        console.log("Redis clients closed");


        // Close MongoDB connection
        await mongoose.connection.close();

        console.log(
            "MongoDB connection closed"
        );


        process.exit(0);

    } catch (error) {

        console.error(
            "Error during graceful shutdown:",
            error
        );

        process.exit(1);
    }
};


process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);


startServer();
