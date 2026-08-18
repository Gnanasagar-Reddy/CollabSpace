const jwt = require("jsonwebtoken");


const socketAuth = (socket, next) => {

    try {

        const token =
            socket.handshake.auth.token;


        if (!token) {

            return next(
                new Error("Authentication required")
            );

        }


        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );


        socket.user = decoded.userId;


        next();

    }
    catch (error) {

        console.log(
            "SOCKET JWT ERROR:",
            error.message
        );

        next(new Error("Invalid token"));
    }

};


module.exports = socketAuth;