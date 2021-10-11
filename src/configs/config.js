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
function setupFirebase(app) {
    var err = initialiseFirebase(app);
    if (err !== undefined) {
        logger.error("FATAL: " + err.name);
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
