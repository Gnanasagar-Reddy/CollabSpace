const { createClient } = require("redis");


const redisClient = createClient({
    url: process.env.REDIS_URL
});


const socketPublisher =
    redisClient.duplicate();


const socketSubscriber =
    redisClient.duplicate();


redisClient.on(
    "error",
    (error) => {
        console.log(
            "Redis Client Error:",
            error
        );
    }
);


socketPublisher.on(
    "error",
    (error) => {
        console.log(
            "Socket.IO Publisher Error:",
            error
        );
    }
);


socketSubscriber.on(
    "error",
    (error) => {
        console.log(
            "Socket.IO Subscriber Error:",
            error
        );
    }
);


const connectRedis = async () => {

    await redisClient.connect();

    await socketPublisher.connect();

    await socketSubscriber.connect();


    console.log(
        "Redis connected"
    );

};


module.exports = {

    redisClient,

    socketPublisher,

    socketSubscriber,

    connectRedis

};