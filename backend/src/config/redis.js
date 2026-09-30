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

const closeRedis = async () => {
    const clients = [
        socketSubscriber,
        socketPublisher,
        redisClient
    ];

    for (const client of clients) {
        if (client.isOpen) {
            await client.quit();
        }
    }
};


module.exports = {

    redisClient,

    socketPublisher,

    socketSubscriber,

    connectRedis,

    closeRedis

};
