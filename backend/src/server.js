require("dotenv").config();

const http = require("http");
const mongoose = require("mongoose");

const app = require("./app");

const connectDb = require("./config/db");
const {
    connectRedis,
    redisClient,
    redisSubscriber
} = require("./config/redis");

const initializeSocket = require("./socket/socket");

const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

let io;

const startServer = async () => {

    await connectDb();
    await connectRedis();

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

        // Stop accepting new connections
        server.close(() => {
            console.log(
                "HTTP server closed"
            );
        });


        // Close Socket.IO connections
        if (io) {
            await io.close();

            console.log(
                "Socket.IO closed"
            );
        }


        // Close Redis connections
        if (redisClient.isOpen) {
            await redisClient.quit();

            console.log(
                "Redis client closed"
            );
        }

        if (redisSubscriber.isOpen) {
            await redisSubscriber.quit();

            console.log(
                "Redis subscriber closed"
            );
        }


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