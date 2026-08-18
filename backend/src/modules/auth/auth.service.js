const bcrypt = require("bcrypt");
const User = require("./user.model");
const ApiError = require("../../utils/ApiError");
const generateToken = require("../../utils/jwt");
const jwt = require("jsonwebtoken");
const RefreshToken = require("./refreshToken.model");

const {
    generateAccessToken,
    generateRefreshToken
} = require("../../utils/jwt");

const registerUser = async (userData) => {

    const existingUser = await User.findOne({
        email: userData.email
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        avatar: userData.avatar
    });

    return user;
};


const loginUser = async (email, password) => {

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const accessToken =
        generateAccessToken(user._id);


    const refreshToken =
        generateRefreshToken(user._id);


    await RefreshToken.create({

        user: user._id,

        token: refreshToken,

        expiresAt:
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    });

    console.log({
        accessToken,
        refreshToken
    });

    return {
        user,
        accessToken,
        refreshToken
    };
};

const refreshAccessToken = async (refreshToken) => {

    const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
    );


    const storedToken = await RefreshToken.findOne({
        token: refreshToken,
        user: decoded.userId
    });


    if (!storedToken) {

        throw new ApiError(
            401,
            "Invalid refresh token"
        );

    }


    const newAccessToken = generateAccessToken(
        decoded.userId
    );


    return newAccessToken;

};

const logoutUser = async (refreshToken) => {

    await RefreshToken.deleteOne({
        token: refreshToken
    });

};
module.exports = {

    registerUser,

    loginUser,

    refreshAccessToken,

    logoutUser

};