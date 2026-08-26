require("dotenv").config();

const connectDB =
    require("../config/db");

const collaborationServer =
    require("./collaboration.server");

const start = async () => {
    await connectDB();

    collaborationServer.listen();
};

start();