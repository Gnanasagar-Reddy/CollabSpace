const asyncHandler = require("../../utils/asyncHandler");
const authService = require("./auth.service");
const sendResponse = require("../../utils/apiResponse");

const REFRESH_TOKEN_MAX_AGE =
    7 * 24 * 60 * 60 * 1000;

const useCrossSiteCookies =
    process.env.CROSS_SITE_COOKIES === "true";

const refreshTokenCookieOptions = {
    httpOnly: true,
    secure:
        process.env.NODE_ENV === "production" ||
        useCrossSiteCookies,
    sameSite: useCrossSiteCookies
        ? "none"
        : "lax",
    path: "/api/auth"
};

const register = asyncHandler(async (req, res) => {
    const user = await authService.registerUser(req.body);
    sendResponse(
        res,
        201,
        {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        },
        "User registered successfully"
    );
});
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } =
        await authService.loginUser(
            email,
            password
        );

    res.cookie(
        "refreshToken",
        refreshToken,
        {
            ...refreshTokenCookieOptions,
            maxAge: REFRESH_TOKEN_MAX_AGE
        }
    );

    sendResponse(
        res,
        200,
        {
            user:{
                id:user._id,
                name:user.name,
                email:user.email
            },
            accessToken
        },
        "Login successful"
    );
});

const logout = asyncHandler(async (req, res) => {
    const refreshToken =
        req.cookies.refreshToken;

    if (refreshToken) {
        await authService.logoutUser(
            refreshToken
        );
    }

    res.clearCookie(
        "refreshToken",
        refreshTokenCookieOptions
    );
    sendResponse(
        res,
        200,
        null,
        "Logged out successfully"
    );
});

const refreshToken = asyncHandler(async (req, res) => {
    const token =
        req.cookies.refreshToken;
    const {
        accessToken,
        refreshToken
    } =
        await authService.refreshAccessToken(
            token
        );

    res.cookie(
        "refreshToken",
        refreshToken,
        {
            ...refreshTokenCookieOptions,
            maxAge: REFRESH_TOKEN_MAX_AGE
        }
    );
    sendResponse(
        res,
        200,
        {
            accessToken
        },
        "Token refreshed"
    );
});
module.exports = {
    register,
    login,
    refreshToken,
    logout
};
