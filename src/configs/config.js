require("dotenv").config();

const pino = require("pino");
const logger = pino({
    enabled: process.env.NODE_ENV === "development",
    prettyPrint: {
        colorize: true,
        translateTime: true,
    },
});

module.exports = { logger: logger, PORT: process.env.PORT || 3000, NODE_ENV: process.env.NODE_ENV };
