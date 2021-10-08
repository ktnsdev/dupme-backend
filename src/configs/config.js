require("dotenv").config();

const pino = require("pino");
const SocketListener = require("../socket/socket");
const { initialiseFirebase } = require("../firebase/firebase");
const logger = pino({
    enabled: process.env.NODE_ENV === "development",
    prettyPrint: {
        colorize: true,
        translateTime: true,
    },
});

function setupSocket(server, app) {
    SocketListener(server, app);
}

function setupFirebase(app) {
    var err = initialiseFirebase(app);
    if (err !== undefined) {
        logger.error("ERROR: " + err.error);
        logger.error(err.message);
        process.exit(1);
    }
}

module.exports = {
    logger: logger,
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV,
    setupSocket,
    setupFirebase,
};
