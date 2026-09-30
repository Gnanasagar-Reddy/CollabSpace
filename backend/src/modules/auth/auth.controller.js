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

const register = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);

    }
};
const login = async (req, res, next) => {

    try {

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

    } catch(error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
    }
};
module.exports = {
    register,
    login,
    refreshToken,
    logout
};
