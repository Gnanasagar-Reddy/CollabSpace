const { createClient } = require("redis");

const redisClient = createClient({
    url:"redis://localhost:6379"
});

const redisSubscriber = redisClient.duplicate();

redisClient.on("error",(error)=>{
    console.log("Redis Client Error:",error);
});

redisSubscriber.on("error",(error)=>{
    console.log("Redis Subscriber Error:",error);
});

const connectRedis = async() => {

    await redisClient.connect();
    await redisSubscriber.connect();

    console.log("Redis connected");
};

module.exports = {
    redisClient,
    redisSubscriber,
    connectRedis
};