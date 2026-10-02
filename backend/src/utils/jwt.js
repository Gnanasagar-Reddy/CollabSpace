const jwt = require("jsonwebtoken");
const { randomUUID } = require("node:crypto");

const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn:"15m"
        }
    );

};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn:"7d",
            jwtid: randomUUID()
        }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken
};
