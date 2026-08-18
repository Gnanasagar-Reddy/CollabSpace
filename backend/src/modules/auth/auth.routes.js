const express = require("express");

const router = express.Router();

const {
    register,
    login,
    refreshToken,
    logout
} = require("./auth.controller");

const protect = require("../../middleware/auth.middleware");

router.post("/register", register);

router.post("/login", login);

router.post("/refresh-token", refreshToken);

router.post("/logout", logout);

router.get("/me", protect, (req, res) => {

    res.json({

        success:true,

        user:req.user

    });

});

module.exports = router;