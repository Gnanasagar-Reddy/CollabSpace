const bcrypt = require("bcrypt");
const User = require("./user.model");
const ApiError = require("../../utils/ApiError");
const jwt = require("jsonwebtoken");
const RefreshToken = require("./refreshToken.model");

const {
    generateAccessToken,
    generateRefreshToken
} = require("../../utils/jwt");

const REFRESH_TOKEN_LIFETIME =
    7 * 24 * 60 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;
const MAX_NAME_LENGTH = 100;

const normalizeEmail = (email) => {
    if (typeof email !== "string") {
        return null;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return null;
    }

    return cleanEmail;
};

const validateRegistrationData = (userData) => {
    const name =
        typeof userData?.name === "string"
            ? userData.name.trim()
            : null;
    const email = normalizeEmail(userData?.email);
    const password = userData?.password;

    if (
        !name ||
        name.length > MAX_NAME_LENGTH
    ) {
        throw new ApiError(
            400,
            "Name must be between 1 and 100 characters"
        );
    }

    if (!email) {
        throw new ApiError(
            400,
            "A valid email address is required"
        );
    }

    if (
        typeof password !== "string" ||
        password.length < MIN_PASSWORD_LENGTH ||
        password.length > MAX_PASSWORD_LENGTH
    ) {
        throw new ApiError(
            400,
            "Password must be between 6 and 128 characters"
        );
    }

    return {
        name,
        email,
        password,
        avatar: typeof userData?.avatar === "string"
            ? userData.avatar
            : ""
    };
};

const issueRefreshToken = async (userId) => {
    const refreshToken = generateRefreshToken(userId);

    await RefreshToken.create({
        user: userId,
        token: refreshToken,
        expiresAt: new Date(
            Date.now() + REFRESH_TOKEN_LIFETIME
        )
    });

    return refreshToken;
};

const registerUser = async (userData) => {
    const {
        name,
        email,
        password,
        avatar
    } = validateRegistrationData(userData);

    const existingUser = await User.findOne({
        email
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    try {
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            avatar
        });
    } catch (error) {
        if (error?.code === 11000) {
            throw new ApiError(409, "User already exists");
        }

        throw error;
    }

    return user;
};


const loginUser = async (email, password) => {
    const normalizedEmail = normalizeEmail(email);

    if (
        !normalizedEmail ||
        typeof password !== "string"
    ) {
        throw new ApiError(401, "Invalid email or password");
    }

    const user = await User.findOne({
        email: normalizedEmail
    });

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


    const refreshToken = await issueRefreshToken(
        user._id
    );

    return {
        user,
        accessToken,
        refreshToken
    };
};

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(
            401,
            "Refresh token is required"
        );
    }

    let decoded;

    try {
        decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );
    } catch (error) {
        throw new ApiError(
            401,
            "Invalid or expired refresh token"
        );
    }


    const storedToken =
        await RefreshToken.findOneAndDelete({
            token: refreshToken,
            user: decoded.userId,
            expiresAt: {
                $gt: new Date()
            }
        });

    if (!storedToken) {
        throw new ApiError(
            401,
            "Invalid or expired refresh token"
        );
    }

    const newRefreshToken = await issueRefreshToken(
        decoded.userId
    );

    const accessToken = generateAccessToken(
        decoded.userId
    );

    return {
        accessToken,
        refreshToken: newRefreshToken
    };
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
