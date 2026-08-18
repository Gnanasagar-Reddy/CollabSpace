const authService = require("./auth.service");
const sendResponse = require("../../utils/apiResponse");

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


        sendResponse(
            res,
            200,
            {
                user:{
                    id:user._id,
                    name:user.name,
                    email:user.email
                },
                accessToken,
                refreshToken
            },
            "Login successful"
        );

    } catch(error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        await authService.logoutUser(
            req.body.refreshToken
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
            req.body.refreshToken;
        const accessToken =
            await authService.refreshAccessToken(
                token
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