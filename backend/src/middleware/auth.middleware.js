const jwt = require("jsonwebtoken");
const User = require("../modules/auth/user.model");
const ApiError = require("../utils/ApiError");


const protect = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;


        if (!authHeader || !authHeader.startsWith("Bearer")) {

            throw new ApiError(
                401,
                "Authentication required"
            );

        }


        const token = authHeader.split(" ")[1];


        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );


        const user = await User.findById(
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


    } catch(error) {

        next(error);

    }

};


module.exports = protect;