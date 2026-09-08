const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/auth/auth.routes");
const documentRoutes = require("./modules/document/document.routes");

const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(cors());

app.use(express.json());


// Routes

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "CollabSpace Backend Running"
    });

});


// Health check

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        instance: process.env.PORT || 5000
    });
});


app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/documents",
    documentRoutes
);


// Error middleware should always be last

app.use(errorHandler);


module.exports = app;