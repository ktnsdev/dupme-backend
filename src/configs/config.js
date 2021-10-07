require("dotenv").config();

const pino = require("pino");
const SocketListener = require("../socket/socket");
const logger = pino({
    enabled: process.env.NODE_ENV === "development",
    prettyPrint: {
        colorize: true,
        translateTime: true,
    },
});

function setupSocket(server) {
    SocketListener(server);
}

module.exports = {
    logger: logger,
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV,
    setupSocket,
};
