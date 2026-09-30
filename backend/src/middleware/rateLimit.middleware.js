const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { redisClient } = require("../config/redis");

const createLimiter = (keyPrefix, options) => rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) =>
            redisClient.sendCommand(args),
        prefix: `rate-limit:${keyPrefix}:`
    }),
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    },
    ...options
});

const loginLimiter = createLimiter("login", {
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true
});

const registrationLimiter = createLimiter("registration", {
    windowMs: 60 * 60 * 1000,
    limit: 5
});

const refreshLimiter = createLimiter("refresh", {
    windowMs: 15 * 60 * 1000,
    limit: 60
});

module.exports = {
    loginLimiter,
    registrationLimiter,
    refreshLimiter
};
