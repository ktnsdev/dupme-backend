const app = require("express")();
const server = require("http").createServer(app);

const {
    logger,
    PORT,
    setupSocket,
    setupFirebase,
    checkStructEnv,
} = require("./src/configs/config.js");
const Router = require("./src/routes/routes.js");

setupFirebase(app);
setupSocket(server, app);
Router(app).setup();
checkStructEnv();

server.listen(PORT, () => {
    logger.info(`Starting server on port ${PORT}...`);
});
