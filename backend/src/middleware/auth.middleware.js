const jwt = require("jsonwebtoken");
const User = require("../modules/auth/user.model");
const ApiError = require("../utils/ApiError");


const protect = async (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer")
        ) {

            throw new ApiError(
                401,
                "Authentication required"
            );

        }


        const token =
            authHeader.split(" ")[1];


        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );


        const user =
            await User.findById(
                decoded.userId
            ).select("-password");


        if (!user) {

            throw new ApiError(
                401,
                "User not found"
            );

        }


        req.user = user;


        next();


    } catch (error) {

        if (
            error.name ===
            "TokenExpiredError"
        ) {

            return next(
                new ApiError(
                    401,
                    "Access token expired"
                )
            );

        }


        if (
            error.name ===
            "JsonWebTokenError"
        ) {

            return next(
                new ApiError(
                    401,
                    "Invalid access token"
                )
            );

        }


        next(error);

    }

};


module.exports = protect;