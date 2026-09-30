const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./modules/auth/auth.routes");
const documentRoutes = require("./modules/document/document.routes");

const errorHandler = require("./middleware/error.middleware");

const app = express();

if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());


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
