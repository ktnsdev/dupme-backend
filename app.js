const app = require("express")();
const server = require("http").createServer(app);

const { logger, PORT, setupSocket } = require("./src/configs/config.js");
const Router = require("./src/routes/routes.js");

Router(app).setup();
setupSocket(server);

server.listen(PORT, () => {
    logger.info(`Starting server on port ${PORT}...`);
});
