const express = require("express");

const router = express.Router();

const {
    register,
    login,
    refreshToken,
    logout
} = require("./auth.controller");

const protect = require("../../middleware/auth.middleware");
const {
    loginLimiter,
    registrationLimiter,
    refreshLimiter
} = require("../../middleware/rateLimit.middleware");

router.post(
    "/register",
    registrationLimiter,
    register
);

router.post(
    "/login",
    loginLimiter,
    login
);

router.post(
    "/refresh-token",
    refreshLimiter,
    refreshToken
);

router.post("/logout", logout);

router.get("/me", protect, (req, res) => {

    res.json({

        success:true,

        user:req.user

    });

});

module.exports = router;
