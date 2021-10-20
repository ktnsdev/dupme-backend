require("dotenv").config();

const pino = require("pino");
const { socketListener } = require("../socket/socket");
const { initialiseFirebase } = require("../firebase/firebase");
const logger = pino({
    enabled: process.env.NODE_ENV === "development",
    prettyPrint: {
        colorize: true,
        translateTime: true,
    },
});

/**
 * @param {import("http").Server} server - HTTP Server Object
 * @param {import("express").Application} app - Express Application from Express.js
 */
function setupSocket(server, app) {
    let err = socketListener(server, app);
    if (err !== undefined) {
        logger.error("FATAL: " + err.name);
        logger.error(err.message);
        process.exit(1);
    }
}

/**
 * @param {import("express").Application} app - Express Application from Express.js
 */
async function setupFirebase(app) {
    let err = await initialiseFirebase(app);
    if (err !== undefined) {
        logger.error("FATAL: " + err.name);
        logger.error(err.message);
        process.exit(1);
    }
}

function checkStructEnv() {
    if (process.env.JWT_SECRET === undefined) {
        logger.error(
            "FATAL: Authorization Secret Key hasn't been set. Please provide one before starting the server.",
        );
        process.exit(1);
    }
}

module.exports = {
    logger: logger,
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV,
    setupSocket,
    setupFirebase,
    checkStructEnv
};
