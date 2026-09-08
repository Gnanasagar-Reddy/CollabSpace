require("dotenv").config();

const mongoose = require("mongoose");

const connectDb = require("./config/db");

const {
    connectRedis,
    redisClient,
    redisSubscriber
} = require("./config/redis");


let worker;


const startWorker = async () => {

    await connectDb();
    await connectRedis();

    // Start BullMQ worker
    worker = require("./queue/document.worker");

    console.log(
        "Document worker process started"
    );
};


const shutdown = async (signal) => {

    console.log(
        `${signal} received. Shutting down worker gracefully...`
    );

    try {

        if (worker) {
            await worker.close();

            console.log(
                "BullMQ worker closed"
            );
        }


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


        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();

            console.log(
                "MongoDB connection closed"
            );
        }


        process.exit(0);

    } catch (error) {

        console.error(
            "Worker shutdown error:",
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


startWorker();